-- =====================================================================
-- 005_public_user_role.sql
-- Adiciona suporte a usuários públicos (role = 'user'):
--   1. Atualiza CHECK constraint para aceitar 'user'
--   2. Atualiza handle_new_user para criar perfis de usuário público
--   3. Adiciona RLS policies para usuários comuns
--   4. Adiciona coluna user_id em adoption_applications
-- =====================================================================

-- 1. Atualiza o CHECK constraint para aceitar 'user'
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'admin', 'superadmin'));

-- 2. Atualiza is_admin() para não considerar 'user' como admin
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

-- 3. Função para verificar se usuário é um usuário comum
CREATE OR REPLACE FUNCTION public.is_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'user'
      AND active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Atualiza handle_new_user para criar perfis de usuário público
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  has_super INTEGER;
  meta_role TEXT;
  is_active BOOLEAN;
  is_public_signup BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO has_super FROM public.profiles WHERE role = 'superadmin';

  -- Bootstrap: primeiro superadmin
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

  -- Detecta se é signup público (sem admin_setup no metadata)
  is_public_signup := NOT COALESCE(
    (NEW.raw_user_meta_data->>'admin_setup')::BOOLEAN,
    FALSE
  );

  -- Para signup público, sempre cria perfil 'user'
  -- Para signup admin (admin_setup=true), usa o role do metadata
  IF is_public_signup THEN
    meta_role := 'user';
  ELSE
    meta_role := COALESCE(NEW.raw_user_meta_data->>'role', 'admin');
  END IF;

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. RLS policies para usuários comuns

-- Usuários comuns podem ver todos os perfis (necessário para outros usuários)
CREATE POLICY "Usuários públicos podem ver perfis"
  ON public.profiles FOR SELECT
  USING (TRUE);

-- Usuários comuns podem atualizar próprio perfil (exceto role e active)
CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() AND role = 'user')
  WITH CHECK (id = auth.uid() AND role = 'user');

-- 6. Adiciona coluna user_id em adoption_applications (opcional, para linkar ao usuário)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'adoption_applications'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.adoption_applications
      ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

    CREATE INDEX idx_adoption_applications_user_id
      ON public.adoption_applications(user_id);

    -- Policy: usuários podem ver suas próprias candidaturas
    CREATE POLICY "Usuários podem ver próprias candidaturas"
      ON public.adoption_applications FOR SELECT
      USING (
        auth.uid() IS NOT NULL AND (
          user_id = auth.uid()
          OR public.is_admin()
        )
      );

    -- Policy: usuários autenticados podem criar candidaturas
    CREATE POLICY "Usuários autenticados podem criar candidaturas"
      ON public.adoption_applications FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;
