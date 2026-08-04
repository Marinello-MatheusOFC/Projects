-- =====================================================================================
-- BANCO COMPLETO — SOS Focinho Carente (Painel Administrativo + Site Público)
-- =====================================================================================
--
-- Gerado em: 2026
-- Projeto: SOS Focinho Carente
-- Arquivo: BANCO_COMPLETO.sql (tudo em 1 arquivo único)
--
-- CONTÉM, NA ORDEM CORRETA:
--   1. Funções utilitárias (handle_updated_at, is_admin, is_superadmin)
--   2. Schema completo com TODAS as tabelas + índices + RLS policies
--   3. Triggers de signup automático (cria profile)
--   4. Hardening do admin (FKs, soft-deletes, protege último superadmin, audit logs automáticos)
--   5. Seed de categorias de exemplo (roupas, acessórios, notícias etc.)
--   6. USUÁRIOS ADMIN prontos para login
--
-- =====================================================================================
-- COMO USAR (PASSO A PASSO NO SUPABASE):
-- =====================================================================================
--   1. Acesse https://app.supabase.com  →  selecione seu projeto SOS Focinho Carente
--   2. Menu esquerdo  →  SQL Editor (ícone de folha 📋, último antes de Settings)
--   3. Clique em  New query / Nova consulta
--   4. Copie TODO este arquivo (Ctrl + A  →  Ctrl + C) e cole no editor (Ctrl + V)
--   5. (Opcional) Antes de rodar: procure por "super123" e "admin123" e troque as senhas!
--   6. Clique no botão azul "Run" / "Executar" ▶️
--   7. PRONTO! As últimas 2 tabelas do resultado mostram os usuários criados.
--
-- =====================================================================================
-- CREDENCIAIS CRIADAS NO PASSO 6 (você pode trocar as senhas ANTES de rodar):
-- =====================================================================================
--   | Perfil       | E-mail                                    | Senha      |
--   |--------------+-------------------------------------------+------------|
--   | Superadmin   | superadmin@sosfocinhocarente.org.br       | super123   |
--   | Admin        | admin@sosfocinhocarente.org.br            | admin123   |
--
-- =====================================================================================
--   AVISO: Rode este arquivo apenas em BANCO NOVO / VAZIO.
--   Se você já tiver dados, as constraints de UNIQUE vão impedir duplicatas
--   (os inserts usam ON CONFLICT DO NOTHING para ser seguro).
-- =====================================================================================

-- =====================================================================================
-- PARTE 1/5 — FUNÇÕES UTILITÁRIAS E DE AUTORIZAÇÃO
-- =====================================================================================

-- Função para updated_at automático (usada em TODAS as tabelas)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se usuário é admin (protege RLS policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
      AND active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'superadmin'
      AND active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================================
-- PARTE 2/5 — SCHEMA COMPLETO: TODAS TABELAS + ÍNDICES + RLS POLICIES
-- =====================================================================================

-- ─────────────────────────────────────────────────────────────────────
-- TABELA: profiles  (perfil dos usuários admin)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (char_length(full_name) >= 2),
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE POLICY "Usuários podem ver próprio perfil"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Superadmin pode ver todos os perfis"
  ON public.profiles FOR SELECT
  USING (public.is_superadmin());

CREATE POLICY "Superadmin pode atualizar perfis"
  ON public.profiles FOR UPDATE
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- Trigger inicial para criar profile após signup — depois substituído no hardening
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'), 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────
-- TABELA: animals  (animais para adoção)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'other')),
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  birth_date_estimate DATE,
  age_text TEXT,
  description TEXT,
  history TEXT,
  health_notes TEXT,
  personality TEXT,
  compatibility_notes TEXT,
  vaccinated BOOLEAN NOT NULL DEFAULT FALSE,
  neutered BOOLEAN NOT NULL DEFAULT FALSE,
  special_needs BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'adopted', 'in_process', 'archived')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_animals_updated_at
  BEFORE UPDATE ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_animals_slug ON public.animals(slug);
CREATE INDEX idx_animals_status ON public.animals(status);
CREATE INDEX idx_animals_published ON public.animals(published) WHERE published = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_animals_featured ON public.animals(featured) WHERE featured = TRUE;
CREATE INDEX idx_animals_species ON public.animals(species);
CREATE INDEX idx_animals_deleted ON public.animals(deleted_at) WHERE deleted_at IS NULL;

CREATE POLICY "Público pode ler animais publicados"
  ON public.animals FOR SELECT
  USING (published = TRUE AND deleted_at IS NULL);

