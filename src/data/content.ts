import type { Event, NewsPost, Product, GalleryAlbum, GalleryImage, SiteSetting } from '@/types';

const now = new Date().toISOString();

export const demoEvents: Event[] = [
  {
    id: 'demo-ev-001',
    title: 'Feira de Adoção — Agosto 2026',
    slug: 'feira-adocao-agosto',
    summary: 'Venha conhecer cães, gatos e coelhos que buscam um lar.',
    description:
      'Um dia inteiro dedicado a conectar animais resgatados a famílias. Antes da adoção, realizamos uma entrevista de compatibilidade. Teremos também barracas de doces, artesanato e brechó beneficente, com toda a renda revertida para os cuidados dos animais.',
    start_at: '2026-08-20T09:00:00-03:00',
    end_at: '2026-08-20T17:00:00-03:00',
    location_name: 'Parque Municipal — Portão 3',
    address: 'Av. das Árvores, s/n - Jardim Primavera, São Paulo - SP',
    external_url: null,
    image_path: '/images/demo/adoption-event.jpg',
    status: 'scheduled',
    published: true,
    created_by: 'demo',
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: 'demo-ev-002',
    title: 'Mutirão de Castração — Agosto 2026',
    slug: 'mutirao-castracao-agosto',
    summary: 'Castração gratuita para cães e gatos de tutores de baixa renda. Vagas limitadas.',
    description:
      'Em parceria com clínicas veterinárias, ofereceremos castração gratuita. As inscrições devem ser feitas antecipadamente. Serão priorizados tutores de baixa renda e protetores independentes.',
    start_at: '2026-08-08T07:00:00-03:00',
    end_at: '2026-08-08T18:00:00-03:00',
    location_name: 'Clínica Veterinária Popular — Centro',
    address: 'Av. da Saúde, 45 - Centro, São Paulo - SP',
    external_url: null,
    image_path: '/images/demo/animal-group.jpg',
    status: 'scheduled',
    published: true,
    created_by: 'demo',
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: 'demo-ev-003',
    title: 'Bazar Beneficente — Edição de Inverno',
    slug: 'bazar-beneficente',
    summary: 'Roupas, calçados, livros e decoração com preços especiais. Toda a renda para os animais.',
    description:
      'Roupas, calçados, acessórios, livros, brinquedos e decoração. Toda a renda arrecadada é destinada aos cuidados dos animais resgatados: alimentação, medicamentos e castrações.',
    start_at: '2026-08-01T10:00:00-03:00',
    end_at: '2026-08-01T18:00:00-03:00',
    location_name: 'Sede da ONG',
    address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
    external_url: null,
    image_path: '/images/demo/community-event.jpg',
    status: 'scheduled',
    published: true,
    created_by: 'demo',
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: 'demo-ev-004',
    title: 'Oficina de Educação Ambiental e Bem-Estar Animal',
    slug: 'oficina-educativa',
    summary: 'Atividade gratuita para crianças com ensinamentos sobre cuidado animal e meio ambiente.',
    description:
      'Com atividades lúdicas, jogos e contação de histórias, as crianças aprendem sobre cuidados básicos, importância da castração e respeito aos animais de rua. As crianças devem estar acompanhadas por um responsável.',
    start_at: '2026-07-18T14:00:00-03:00',
    end_at: '2026-07-18T17:00:00-03:00',
    location_name: 'Biblioteca Municipal — Sala Infantil',
    address: 'Praça da Leitura, 10 - Centro, São Paulo - SP',
    external_url: null,
    image_path: '/images/demo/volunteer-care.jpg',
    status: 'completed',
    published: true,
    created_by: 'demo',
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: 'demo-ev-005',
    title: 'Cãominhada da Solidariedade',
    slug: 'caminhada-animal',
    summary: 'Caminhada aberta a tutores e seus cães para arrecadar ração e cobertores.',
    description:
      'Tutores e seus cães percorrem um trajeto de 3km pelo parque. A entrada é solidária: cada participante doa 1kg de ração ou um cobertor. Teremos pontos de hidratação e veterinários voluntários ao longo do percurso.',
    start_at: '2026-07-10T08:00:00-03:00',
    end_at: '2026-07-10T11:00:00-03:00',
    location_name: 'Parque Ecológico — Entrada Principal',
    address: 'Av. Verde, s/n - Jardim Primavera, São Paulo - SP',
    external_url: null,
    image_path: '/images/demo/hero-dog.jpg',
    status: 'completed',
    published: true,
    created_by: 'demo',
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
];

export const demoNews: NewsPost[] = [
  {
    id: 'demo-news-001',
    title: 'Feira de Adoção de Julho: 42 animais encontraram um novo lar',
    slug: 'feira-adocao-julho-2026',
    excerpt:
      'Mais de 40 animais — entre cães e gatos — encontraram uma família durante o evento realizado no parque.',
    content: `No último sábado, realizamos mais uma edição da nossa Feira de Adoção. 42 animais — entre cães e gatos — encontraram um novo lar.

O evento aconteceu das 9h às 17h e contou com a presença de centenas de visitantes. Cada adoção foi precedida por uma conversa de compatibilidade, garantindo que cada animal seguisse para o lar mais adequado ao seu perfil.

Cada adoção responsável representa uma vida transformada. Agradecemos a todos os voluntários que dedicaram seu tempo para tornar esse dia possível.`,
    cover_image_path: '/images/demo/adoption-event.jpg',
    status: 'published',
    published_at: '2026-07-28T10:00:00-03:00',
    author_id: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: 'demo-news-002',
    title: 'Campanha do Agasalho Animal arrecada mais de 2 toneladas',
    slug: 'campanha-inverno-2026',
    excerpt: 'Doações de cobertores, roupinhas e ração vão beneficiar os animais resgatados.',
    content: `Graças à generosidade da comunidade, arrecadamos mais de 2 toneladas entre cobertores, roupinhas, ração e medicamentos.

Os itens já estão sendo distribuídos para os animais sob nossos cuidados e para famílias de protetores independentes cadastradas no programa de apoio.

Cada cobertor doado significa uma noite mais quente para um animal que espera por um lar. A campanha segue até o final de agosto.`,
    cover_image_path: '/images/demo/care-volunteer.jpg',
    status: 'published',
    published_at: '2026-07-20T10:00:00-03:00',
    author_id: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: 'demo-news-003',
    title: 'Um novo espaço para o abrigo temporário',
    slug: 'novo-espaco-abrigo',
    excerpt: 'Parceria com a Prefeitura garante um espaço maior e mais adequado para os animais resgatados.',
    content: `A SOS Focinho Carente agora conta com um novo espaço para seu abrigo temporário! Graças a uma parceria, ganhamos um galpão revitalizado.

O novo espaço conta com canis amplos, gatil com aquecimento, área de quarentena e um pátio para socialização dos animais.

Esse novo espaço vai nos permitir atender melhor cada animal resgatado, com mais dignidade e conforto enquanto eles esperam por um lar definitivo.`,
    cover_image_path: '/images/demo/shelter-space.jpg',
    status: 'published',
    published_at: '2026-07-15T10:00:00-03:00',
    author_id: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: 'demo-news-004',
    title: 'Voluntários plantam horta comunitária no novo espaço do abrigo',
    slug: 'horta-comunitaria-abrigo',
    excerpt:
      'Além de embelezar o espaço, a horta vai fornecer alimentos frescos e envolver a comunidade.',
    content: `No último fim de semana, um grupo de voluntários plantou uma horta comunitária no novo espaço do abrigo.

A iniciativa reúne ervas, hortaliças e uma composteira, e vai envolver moradores do bairro em oficinas mensais de jardinagem e cuidado animal.

Quem quiser participar das próximas oficinas pode se inscrever pela nossa página de contato ou acompanhar as novidades nas redes sociais.`,
    cover_image_path: '/images/demo/news/news-cat.jpg',
    status: 'published',
    published_at: '2026-07-08T10:00:00-03:00',
    author_id: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: 'demo-news-005',
    title: 'Parceria com pet shop garante banho e tosa gratuitos aos resgatados',
    slug: 'parceria-pet-shop',
    excerpt:
      'Convênio com estabelecimento parceiro vai garantir banho, tosa e itens de higiene aos animais.',
    content: `Fechamos uma parceria com um pet shop do bairro que vai garantir banho, tosa e kits de higiene para todos os animais sob nossos cuidados.

A cada banho, o pet shop também doa um percentual das vendas do dia para a ONG. É uma corrente do bem que começa com um simples gesto.

Empresas que desejam apoiar a causa podem entrar em contato pelo e-mail institucional.`,
    cover_image_path: '/images/demo/volunteering/community-hands.jpg',
    status: 'published',
    published_at: '2026-07-01T10:00:00-03:00',
    author_id: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
];

export const demoProducts: Product[] = [
  {
    id: 'demo-prod-001',
    name: 'Camiseta SOS Focinho Carente',
    slug: 'camiseta-sos',
    description: 'Camiseta do bazar beneficente. Renda revertida para os cuidados dos animais.',
    price: 25,
    category_id: null,
    image_path: '/images/demo/animal-paw.jpg',
    available: true,
    featured: true,
    published: true,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: 'demo-prod-002',
    name: 'Caneca com estampa de focinho',
    slug: 'caneca-focinho',
    description: 'Caneca ilustrada com estampa de focinho. Peça única de doação.',
    price: 15,
    category_id: null,
    image_path: '/images/demo/animal-cat-03.jpg',
    available: true,
    featured: false,
    published: true,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: 'demo-prod-003',
    name: 'Roupeira infantil de inverno',
    slug: 'roupeira-infantil',
    description: 'Roupinha infantil em bom estado, vinda de doação. Toda a renda é revertida.',
    price: 18,
    category_id: null,
    image_path: '/images/demo/animal-cat-04.jpg',
    available: true,
    featured: false,
    published: true,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: 'demo-prod-004',
    name: 'Livro usado — Literatura',
    slug: 'livro-usado',
    description: 'Livro usado em bom estado. Cada compra ajuda a manter o trabalho da ONG.',
    price: 8,
    category_id: null,
    image_path: '/images/demo/animal-dog-03.jpg',
    available: false,
    featured: false,
    published: true,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
];

export const demoGalleryAlbums: GalleryAlbum[] = [
  {
    id: 'demo-album-001',
    title: 'Dias de cuidado',
    slug: 'dias-de-cuidado',
    description: 'Registros do dia a dia de quem cuida dos animais.',
    cover_image_path: '/images/demo/care-volunteer.jpg',
    published: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'demo-album-002',
    title: 'Feiras de adoção',
    slug: 'feiras-de-adocao',
    description: 'Momentos dos encontros entre animais e futuras famílias.',
    cover_image_path: '/images/demo/adoption-event.jpg',
    published: true,
    created_at: now,
    updated_at: now,
  },
];

export const demoGalleryImages: GalleryImage[] = [
  { id: 'demo-img-001', album_id: 'demo-album-001', storage_path: '/images/demo/care-volunteer.jpg', alt_text: null, caption: 'Momento de cuidado', position: 0, created_at: now },
  { id: 'demo-img-002', album_id: 'demo-album-001', storage_path: '/images/demo/animal-paw.jpg', alt_text: null, caption: 'Detalhe de pata', position: 1, created_at: now },
  { id: 'demo-img-003', album_id: 'demo-album-001', storage_path: '/images/demo/volunteer-care.jpg', alt_text: null, caption: 'Voluntários em ação', position: 2, created_at: now },
  { id: 'demo-img-004', album_id: 'demo-album-001', storage_path: '/images/demo/shelter-space.jpg', alt_text: null, caption: 'Espaço de acolhimento', position: 3, created_at: now },
  { id: 'demo-img-005', album_id: 'demo-album-002', storage_path: '/images/demo/adoption-event.jpg', alt_text: null, caption: 'Feira de adoção', position: 0, created_at: now },
  { id: 'demo-img-006', album_id: 'demo-album-002', storage_path: '/images/demo/community-event.jpg', alt_text: null, caption: 'Campanha comunitária', position: 1, created_at: now },
  { id: 'demo-img-007', album_id: 'demo-album-002', storage_path: '/images/demo/hero-dog.jpg', alt_text: null, caption: 'Encontro de adoção', position: 2, created_at: now },
  { id: 'demo-img-008', album_id: 'demo-album-002', storage_path: '/images/demo/hero-cat.jpg', alt_text: null, caption: 'Gata em acolhimento', position: 3, created_at: now },
];

export const demoSettings: SiteSetting[] = [
  {
    id: 'demo-set-001',
    key: 'org_contacts',
    value_json: {
      email: 'contato@sosfocinhocarente.org.br',
      phone: '(11) 3456-7890',
      whatsapp: '5511998765432',
      address: 'Rua das Flores, 123 - Centro, São Paulo - SP, CEP 01000-000',
    },
    public: true,
    updated_by: null,
    updated_at: now,
  },
  {
    id: 'demo-set-002',
    key: 'org_social',
    value_json: {
      instagram: 'sosfocinhocarente',
      facebook: 'sosfocinhocarente',
      youtube: 'sosfocinhocarente',
    },
    public: true,
    updated_by: null,
    updated_at: now,
  },
  {
    id: 'demo-set-003',
    key: 'donations_pix',
    value_json: {
      pix_key: 'pix@sosfocinhocarente.org.br',
      pix_owner: 'SOS Focinho Carente',
    },
    public: true,
    updated_by: null,
    updated_at: now,
  },
  {
    id: 'demo-set-004',
    key: 'org_about',
    value_json: {
      mission:
        'Resgatar, cuidar e promover a adoção responsável de animais abandonados, além de conscientizar a comunidade sobre o bem-estar animal e o combate ao abandono.',
      short_description:
        'Organização sem fins lucrativos dedicada ao resgate, cuidado e adoção responsável de cães e gatos, mantida por doações e trabalho voluntário.',
    },
    public: true,
    updated_by: null,
    updated_at: now,
  },
];
