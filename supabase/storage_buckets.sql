-- =====================================================================================
-- Buckets de storage — SOS Focinho Carente
-- =====================================================================================
-- Cria os buckets públicos usados pelo painel admin para upload de fotos
-- (animais, galeria, eventos, notícias e produtos do brechó) e as políticas
-- de RLS de leitura/escrita.
-- Idempotente: pode rodar mais de uma vez no SQL Editor do Supabase.
-- =====================================================================================

-- 1. Buckets públicos (leitura anônima das imagens via /storage/v1/object/public/...)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('animals', 'animals', TRUE),
  ('gallery', 'gallery', TRUE),
  ('events', 'events', TRUE),
  ('news', 'news', TRUE),
  ('products', 'products', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de leitura pública
DROP POLICY IF EXISTS "Publico pode ler animais" ON storage.objects;
CREATE POLICY "Publico pode ler animais"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'animals');

DROP POLICY IF EXISTS "Publico pode ler galeria" ON storage.objects;
CREATE POLICY "Publico pode ler galeria"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Publico pode ler eventos" ON storage.objects;
CREATE POLICY "Publico pode ler eventos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'events');

DROP POLICY IF EXISTS "Publico pode ler noticias" ON storage.objects;
CREATE POLICY "Publico pode ler noticias"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'news');

DROP POLICY IF EXISTS "Publico pode ler produtos" ON storage.objects;
CREATE POLICY "Publico pode ler produtos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- 3. Políticas de escrita para usuários autenticados (admin/superadmin)
DROP POLICY IF EXISTS "Autenticado pode enviar animais" ON storage.objects;
CREATE POLICY "Autenticado pode enviar animais"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'animals');

DROP POLICY IF EXISTS "Autenticado pode atualizar animais" ON storage.objects;
CREATE POLICY "Autenticado pode atualizar animais"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'animals')
  WITH CHECK (bucket_id = 'animals');

DROP POLICY IF EXISTS "Autenticado pode excluir animais" ON storage.objects;
CREATE POLICY "Autenticado pode excluir animais"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'animals');

DROP POLICY IF EXISTS "Autenticado pode enviar galeria" ON storage.objects;
CREATE POLICY "Autenticado pode enviar galeria"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Autenticado pode atualizar galeria" ON storage.objects;
CREATE POLICY "Autenticado pode atualizar galeria"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'gallery')
  WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Autenticado pode excluir galeria" ON storage.objects;
CREATE POLICY "Autenticado pode excluir galeria"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Autenticado pode enviar eventos" ON storage.objects;
CREATE POLICY "Autenticado pode enviar eventos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'events');

DROP POLICY IF EXISTS "Autenticado pode atualizar eventos" ON storage.objects;
CREATE POLICY "Autenticado pode atualizar eventos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'events')
  WITH CHECK (bucket_id = 'events');

DROP POLICY IF EXISTS "Autenticado pode excluir eventos" ON storage.objects;
CREATE POLICY "Autenticado pode excluir eventos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'events');

DROP POLICY IF EXISTS "Autenticado pode enviar noticias" ON storage.objects;
CREATE POLICY "Autenticado pode enviar noticias"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'news');

DROP POLICY IF EXISTS "Autenticado pode atualizar noticias" ON storage.objects;
CREATE POLICY "Autenticado pode atualizar noticias"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'news')
  WITH CHECK (bucket_id = 'news');

DROP POLICY IF EXISTS "Autenticado pode excluir noticias" ON storage.objects;
CREATE POLICY "Autenticado pode excluir noticias"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'news');

DROP POLICY IF EXISTS "Autenticado pode enviar produtos" ON storage.objects;
CREATE POLICY "Autenticado pode enviar produtos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Autenticado pode atualizar produtos" ON storage.objects;
CREATE POLICY "Autenticado pode atualizar produtos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'products')
  WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Autenticado pode excluir produtos" ON storage.objects;
CREATE POLICY "Autenticado pode excluir produtos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'products');