CREATE POLICY "Admin pode gerenciar animais"
  ON public.animals FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- TABELA: animal_images  (fotos dos animais)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.animal_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt_text TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.animal_images ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_animal_images_animal ON public.animal_images(animal_id);

CREATE POLICY "Público pode ler imagens de animais publicados"
  ON public.animal_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.animals
      WHERE id = animal_id AND published = TRUE AND deleted_at IS NULL
    )
  );

CREATE POLICY "Admin pode gerenciar imagens"
  ON public.animal_images FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- TABELA: adoption_applications  (solicitações de adoção)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.adoption_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES public.animals(id),
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  city TEXT NOT NULL,
  housing_type TEXT NOT NULL CHECK (housing_type IN ('house', 'apartment', 'other')),
  has_protective_screens BOOLEAN NOT NULL DEFAULT FALSE,
  has_other_animals BOOLEAN NOT NULL DEFAULT FALSE,
  household_agreement BOOLEAN NOT NULL DEFAULT FALSE,
  reason TEXT NOT NULL,
  availability TEXT NOT NULL,
  privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'contacted', 'interview', 'approved', 'rejected', 'cancelled', 'completed')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.adoption_applications ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_adoption_applications_updated_at
  BEFORE UPDATE ON public.adoption_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_adoption_applications_status ON public.adoption_applications(status);
CREATE INDEX idx_adoption_applications_animal ON public.adoption_applications(animal_id);

CREATE POLICY "Visitante pode inserir solicitação"
  ON public.adoption_applications FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admin pode gerenciar solicitações"
  ON public.adoption_applications FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- TABELA: adoption_status_history  (histórico de status de adoção)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.adoption_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.adoption_applications(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT,
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.adoption_status_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_adoption_history_application ON public.adoption_status_history(application_id);

CREATE POLICY "Admin pode ler histórico"
  ON public.adoption_status_history FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin pode criar histórico"
  ON public.adoption_status_history FOR INSERT
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- TABELA: events  (eventos da ONG)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  location_name TEXT,
  address TEXT,
  external_url TEXT,
  image_path TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_events_start ON public.events(start_at);
CREATE INDEX idx_events_published ON public.events(published) WHERE published = TRUE AND deleted_at IS NULL;

CREATE POLICY "Público pode ler eventos publicados"
  ON public.events FOR SELECT
  USING (published = TRUE AND deleted_at IS NULL);

CREATE POLICY "Admin pode gerenciar eventos"
  ON public.events FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- TABELA: news_posts  (notícias / blog)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image_path TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_news_posts_updated_at
  BEFORE UPDATE ON public.news_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_news_slug ON public.news_posts(slug);
CREATE INDEX idx_news_status ON public.news_posts(status) WHERE status = 'published' AND deleted_at IS NULL;

CREATE POLICY "Público pode ler notícias publicadas"
  ON public.news_posts FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Admin pode gerenciar notícias"
  ON public.news_posts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- TABELA: categories  (categorias de produtos / notícias)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Público pode ler categorias"
  ON public.categories FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin pode gerenciar categorias"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- TABELA: post_categories  (relacionamento N:N notícias ↔ categorias)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.post_categories (
  post_id UUID NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Público pode ler post_categories"
  ON public.post_categories FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin pode gerenciar post_categories"
  ON public.post_categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- TABELA: products  (produtos do brechó)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category_id UUID REFERENCES public.categories(id),
  image_path TEXT,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_published ON public.products(published) WHERE published = TRUE AND deleted_at IS NULL;

CREATE POLICY "Público pode ler produtos publicados"
  ON public.products FOR SELECT
  USING (published = TRUE AND deleted_at IS NULL);

CREATE POLICY "Admin pode gerenciar produtos"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- TABELA: contact_messages  (mensagens do "Fale conosco")
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);

CREATE POLICY "Visitante pode inserir mensagem"
  ON public.contact_messages FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admin pode gerenciar mensagens"
  ON public.contact_messages FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- TABELA: volunteer_applications  (inscrições para voluntariado)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  availability TEXT NOT NULL,
  interests TEXT NOT NULL,
  experience TEXT,
  message TEXT,
  privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'contacted', 'approved', 'rejected', 'archived')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_volunteer_applications_updated_at
  BEFORE UPDATE ON public.volunteer_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_volunteer_applications_status ON public.volunteer_applications(status);

