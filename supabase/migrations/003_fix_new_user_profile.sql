-- =====================================================================
-- 003_fix_new_user_profile.sql
-- Corrige o trigger handle_new_user: usuários criados pelo painel do
-- Supabase (sem raw_user_meta_data.admin_setup = true) NÃO ganhavam
-- profile em public.profiles. Consequências:
--   * login pelo app falha ("sem permissão" — profile inexistente)
--   * FKs para profiles (animals.author_id, news_posts.author_id,
--     site_settings.updated_by, adoption_status_history.changed_by)
--     falham ao gravar
-- Agora o trigger SEMPRE cria o profile. O bootstrap do primeiro
-- superadmin é mantido. Para novos usuários o role vem do metadata
-- (default 'admin').
--
-- ⚠️ Nota de segurança: se um dia o Supabase Auth tiver signup público
-- habilitado, qualquer pessoa criaria um perfil admin automaticamente.
-- O app não possui página pública de cadastro, então isso não se aplica
-- hoje. Se reabilitar signup público, volte a bloquear aqui.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  has_super INTEGER;
  meta_role TEXT;
  is_active BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO has_super FROM public.profiles WHERE role = 'superadmin';

  IF has_super = 0 THEN
    INSERT INTO public.profiles (id, full_name, role, active)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Superadministrador'),
      'superadmin',
      TRUE
    )
    ON CONFLICT (id) DO UPDATE
      SET full_name = EXCLUDED.full_name,
          role = 'superadmin',
          active = TRUE,
          updated_at = NOW();
    RETURN NEW;
  END IF;

  meta_role := COALESCE(NEW.raw_user_meta_data->>'role', 'admin');
  is_active := COALESCE((NEW.raw_user_meta_data->>'active')::BOOLEAN, TRUE);

  INSERT INTO public.profiles (id, full_name, role, active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    meta_role,
    is_active
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        active = EXCLUDED.active,
        updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garante que o trigger está vinculado à função corrigida
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
