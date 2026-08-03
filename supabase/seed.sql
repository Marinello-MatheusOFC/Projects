-- =====================================================================================
-- Seed SQL — Dados de demonstração da SOS Focinho Carente
-- =====================================================================================
-- ATENÇÃO: Estes dados são FICTÍCIOS e não representam informações oficiais da ONG.
-- Utilize apenas para desenvolvimento e testes.
--
-- PRÉ-REQUISITO: rodar antes as migrations (001, 002 e 999) para que as tabelas
-- existam e haja pelo menos um perfil admin/superadmin (usado em created_by/author_id).
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- 1. Categorias de exemplo
-- -------------------------------------------------------------------------------------
INSERT INTO public.categories (id, name, slug, type) VALUES
  (gen_random_uuid(), 'Roupas',     'roupas',     'product'),
  (gen_random_uuid(), 'Acessórios', 'acessorios', 'product'),
  (gen_random_uuid(), 'Decoração',  'decoracao',  'product'),
  (gen_random_uuid(), 'Adoção',     'adocao',     'news'),
  (gen_random_uuid(), 'Eventos',    'eventos',    'news'),
  (gen_random_uuid(), 'Dicas',      'dicas',      'news')
ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------------------------------------
-- 2. Configurações do site (contatos, redes sociais, PIX, institucional)
-- -------------------------------------------------------------------------------------
INSERT INTO public.site_settings (key, value_json, public) VALUES
  ('org_contacts', jsonb_build_object(
      'email', 'contato@sosfocinhocarente.org.br',
      'phone', '(11) 3456-7890',
      'whatsapp', '5511998765432',
      'address', 'Rua das Flores, 123 - Centro, São Paulo - SP, CEP 01000-000'),
   TRUE),
  ('org_social', jsonb_build_object(
      'instagram', 'sosfocinhocarente',
      'facebook', 'sosfocinhocarente',
      'youtube', 'sosfocinhocarente'),
   TRUE),
  ('donations_pix', jsonb_build_object(
      'pix_key', 'pix@sosfocinhocarente.org.br',
      'pix_owner', 'SOS Focinho Carente'),
   TRUE),
  ('org_about', jsonb_build_object(
      'mission', 'Resgatar, cuidar e promover a adoção responsável de animais abandonados, além de conscientizar a comunidade sobre o bem-estar animal e o combate ao abandono.',
      'short_description', 'Organização sem fins lucrativos dedicada ao resgate, cuidado e adoção responsável de cães e gatos, mantida por doações e trabalho voluntário.'),
   TRUE)
ON CONFLICT (key) DO NOTHING;

-- -------------------------------------------------------------------------------------
-- 3. Animais para adoção
-- -------------------------------------------------------------------------------------
INSERT INTO public.animals
  (name, slug, species, sex, size, age_text, description, history,
   health_notes, personality, compatibility_notes, vaccinated, neutered,
   special_needs, status, featured, published, created_by)