CREATE POLICY "Visitante pode inserir inscrição"
  ON public.volunteer_applications FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admin pode gerenciar inscrições"
  ON public.volunteer_applications FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- TABELA: gallery_albums  (álbuns da galeria de fotos)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_path TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_gallery_albums_updated_at
  BEFORE UPDATE ON public.gallery_albums
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_gallery_albums_slug ON public.gallery_albums(slug);
CREATE INDEX idx_gallery_albums_published ON public.gallery_albums(published) WHERE published = TRUE;

CREATE POLICY "Público pode ler álbuns publicados"
  ON public.gallery_albums FOR SELECT
  USING (published = TRUE);

CREATE POLICY "Admin pode gerenciar álbuns"
  ON public.gallery_albums FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- TABELA: gallery_images  (fotos dentro dos álbuns)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_gallery_images_album ON public.gallery_images(album_id);

CREATE POLICY "Público pode ler imagens de álbuns publicados"
  ON public.gallery_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gallery_albums
      WHERE id = album_id AND published = TRUE
    )
  );

CREATE POLICY "Admin pode gerenciar imagens da galeria"
  ON public.gallery_images FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- TABELA: site_settings  (configurações do site)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value_json JSONB NOT NULL DEFAULT '{}',
  public BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE POLICY "Público pode ler configurações públicas"
  ON public.site_settings FOR SELECT
  USING (public = TRUE);

CREATE POLICY "Admin pode gerenciar configurações"
  ON public.site_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- TABELA: audit_logs  (log de auditoria — lê só superadmin)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

CREATE POLICY "Superadmin pode ler logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_superadmin());

CREATE POLICY "Sistema pode inserir logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.is_admin());

-- =====================================================================================
-- PARTE 3/5 — HARDENING / SEGURANÇA ADICIONAL (migration 002)
-- =====================================================================================

-- 1. Garante FK real de products.category_id → categories.id
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

-- 2. Soft-delete em gallery_albums (antes era hard delete)
ALTER TABLE public.gallery_albums
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_gallery_albums_deleted
  ON public.gallery_albums(deleted_at) WHERE deleted_at IS NULL;

DROP POLICY IF EXISTS "Público pode ler álbuns publicados" ON public.gallery_albums;
CREATE POLICY "Público pode ler álbuns publicados"
  ON public.gallery_albums FOR SELECT
  USING (published = TRUE AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admin pode gerenciar álbuns" ON public.gallery_albums;
CREATE POLICY "Admin pode gerenciar álbuns"
  ON public.gallery_albums FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS set_gallery_albums_updated_at ON public.gallery_albums;
CREATE TRIGGER set_gallery_albums_updated_at
  BEFORE UPDATE ON public.gallery_albums
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Soft-delete em contact_messages
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_contact_messages_deleted
  ON public.contact_messages(deleted_at) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS set_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER set_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Soft-delete em volunteer_applications
ALTER TABLE public.volunteer_applications
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_volunteer_applications_deleted
  ON public.volunteer_applications(deleted_at) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS set_volunteer_applications_updated_at ON public.volunteer_applications;
CREATE TRIGGER set_volunteer_applications_updated_at
  BEFORE UPDATE ON public.volunteer_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Proteger último superadmin (não permite desativar nem rebaixar nem excluir o último)
CREATE OR REPLACE FUNCTION public.protect_last_superadmin()
RETURNS TRIGGER AS $$
DECLARE
  super_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO super_count
  FROM public.profiles
  WHERE role = 'superadmin'
    AND active = TRUE
    AND (TG_OP = 'INSERT' OR id <> OLD.id);

  IF TG_OP = 'UPDATE' THEN
    IF OLD.role = 'superadmin'
       AND super_count = 0
       AND (NEW.active = FALSE OR NEW.role <> 'superadmin') THEN
      RAISE EXCEPTION 'Não é permitido desativar ou rebaixar o último superadmin.';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.role = 'superadmin' AND super_count = 0 THEN
      RAISE EXCEPTION 'Não é permitido excluir o último superadmin.';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_last_superadmin_trigger ON public.profiles;
CREATE TRIGGER protect_last_superadmin_trigger
  BEFORE UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_last_superadmin();

-- 6. Trigger handle_new_user SEGURA (bootstrap do primeiro superadmin +
--    bloqueia signups públicos aleatórios de virarem admin automaticamente)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  has_super INTEGER;
BEGIN
  SELECT COUNT(*) INTO has_super FROM public.profiles WHERE role = 'superadmin';

  IF has_super > 0 THEN
    IF COALESCE(NEW.raw_user_meta_data->>'admin_setup', 'false') <> 'true' THEN
      RETURN NEW;
    END IF;
  END IF;

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

-- 7. Triggers automáticos de AUDIT LOG → REMOVIDOS (ver migration 004).
--    Auditoria é feita exclusivamente pela camada de aplicação (logAudit)
--    para evitar duplicação e garantir labels semânticos nos logs.
--    O bloco abaixo foi removido; se precisar, veja migration 001 ou 002.
-- (função log_audit_from_trigger removida — ver 004_drop_audit_triggers.sql)
-- (triggers e função removidos — ver 004_drop_audit_triggers.sql)

-- =====================================================================================
-- PARTE 4/5 — SEED INICIAL: CATEGORIAS (roupas, acessórios, notícias etc.)
-- =====================================================================================

INSERT INTO public.categories (id, name, slug, type) VALUES
  (gen_random_uuid(), 'Roupas',    'roupas',     'product'),
  (gen_random_uuid(), 'Acessórios','acessorios', 'product'),
  (gen_random_uuid(), 'Decoração', 'decoracao',  'product'),
  (gen_random_uuid(), 'Adoção',    'adocao',     'news'),
  (gen_random_uuid(), 'Eventos',   'eventos',    'news'),
  (gen_random_uuid(), 'Dicas',     'dicas',      'news')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================================================
-- PARTE 5/5 — USUÁRIOS ADMIN PRONTOS PARA LOGIN
-- =====================================================================================
-- Se quiser senhas diferentes, edite as palavras 'super123' e 'admin123' ABAIXO
-- ANTES de rodar o script.
-- =====================================================================================

-- USUÁRIO 1 — SUPERADMIN
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, created_at, updated_at, phone, phone_confirmed_at,
    phone_change, phone_change_token, phone_change_sent_at, banned_until,
    reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    'superadmin@sosfocinhocarente.org.br',
    crypt('super123', gen_salt('bf')),
    NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Superadmin SOS"}'::jsonb,
    FALSE, NOW(), NOW(), NULL, NULL, '', '', NULL, NULL, '', NULL, FALSE, NULL
)
ON CONFLICT (email) DO NOTHING;

