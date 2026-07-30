-- Seed SQL - Dados de demonstração
-- ATENÇÃO: Estes dados são fictícios e não representam informações oficiais da ONG SOS Focinho Carente.
-- Utilize apenas para desenvolvimento e testes.

-- Inserir categorias de exemplo
INSERT INTO public.categories (id, name, slug, type) VALUES
  (gen_random_uuid(), 'Roupas', 'roupas', 'product'),
  (gen_random_uuid(), 'Acessórios', 'acessorios', 'product'),
  (gen_random_uuid(), 'Decoração', 'decoracao', 'product'),
  (gen_random_uuid(), 'Adoção', 'adocao', 'news'),
  (gen_random_uuid(), 'Eventos', 'eventos', 'news'),
  (gen_random_uuid(), 'Dicas', 'dicas', 'news');