VALUES
  ('Luna', 'luna', 'dog', 'female', 'medium', '3 anos',
   'Cachorra doce e tranquila que adora um colo depois de uma caminhada.',
   'Luna chegou até nós magra e assustada, vinda de uma área de risco. Com paciência e cuidado, foi ganhando confiança e hoje recebe quem a visita com o rabo abanando.',
   'Vacinada, castrada, vermifugada e com chip de identificação.',
   'Dócil, brincalhona e sociável com outros cães. Convive bem com gatos.',
   'Se adapta a casas e apartamentos. Se dá bem com crianças com supervisão.',
   TRUE, TRUE, FALSE, 'available', TRUE, TRUE,
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1)),

  ('Mel', 'mel', 'cat', 'female', 'small', '2 anos',
   'Gata calma e observadora que se torna muito carinhosa quando se sente segura.',
   'Mel viveu uma situação difícil antes de chegar até nós. Aos poucos, aprendeu a confiar de novo. Hoje é uma gata serena que gosta de observar o movimento de um lugar alto.',
   'Vacinada, castrada, vermifugada e com chip de identificação.',
   'Calma, carinhosa e independente. Aceita outros gatos.',
   'Ideal para apartamento telado. Lar tranquilo, sem crianças muito pequenas.',
   TRUE, TRUE, FALSE, 'available', TRUE, TRUE,
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1)),

  ('Toddy', 'toddy', 'dog', 'male', 'small', '1 ano',
   'Cão pequeno, apegado e cheio de energia, que adora um colo.',
   'Toddy chegou filhote, abandonado em uma caixa. Cresceu saudável e virou um companheiro alegre, que aprende rápido e late pouco.',
   'Vacinado, castrado e vermifugado.',
   'Apegado, energético e esperto. Se dá bem com outros cães.',
   'Perfeito para apartamento ou casa pequena.',
   TRUE, TRUE, FALSE, 'available', FALSE, TRUE,
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1)),

  ('Pipoca', 'pipoca', 'cat', 'female', 'small', '8 meses',
   'Filhote curiosa e brincalhona que adora explorar cada canto.',
   'Pipoca nasceu de uma gata que acolhemos e cresceu entre nós. É cheia de energia e está pronta para encontrar uma família.',
   'Vacinada, vermifugada e com chip de identificação. Castração marcada.',
   'Brincalhona, curiosa e sociável.',
   'Aceita outros gatos e se adapta a apartamento telado.',
   TRUE, FALSE, FALSE, 'available', FALSE, TRUE,
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1)),

  ('Thor', 'thor', 'dog', 'male', 'large', '4 anos',
   'Cão de porte grande, dócil e protetor, que busca um lar com espaço.',
   'Thor passou boa parte da vida preso a uma corrente. Apesar disso, mantém um coração manso. Está em processo de avaliação com uma família.',
   'Vacinado, castrado, vermifugado e com chip de identificação.',
   'Protetor, calmo e bom com crianças.',
   'Precisa de espaço. Recomendado para quem já conviveu com cães grandes.',
   TRUE, TRUE, FALSE, 'in_process', FALSE, TRUE,
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1)),

  ('Bolinha', 'bolinha', 'dog', 'male', 'medium', '5 anos',
   'Companheiro tranquilo, que prefere caminhadas calmas a correrias.',
   'Bolinha viveu na rua por anos antes de ser resgatado. É um cão agradecido, de energia moderada, que ama um passeio pela manhã.',
   'Vacinado, castrado, vermifugado e com chip de identificação.',
   'Calmo, sociável e obediente.',
   'Casa ou apartamento. Companhia ideal para caminhadas.',
   TRUE, TRUE, FALSE, 'available', FALSE, TRUE,
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1)),

  ('Fred', 'fred', 'dog', 'male', 'large', '2 anos',
   'Golden de temperamento dócil, que adora brincadeiras na água e carinho.',
   'Fred foi entregue pela família que não podia mais mantê-lo. É um cão educado, que sabe sentar, deitar e dar a pata. Sonha em encontrar uma família que tenha tempo para passeios longos.',
   'Vacinado, castrado, vermifugado e com chip de identificação.',
   'Dócil, inteligente e sociável com pessoas, crianças e outros cães.',
   'Precisa de espaço e passeios diários. Ideal para famílias ativas.',
   TRUE, TRUE, FALSE, 'available', TRUE, TRUE,
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1)),

  ('Bento', 'bento', 'dog', 'male', 'medium', '3 anos',
   'Beagle farejador nato, curioso e extremamente carinhoso.',
   'Bento foi encontrado perambulando por uma rodovia, com fome e assustado. Depois de ser resgatado e tratado, mostrou toda a alegria de viver que a raça tem.',
   'Vacinado, castrado, vermifugado e com chip de identificação.',
   'Curioso, alegre e cheio de energia. Pode conviver com outros cães.',
   'Adepto a fugas, precisa de quintal cercado. Não recomendado para tutores de primeira viagem.',
   TRUE, TRUE, FALSE, 'available', FALSE, TRUE,
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1)),

  ('Amora', 'amora', 'cat', 'female', 'small', '1 ano',
   'Gata carinhosa que adora uma soneca no colo e o sol da tarde.',
   'Amora foi resgatada ainda filhote junto com sua ninhada. Cresceu saudável e é a primeira a se esfregar na perna de quem chega.',
   'Vacinada, castrada, vermifugada e com chip de identificação.',
   'Carinhosa, tranquila e um pouco tímida com estranhos no início.',
   'Ideal para apartamento telado e lares tranquilos.',
   TRUE, TRUE, FALSE, 'available', FALSE, TRUE,
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1))
ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------------------------------------
-- 4. Fotos dos animais (caminhos de demonstração)
-- -------------------------------------------------------------------------------------
INSERT INTO public.animal_images (animal_id, storage_path, position, is_cover)
SELECT a.id, x.path, x.position, x.is_cover
FROM public.animals a
JOIN (
  VALUES
    ('luna',   '/images/demo/animal-dog-01.jpg', 0, TRUE),
    ('luna',   '/images/demo/animal-paw.jpg',    1, FALSE),
    ('luna',   '/images/demo/care-volunteer.jpg',2, FALSE),
    ('mel',    '/images/demo/animal-cat-01.jpg', 0, TRUE),
    ('mel',    '/images/demo/hero-cat.jpg',      1, FALSE),
    ('mel',    '/images/demo/animal-paw.jpg',    2, FALSE),
    ('toddy',  '/images/demo/animal-dog-02.jpg', 0, TRUE),
    ('toddy',  '/images/demo/animal-paw.jpg',    1, FALSE),
    ('pipoca', '/images/demo/animal-cat-02.jpg', 0, TRUE),
    ('pipoca', '/images/demo/animal-kitten.jpg', 1, FALSE),
    ('thor',   '/images/demo/hero-dog.jpg',      0, TRUE),
    ('thor',   '/images/demo/animal-paw.jpg',    1, FALSE),
    ('bolinha','/images/demo/animal-dog-03.jpg', 0, TRUE),
    ('bolinha','/images/demo/animal-paw.jpg',    1, FALSE),
    ('fred',   '/images/demo/animals/dog-golden.jpg',0, TRUE),
    ('fred',   '/images/demo/animals/dog-close.jpg', 1, FALSE),
    ('fred',   '/images/demo/animal-paw.jpg',        2, FALSE),
    ('bento',  '/images/demo/animals/dog-beagle.jpg',0, TRUE),
    ('bento',  '/images/demo/animals/two-dogs.jpg',  1, FALSE),
    ('amora',  '/images/demo/animals/kitten-lying.jpg',0, TRUE),
    ('amora',  '/images/demo/animals/cat-sleeping.jpg',1, FALSE),
    ('amora',  '/images/demo/animal-paw.jpg',          2, FALSE)
) AS x(slug, path, position, is_cover) ON a.slug = x.slug;