-- USUÁRIO 2 — ADMIN COMUM
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, created_at, updated_at, phone, phone_confirmed_at,
    phone_change, phone_change_token, phone_change_sent_at, banned_until,
    reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    'admin@sosfocinhocarente.org.br',
    crypt('admin123', gen_salt('bf')),
    NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Administrador SOS"}'::jsonb,
    FALSE, NOW(), NOW(), NULL, NULL, '', '', NULL, NULL, '', NULL, FALSE, NULL
)
ON CONFLICT (email) DO NOTHING;

-- Garante que os profiles existam e estejam com ROLE correto
-- (Se o trigger handle_new_user rodou antes, garante o role anyway)

-- SUPERADMIN profile
INSERT INTO public.profiles (id, full_name, role, active)
SELECT
    id,
    COALESCE(raw_user_meta_data->>'full_name', 'Superadmin SOS'),
    'superadmin',
    TRUE
FROM auth.users
WHERE email = 'superadmin@sosfocinhocarente.org.br'
ON CONFLICT (id) DO UPDATE
SET
    full_name = EXCLUDED.full_name,
    role = 'superadmin',
    active = TRUE,
    updated_at = NOW();

-- ADMIN comum profile
INSERT INTO public.profiles (id, full_name, role, active)
SELECT
    id,
    COALESCE(raw_user_meta_data->>'full_name', 'Administrador SOS'),
    'admin',
    TRUE
FROM auth.users
WHERE email = 'admin@sosfocinhocarente.org.br'
ON CONFLICT (id) DO UPDATE
SET
    full_name = EXCLUDED.full_name,
    role = 'admin',
    active = TRUE,
    updated_at = NOW();

-- =====================================================================================
--  ✅  VERIFICAÇÃO FINAL  —  Resultado dessa query mostra se DEU TUDO CERTO
-- =====================================================================================
-- (Essa consulta NÃO modifica nada — só mostra o status atual dos 2 usuários)
SELECT
    u.email,
    CASE WHEN u.email_confirmed_at IS NOT NULL THEN '✅ SIM' ELSE '❌ NÃO' END AS email_confirmado,
    p.role,
    CASE WHEN p.active = TRUE THEN '✅ ATIVO' ELSE '❌ INATIVO' END AS perfil_ativo,
    p.full_name AS nome
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email IN (
    'superadmin@sosfocinhocarente.org.br',
    'admin@sosfocinhocarente.org.br'
)
ORDER BY p.role DESC;
