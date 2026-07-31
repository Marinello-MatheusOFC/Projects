export interface EventItem {
  slug: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  time: string;
  location: string;
  image: string;
  status: 'upcoming' | 'ongoing' | 'past';
  category: string;
}

export const eventsList: EventItem[] = [
  {
    slug: 'feira-adocao-agosto',
    title: 'Feira de Adoção — Agosto 2026',
    summary: 'Venha conhecer cães, gatos e coelhos que buscam um lar cheio de amor.',
    content: `Nossa tradicional Feira de Adoção está de volta! Será um dia inteiro dedicado a conectar animais resgatados a famílias amorosas.

Antes da adoção, realizamos uma entrevista para garantir a compatibilidade entre o animal e a família. Leve seu documento de identidade, comprovante de residência e disponibilidade de tempo para a adaptação.

Teremos também barracas de doces, artesanato e brechó beneficente. Toda a renda será revertida para os cuidados dos animais.

Traga toda a família! Crianças são muito bem-vindas — afinal, educar os pequenos sobre adoção responsável é plantar sementes para um futuro melhor.`,
    date: '2026-08-20',
    time: '09:00 - 17:00',
    location: 'Parque Municipal — Portão 3',
    image: '/images/demo/adoption-event.jpg',
    status: 'upcoming',
    category: 'Feira',
  },
  {
    slug: 'mutirao-castracao-agosto',
    title: 'Mutirão de Castração — Agosto 2026',
    summary: 'Castração gratuita para cães e gatos de tutores de baixa renda. Vagas limitadas!',
    content: `Nosso mutirão de castração está de volta! Em parceria com clínicas veterinárias parceiras, ofereceremos castração gratuita para cães e gatos.

As inscrições devem ser feitas antecipadamente pelo nosso site ou presencialmente na sede da ONG. Serão priorizados tutores de baixa renda e protetores independentes.

Os animais passam por avaliação veterinária prévia e recebem medicação pós-operatória. O recolhimento é feito no dia seguinte ao procedimento.

Importante: animais devem estar em jejum de 8 horas e não podem estar no cio ou gestantes.`,
    date: '2026-08-08',
    time: '07:00 - 18:00',
    location: 'Clínica Veterinária Popular — Centro',
    image: '/images/demo/animal-group.jpg',
    status: 'upcoming',
    category: 'Campanha',
  },
  {
    slug: 'bazar-beneficente',
    title: 'Bazar Beneficente — Edição de Inverno',
    summary: 'Roupas, calçados, livros e objetos de decoração com preços especiais. Toda renda para os animais!',
    content: `Participe do nosso Bazar Beneficente de Inverno! Teremos roupas, calçados, acessórios, livros, brinquedos e objetos de decoração com preços imperdíveis.

Toda a renda arrecadada será destinada aos cuidados dos animais resgatados: alimentação, medicamentos, castrações e manutenção do abrigo.

Aceitamos doações de itens em bom estado até a véspera do evento. Entre em contato conosco para agendar a entrega.

Venham prestigiar! Além de garantir peças incríveis, você estará ajudando animais que precisam de nós.`,
    date: '2026-08-01',
    time: '10:00 - 18:00',
    location: 'Sede da ONG — Rua das Flores, 123',
    image: '/images/demo/community-event.jpg',
    status: 'upcoming',
    category: 'Bazar',
  },
  {
    slug: 'mutirao-adocao-especial',
    title: 'Adoção Especial — Animais Idosos e PCDs',
    summary: 'Campanha focada em animais idosos e com deficiência que merecem uma chance.',
    content: `Muitos animais idosos e com deficiência esperam há meses — às vezes anos — por um lar. Esta campanha é dedicada a eles.

Oferecemos acompanhamento veterinário vitalício, isenção de taxas de adoção e suporte contínuo da nossa equipe.

Cada animal tem sua história de superação contada em painéis durante o evento. Conhecê-los é se apaixonar.

"Adotar um animal idoso foi a melhor decisão da minha vida. Ele já chegou na minha casa grato e amoroso", compartilha um tutor que adotou em edição anterior.

Se você tem espaço no coração e na casa, venha conhecer esses guerreiros.`,
    date: '2026-07-25',
    time: '09:00 - 14:00',
    location: 'Pet Park — Bairro Jardim América',
    image: '/images/demo/animal-dog-01.jpg',
    status: 'ongoing',
    category: 'Feira',
  },
  {
    slug: 'oficina-educativa',
    title: 'Oficina de Educação Ambiental e Bem-Estar Animal',
    summary: 'Atividade gratuita para crianças com ensinamentos sobre cuidado animal e meio ambiente.',
    content: `Nossa Oficina Educativa é um sucesso entre as crianças! Com atividades lúdicas, jogos e contação de histórias, os pequenos aprendem sobre:

- Cuidados básicos com animais domésticos
- Importância da castração e vacinação
- Respeito aos animais de rua
- Preservação do meio ambiente

A atividade é gratuita e não precisa de inscrição prévia. As crianças devem estar acompanhadas por um responsável.

Ao final, cada criança ganha um certificado de "Protetor Mirim" e um adesivo personalizado.`,
    date: '2026-07-18',
    time: '14:00 - 17:00',
    location: 'Biblioteca Municipal — Sala Infantil',
    image: '/images/demo/volunteer-care.jpg',
    status: 'past',
    category: 'Educativo',
  },
  {
    slug: 'caminhada-animal',
    title: 'Cãominhada da Solidariedade',
    summary: 'Caminhada aberta a todos os tutores e seus cães para arrecadar ração e cobertores.',
    content: `A Cãominhada da Solidariedade é um dos eventos mais queridos da nossa agenda! Tutores e seus cães percorrem um trajeto de 3km pelo parque.

A entrada é solidária: cada participante deve doar 1kg de ração ou um cobertor novo/usado em bom estado. Os itens arrecadados são destinados ao abrigo.

Teremos pontos de hidratação para humanos e pets, além de veterinários voluntários ao longo do percurso. Haverá premiação para o cão mais simpático, mais estiloso e mais animado!

Não esqueça: use coleira e guia, traga saquinhos para recolher os dejetos e mantenha seu cão hidratado.`,
    date: '2026-07-10',
    time: '08:00 - 11:00',
    location: 'Parque Ecológico — Entrada Principal',
    image: '/images/demo/hero-dog.jpg',
    status: 'past',
    category: 'Passeio',
  },
];