-- -------------------------------------------------------------------------------------
-- 5. Eventos
-- -------------------------------------------------------------------------------------
INSERT INTO public.events
  (title, slug, summary, description, start_at, end_at, location_name, address,
   image_path, status, published, created_by)
VALUES
  ('Feira de Adoção — Agosto 2026', 'feira-adocao-agosto',
   'Venha conhecer cães, gatos e coelhos que buscam um lar.',
   'Um dia inteiro dedicado a conectar animais resgatados a famílias. Antes da adoção, realizamos uma entrevista de compatibilidade. Teremos também barracas de doces, artesanato e brechó beneficente, com toda a renda revertida para os cuidados dos animais.',
   '2026-08-20T09:00:00-03:00', '2026-08-20T17:00:00-03:00',
   'Parque Municipal — Portão 3', 'Av. das Árvores, s/n - Jardim Primavera, São Paulo - SP',
   '/images/demo/adoption-event.jpg', 'scheduled', TRUE,
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1)),

  ('Mutirão de Castração — Agosto 2026', 'mutirao-castracao-agosto',
   'Castração gratuita para cães e gatos de tutores de baixa renda. Vagas limitadas.',
   'Em parceria com clínicas veterinárias, ofereceremos castração gratuita. As inscrições devem ser feitas antecipadamente. Serão priorizados tutores de baixa renda e protetores independentes.',
   '2026-08-08T07:00:00-03:00', '2026-08-08T18:00:00-03:00',
   'Clínica Veterinária Popular — Centro', 'Av. da Saúde, 45 - Centro, São Paulo - SP',
   '/images/demo/animal-group.jpg', 'scheduled', TRUE,
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1)),

  ('Bazar Beneficente — Edição de Inverno', 'bazar-beneficente',
   'Roupas, calçados, livros e decoração com preços especiais. Toda a renda para os animais.',
   'Roupas, calçados, acessórios, livros, brinquedos e decoração. Toda a renda arrecadada é destinada aos cuidados dos animais resgatados: alimentação, medicamentos e castrações.',
   '2026-08-01T10:00:00-03:00', '2026-08-01T18:00:00-03:00',
   'Sede da ONG', 'Rua das Flores, 123 - Centro, São Paulo - SP',
   '/images/demo/community-event.jpg', 'scheduled', TRUE,
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1)),

  ('Oficina de Educação Ambiental e Bem-Estar Animal', 'oficina-educativa',
   'Atividade gratuita para crianças com ensinamentos sobre cuidado animal e meio ambiente.',
   'Com atividades lúdicas, jogos e contação de histórias, as crianças aprendem sobre cuidados básicos, importância da castração e respeito aos animais de rua. As crianças devem estar acompanhadas por um responsável.',
   '2026-07-18T14:00:00-03:00', '2026-07-18T17:00:00-03:00',
   'Biblioteca Municipal — Sala Infantil', 'Praça da Leitura, 10 - Centro, São Paulo - SP',
   '/images/demo/volunteer-care.jpg', 'completed', TRUE,
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1)),

  ('Cãominhada da Solidariedade', 'caminhada-animal',
   'Caminhada aberta a tutores e seus cães para arrecadar ração e cobertores.',
   'Tutores e seus cães percorrem um trajeto de 3km pelo parque. A entrada é solidária: cada participante doa 1kg de ração ou um cobertor. Teremos pontos de hidratação e veterinários voluntários ao longo do percurso.',
   '2026-07-10T08:00:00-03:00', '2026-07-10T11:00:00-03:00',
   'Parque Ecológico — Entrada Principal', 'Av. Verde, s/n - Jardim Primavera, São Paulo - SP',
   '/images/demo/hero-dog.jpg', 'completed', TRUE,
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1))
ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------------------------------------
-- 6. Notícias
-- -------------------------------------------------------------------------------------
INSERT INTO public.news_posts
  (title, slug, excerpt, content, cover_image_path, status, published_at, author_id)
