-- =====================================================================
-- SCRIPT PARA CRIAR USUÁRIOS ADMIN NO SUPABASE (direto no SQL Editor)
-- Projeto: SOS Focinho Carente
-- Como usar: Abra https://app.supabase.com → seu projeto → SQL Editor
--           → Nova query → Cole TODO esse arquivo → Clique em "Run"
-- =====================================================================

-- ⚠️  IMPORTANTE: Altere as senhas abaixo ANTES de rodar se quiser!!
-- Senhas padrão usadas aqui (você pode mudar):
--   superadmin@sosfocinhocarente.org.br   →   super123
--   admin@sosfocinhocarente.org.br        →   admin123

-- =====================================================================
-- 1) CRIAR USUÁRIO SUPERADMIN
-- =====================================================================
-- Dica: A senha precisa ter no mínimo 6 caracteres. A função gen_salt usa 'bf'
-- que é o algoritmo bcrypt que o Supabase usa por padrão em auth.users.
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'superadmin@sosfocinhocarente.org.br',
    crypt('super123', gen_salt('bf')),
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Superadmin SOS"}'::jsonb,
    FALSE,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    NULL,
    '',
    NULL,
    FALSE,
    NULL
)
ON CONFLICT (email) DO NOTHING;

-- =====================================================================
-- 2) CRIAR USUÁRIO ADMIN COMUM
-- =====================================================================
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@sosfocinhocarente.org.br',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Administrador SOS"}'::jsonb,
    FALSE,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    NULL,
    '',
    NULL,
    FALSE,
    NULL
)
ON CONFLICT (email) DO NOTHING;

-- =====================================================================
-- 3) CRIAR OS PROFILES (pulleados automaticamente pelo trigger SQL,
--    mas caso você já tenha criado os usuários no painel, rode também
--    esse bloco para garantir os profiles com role correto)
-- =====================================================================

-- Para SUPERADMIN: cria/atualiza profile com role = superadmin e active = true
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

-- Para ADMIN comum: cria/atualiza profile com role = admin e active = true
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

-- =====================================================================
-- 4) CONFIRMAÇÃO: Verifica se deu tudo certo
-- =====================================================================
SELECT
    u.email,
    u.email_confirmed_at IS NOT NULL AS email_confirmado,
    p.role,
    p.active AS perfil_ativo,
    p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email IN (
    'superadmin@sosfocinhocarente.org.br',
    'admin@sosfocinhocarente.org.br'
);
