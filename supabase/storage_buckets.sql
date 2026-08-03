-- =====================================================================================
-- Buckets de storage — SOS Focinho Carente
-- =====================================================================================
-- Cria os buckets públicos usados pelo painel admin para upload de fotos
-- (animais e galeria) e as políticas de RLS de leitura/escrita.
-- Idempotente: pode rodar mais de uma vez no SQL Editor do Supabase.
-- =====================================================================================

-- 1. Buckets públicos (leitura anônima das imagens via /storage/v1/object/public/...)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('animals', 'animals', TRUE),
  ('gallery', 'gallery', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de leitura pública
CREATE POLICY IF NOT EXISTS "Publico pode ler animais"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'animals');

CREATE POLICY IF NOT EXISTS "Publico pode ler galeria"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

-- 3. Políticas de escrita para usuários autenticados (admin/superadmin)
CREATE POLICY IF NOT EXISTS "Autenticado pode enviar animais"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'animals');

CREATE POLICY IF NOT EXISTS "Autenticado pode atualizar animais"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'animals')
  WITH CHECK (bucket_id = 'animals');

CREATE POLICY IF NOT EXISTS "Autenticado pode excluir animais"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'animals');

CREATE POLICY IF NOT EXISTS "Autenticado pode enviar galeria"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery');

CREATE POLICY IF NOT EXISTS "Autenticado pode atualizar galeria"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'gallery')
  WITH CHECK (bucket_id = 'gallery');

CREATE POLICY IF NOT EXISTS "Autenticado pode excluir galeria"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gallery');