VALUES
  ('Feira de Adoção de Julho: 42 animais encontraram um novo lar', 'feira-adocao-julho-2026',
   'Mais de 40 animais — entre cães e gatos — encontraram uma família durante o evento realizado no parque.',
   'No último sábado, realizamos mais uma edição da nossa Feira de Adoção. 42 animais — entre cães e gatos — encontraram um novo lar.\n\nO evento aconteceu das 9h às 17h e contou com a presença de centenas de visitantes. Cada adoção foi precedida por uma conversa de compatibilidade, garantindo que cada animal seguisse para o lar mais adequado ao seu perfil.\n\nCada adoção responsável representa uma vida transformada. Agradecemos a todos os voluntários que dedicaram seu tempo para tornar esse dia possível.',
   '/images/demo/adoption-event.jpg', 'published', '2026-07-28T10:00:00-03:00',
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1)),

  ('Campanha do Agasalho Animal arrecada mais de 2 toneladas', 'campanha-inverno-2026',
   'Doações de cobertores, roupinhas e ração vão beneficiar os animais resgatados.',
   'Graças à generosidade da comunidade, arrecadamos mais de 2 toneladas entre cobertores, roupinhas, ração e medicamentos.\n\nOs itens já estão sendo distribuídos para os animais sob nossos cuidados e para famílias de protetores independentes cadastradas no programa de apoio.\n\nCada cobertor doado significa uma noite mais quente para um animal que espera por um lar. A campanha segue até o final de agosto.',
   '/images/demo/care-volunteer.jpg', 'published', '2026-07-20T10:00:00-03:00',
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1)),

  ('Um novo espaço para o abrigo temporário', 'novo-espaco-abrigo',
   'Parceria com a Prefeitura garante um espaço maior e mais adequado para os animais resgatados.',
   'A SOS Focinho Carente agora conta com um novo espaço para seu abrigo temporário! Graças a uma parceria, ganhamos um galpão revitalizado.\n\nO novo espaço conta com canis amplos, gatil com aquecimento, área de quarentena e um pátio para socialização dos animais.\n\nEsse novo espaço vai nos permitir atender melhor cada animal resgatado, com mais dignidade e conforto enquanto eles esperam por um lar definitivo.',
   '/images/demo/shelter-space.jpg', 'published', '2026-07-15T10:00:00-03:00',
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1)),

  ('Voluntários plantam horta comunitária no novo espaço do abrigo', 'horta-comunitaria-abrigo',
   'Além de embelezar o espaço, a horta vai fornecer alimentos frescos e envolver a comunidade.',
   'No último fim de semana, um grupo de voluntários plantou uma horta comunitária no novo espaço do abrigo.\n\nA iniciativa reúne ervas, hortaliças e uma composteira, e vai envolver moradores do bairro em oficinas mensais de jardinagem e cuidado animal.\n\nQuem quiser participar das próximas oficinas pode se inscrever pela nossa página de contato ou acompanhar as novidades nas redes sociais.',
   '/images/demo/news/news-cat.jpg', 'published', '2026-07-08T10:00:00-03:00',
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1)),

  ('Parceria com pet shop garante banho e tosa gratuitos aos resgatados', 'parceria-pet-shop',
   'Convênio com estabelecimento parceiro vai garantir banho, tosa e itens de higiene aos animais.',
   'Fechamos uma parceria com um pet shop do bairro que vai garantir banho, tosa e kits de higiene para todos os animais sob nossos cuidados.\n\nA cada banho, o pet shop também doa um percentual das vendas do dia para a ONG. É uma corrente do bem que começa com um simples gesto.\n\nEmpresas que desejam apoiar a causa podem entrar em contato pelo e-mail institucional.',
   '/images/demo/volunteering/community-hands.jpg', 'published', '2026-07-01T10:00:00-03:00',
   (SELECT id FROM public.profiles WHERE role = 'superadmin' LIMIT 1))
ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------------------------------------
-- 7. Produtos do brechó
-- -------------------------------------------------------------------------------------
INSERT INTO public.products
  (name, slug, description, price, category_id, image_path, available, featured, published)
