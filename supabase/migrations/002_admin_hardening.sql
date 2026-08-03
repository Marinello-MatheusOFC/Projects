-- 002_admin_hardening.sql
-- Hardening da área administrativa: FKs faltantes, soft-deletes, proteção último superadmin.
-- NÃO ALTERA a migration 001 já aplicada. É apenas complementar e segura.

-- ═══════════════════════════════════════════════════════════
-- 1. Garantir FK real de products.category_id → categories.id
-- (Na migration 001 a referência foi declarada mas sem ADD CONSTRAINT)
-- ═══════════════════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'products_category_id_fkey'
      AND table_schema = 'public'
      AND table_name = 'products'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════
-- 2. Soft-delete em gallery_albums (antes era hard delete)
--    para manter auditoria e permitir restauração futura.
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.gallery_albums
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_gallery_albums_deleted
  ON public.gallery_albums(deleted_at) WHERE deleted_at IS NULL;

-- Atualizar políticas públicas e de admin para considerar deleted_at
DROP POLICY IF EXISTS "Público pode ler álbuns publicados" ON public.gallery_albums;
CREATE POLICY "Público pode ler álbuns publicados"
  ON public.gallery_albums FOR SELECT
  USING (published = TRUE AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admin pode gerenciar álbuns" ON public.gallery_albums;
CREATE POLICY "Admin pode gerenciar álbuns"
  ON public.gallery_albums FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Trigger updated_at caso ainda não exista
DROP TRIGGER IF EXISTS set_gallery_albums_updated_at ON public.gallery_albums;
CREATE TRIGGER set_gallery_albums_updated_at
  BEFORE UPDATE ON public.gallery_albums
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ═══════════════════════════════════════════════════════════
-- 3. Soft-delete em contact_messages
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_contact_messages_deleted
  ON public.contact_messages(deleted_at) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS set_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER set_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ═══════════════════════════════════════════════════════════
-- 4. Soft-delete em volunteer_applications
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.volunteer_applications
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_volunteer_applications_deleted
  ON public.volunteer_applications(deleted_at) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS set_volunteer_applications_updated_at ON public.volunteer_applications;
CREATE TRIGGER set_volunteer_applications_updated_at
  BEFORE UPDATE ON public.volunteer_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ═══════════════════════════════════════════════════════════
-- 5. Proteger último superadmin:
--    - Não permitir desativar
--    - Não permitir rebaixar para admin
--    - Garantia no banco (RLS protege apenas superadmin editar,
--      mas essa trigger evita tiro no pé do próprio superadmin).
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.protect_last_superadmin()
RETURNS TRIGGER AS $$
DECLARE
  super_count INTEGER;
BEGIN
  -- Conta superadmins ativos (excluindo o próprio row se for UPDATE/DELETE)
  SELECT COUNT(*) INTO super_count
  FROM public.profiles
  WHERE role = 'superadmin'
    AND active = TRUE
    AND (TG_OP = 'INSERT' OR id <> OLD.id);

  -- Caso 1: UPDATE tentando desativar OU rebaixar o último superadmin
  IF TG_OP = 'UPDATE' THEN
    IF OLD.role = 'superadmin'
       AND super_count = 0
       AND (NEW.active = FALSE OR NEW.role <> 'superadmin') THEN
      RAISE EXCEPTION 'Não é permitido desativar ou rebaixar o último superadmin.';
    END IF;
  END IF;

  -- Caso 2: DELETE tentando apagar o último superadmin
  IF TG_OP = 'DELETE' THEN
    IF OLD.role = 'superadmin' AND super_count = 0 THEN
      RAISE EXCEPTION 'Não é permitido excluir o último superadmin.';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_last_superadmin_trigger ON public.profiles;
CREATE TRIGGER protect_last_superadmin_trigger
  BEFORE UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_last_superadmin();

-- ═══════════════════════════════════════════════════════════
-- 6. Garantir que signup automático não crie admin por padrão.
--    O trigger original define role='admin' para QUALQUER signup.
--    Como a UI pública NÃO tem signup, só um risco de API.
--    Ajustamos para: só superadmin pode criar novos admins via
--    trigger. Mas por segurança, novos signups SEM profile
--    administrativo recebem role = 'user' (que falha na policy).
--    Como temos CHECK (role IN ('admin','superadmin')), preferimos
--    BLOQUEAR signups arbitrários: só quem tem email já
--    pré-cadastrado por superadmin (via raw_user_meta_data OU
--    whitelist). Solução: validar email no trigger ou então
--    criar profile SEM role default válido (vai falhar).
--    Escolhemos lançar erro explícito para signups não autorizados
--    a menos que whitelist em settings ou email em domínio ONG.
--    Implementação mínima e segura: manter o trigger mas exigir
--    que raw_user_meta_data.admin_setup = true OU que já exista
--    um superadmin convidando (neste projeto o admin cria usuário
--    diretamente no painel ou no Supabase dashboard).
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  has_super INTEGER;
BEGIN
  -- Se já existe pelo menos 1 superadmin no banco, então signups
  -- públicos NÃO DEVEM gerar perfil admin automaticamente.
  SELECT COUNT(*) INTO has_super FROM public.profiles WHERE role = 'superadmin';

  IF has_super > 0 THEN
    -- Se o signup veio com admin_setup=true em meta, permitir.
    IF COALESCE(NEW.raw_user_meta_data->>'admin_setup', 'false') <> 'true' THEN
      -- Não criamos perfil. O login falhará na checagem de profile
      -- em LoginPage (sem profile = sem acesso admin).
      RETURN NEW;
    END IF;
  END IF;

  -- Caso 1: primeiro usuário do sistema → vira superadmin (bootstrap).
  -- Caso 2: admin_setup=true → usa role da meta ou default admin.
  IF has_super = 0 THEN
    INSERT INTO public.profiles (id, full_name, role, active)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Superadministrador'), 'superadmin', TRUE);
  ELSE
    INSERT INTO public.profiles (id, full_name, role, active)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
      COALESCE(NEW.raw_user_meta_data->>'role', 'admin')::TEXT,
      COALESCE((NEW.raw_user_meta_data->>'active')::BOOLEAN, TRUE)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════
-- 7. Trigger automático de audit_logs em ações críticas.
--    (Reduz carga de implementar logAudit em todo lugar do app,
--    e funciona mesmo se houver edição direta via SQL console.)
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.log_audit_from_trigger()
RETURNS TRIGGER AS $$
DECLARE
  ent_id TEXT;
  action TEXT;
  meta JSONB;
  ent_type TEXT;
BEGIN
  ent_type := TG_ARGV[0];

  IF TG_OP = 'INSERT' THEN action := 'criar'; ent_id := NEW.id::TEXT; meta := to_jsonb(NEW); END IF;
  IF TG_OP = 'UPDATE' THEN action := 'editar'; ent_id := NEW.id::TEXT; meta := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)); END IF;
  IF TG_OP = 'DELETE' THEN action := 'excluir'; ent_id := OLD.id::TEXT; meta := to_jsonb(OLD); END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), action, ent_type, ent_id, meta);

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NOTA: Triggers de audit são aplicados em tabelas críticas apenas
-- (não em tabelas de inserção pública como adoption_applications,
-- para não registrar dados pessoais sensíveis em log metadata com
-- LGPD). Abaixo, triggers apenas para conteúdo editável por admin.

DROP TRIGGER IF EXISTS audit_animals_trg ON public.animals;
CREATE TRIGGER audit_animals_trg
  AFTER INSERT OR UPDATE OR DELETE ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_from_trigger('animal');

DROP TRIGGER IF EXISTS audit_events_trg ON public.events;
CREATE TRIGGER audit_events_trg
  AFTER INSERT OR UPDATE OR DELETE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_from_trigger('event');

DROP TRIGGER IF EXISTS audit_news_trg ON public.news_posts;
CREATE TRIGGER audit_news_trg
  AFTER INSERT OR UPDATE OR DELETE ON public.news_posts
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_from_trigger('news');

DROP TRIGGER IF EXISTS audit_products_trg ON public.products;
CREATE TRIGGER audit_products_trg
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_from_trigger('product');

DROP TRIGGER IF EXISTS audit_settings_trg ON public.site_settings;
CREATE TRIGGER audit_settings_trg
  AFTER INSERT OR UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_from_trigger('setting');

DROP TRIGGER IF EXISTS audit_profiles_trg ON public.profiles;
CREATE TRIGGER audit_profiles_trg
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_from_trigger('profile');