VALUES
  ('Camiseta SOS Focinho Carente', 'camiseta-sos',
   'Camiseta do bazar beneficente. Renda revertida para os cuidados dos animais.',
   25, (SELECT id FROM public.categories WHERE slug = 'roupas'),
   '/images/demo/animal-paw.jpg', TRUE, TRUE, TRUE),

  ('Caneca com estampa de focinho', 'caneca-focinho',
   'Caneca ilustrada com estampa de focinho. Peça única de doação.',
   15, (SELECT id FROM public.categories WHERE slug = 'acessorios'),
   '/images/demo/animal-cat-03.jpg', TRUE, FALSE, TRUE),

  ('Roupeira infantil de inverno', 'roupeira-infantil',
   'Roupinha infantil em bom estado, vinda de doação. Toda a renda é revertida.',
   18, (SELECT id FROM public.categories WHERE slug = 'roupas'),
   '/images/demo/animal-cat-04.jpg', TRUE, FALSE, TRUE),

  ('Livro usado — Literatura', 'livro-usado',
   'Livro usado em bom estado. Cada compra ajuda a manter o trabalho da ONG.',
   8, (SELECT id FROM public.categories WHERE slug = 'decoracao'),
   '/images/demo/animal-dog-03.jpg', FALSE, FALSE, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------------------------------------
-- 8. Galeria de fotos
-- -------------------------------------------------------------------------------------
INSERT INTO public.gallery_albums (title, slug, description, cover_image_path, published)
VALUES
  ('Dias de cuidado', 'dias-de-cuidado',
   'Registros do dia a dia de quem cuida dos animais.',
   '/images/demo/care-volunteer.jpg', TRUE),
  ('Feiras de adoção', 'feiras-de-adocao',
   'Momentos dos encontros entre animais e futuras famílias.',
   '/images/demo/adoption-event.jpg', TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.gallery_images (album_id, storage_path, caption, position)
SELECT al.id, x.path, x.caption, x.position
FROM public.gallery_albums al
JOIN (
  VALUES
    ('dias-de-cuidado',  '/images/demo/care-volunteer.jpg',   'Momento de cuidado',        0),
    ('dias-de-cuidado',  '/images/demo/animal-paw.jpg',       'Detalhe de pata',           1),
    ('dias-de-cuidado',  '/images/demo/volunteer-care.jpg',   'Voluntários em ação',       2),
    ('dias-de-cuidado',  '/images/demo/shelter-space.jpg',    'Espaço de acolhimento',     3),
    ('feiras-de-adocao', '/images/demo/adoption-event.jpg',   'Feira de adoção',           0),
    ('feiras-de-adocao', '/images/demo/community-event.jpg',  'Campanha comunitária',      1),
    ('feiras-de-adocao', '/images/demo/hero-dog.jpg',         'Encontro de adoção',        2),
    ('feiras-de-adocao', '/images/demo/hero-cat.jpg',         'Gata em acolhimento',       3)
) AS x(album_slug, path, caption, position) ON al.slug = x.album_slug;
