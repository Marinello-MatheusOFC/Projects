export interface NewsItem {
  slug: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  image: string;
  author: string;
  category: string;
}

export const newsList: NewsItem[] = [
  {
    slug: 'feira-adocao-julho-2026',
    title: 'Feira de Adoção de Julho bate recorde de animais adotados',
    summary: 'Mais de 40 animais encontraram um novo lar durante o evento realizado no Parque Municipal.',
    content: `No último sábado, realizamos mais uma edição da nossa Feira de Adoção, e o resultado foi emocionante: 42 animais — entre cães, gatos e coelhos — encontraram famílias amorosas.

O evento aconteceu no Parque Municipal, das 9h às 17h, e contou com a presença de centenas de visitantes. Cada adoção foi precedida por uma entrevista de compatibilidade, garantindo que cada animal fosse para o lar mais adequado ao seu perfil.

"Estamos muito felizes com o resultado. Cada adoção responsável representa uma vida transformada", comemorou Marina Costa, coordenadora da ONG.

Agradecemos a todos os voluntários que dedicaram seu tempo e carinho para tornar esse dia possível. A próxima feira já tem data marcada: 20 de agosto.`,
    date: '2026-07-28',
    image: '/images/demo/adoption-event.jpg',
    author: 'Marina Costa',
    category: 'Eventos',
  },
  {
    slug: 'campanha-inverno-2026',
    title: 'Campanha do Agasalho Animal arrecada mais de 2 toneladas',
    summary: 'Doações de cobertores, roupinhas e ração vão beneficiar mais de 200 animais resgatados.',
    content: `A Campanha do Agasalho Animal deste ano foi um sucesso absoluto! Graças à generosidade da comunidade, arrecadamos mais de 2 toneladas entre cobertores, roupinhas, ração e medicamentos.

Os itens já estão sendo distribuídos para os mais de 200 animais sob nossos cuidados, além de famílias de protetores independentes cadastradas em nosso programa de apoio.

"Ver a solidariedade da nossa cidade é algo que aquece o coração. Cada cobertor doado significa uma noite mais quente para um animal que espera por um lar", destacou Carlos Mendes, fundador da ONG.

A campanha segue até o final de agosto. Pontos de coleta estão espalhados por toda a cidade.`,
    date: '2026-07-20',
    image: '/images/demo/care-volunteer.jpg',
    author: 'Carlos Mendes',
    category: 'Campanhas',
  },
  {
    slug: 'novo-espaco-abrigo',
    title: 'Ganhamos um novo espaço para o abrigo temporário',
    summary: 'Parceria com a Prefeitura garante um espaço maior e mais adequado para os animais resgatados.',
    content: `É com imensa alegria que anunciamos: a SOS Focinho Carente agora conta com um novo espaço para seu abrigo temporário! Graças a uma parceria firmada com a Prefeitura Municipal, ganhamos um galpão revitalizado de 500m².

O novo espaço conta com canis amplos, gatil com aquecimento, área de quarentena, sala de atendimento veterinário e um pátio para socialização dos animais.

"Esse novo espaço vai nos permitir atender melhor cada animal resgatado, com mais dignidade e conforto enquanto eles esperam por um lar definitivo", comemorou a equipe.

As obras de adaptação já começaram e a previsão de inauguração é setembro. Em breve divulgaremos fotos do antes e depois!`,
    date: '2026-07-15',
    image: '/images/demo/shelter-space.jpg',
    author: 'Equipe SOS',
    category: 'Institucional',
  },
  {
    slug: 'historias-adocao-luna',
    title: 'Luna: da recuperação à adoção — uma história de superação',
    summary: 'Resgatada com graves ferimentos, Luna se recuperou e encontrou uma família que a ama incondicionalmente.',
    content: `Hoje queremos compartilhar a história inspiradora de Luna, uma cadela de aproximadamente 3 anos que chegou até nós em condições críticas.

Luna foi encontrada por um voluntário às margens de uma rodovia, com ferimentos graves e sinais de maus-tratos. Imediatamente recebeu atendimento veterinário de emergência e iniciou um longo processo de recuperação.

Durante três meses, Luna foi cuidada com muito amor por nossa equipe e por sua tutora temporária. Aos poucos, sua confiança nos seres humanos foi sendo reconstruída.

"Eu vi a Luna no site da ONG e me apaixonei. No dia em que a conheci, soube que ela era minha alma gêmea canina", conta Paula, sua nova tutora.

Hoje, Luna vive feliz em um lar cheio de amor, com direito a caminhadas diárias e muito carinho. Histórias como a dela nos lembram porque fazemos o que fazemos.`,
    date: '2026-07-10',
    image: '/images/demo/animal-dog-02.jpg',
    author: 'Paula Oliveira',
    category: 'Histórias',
  },
  {
    slug: 'mutirao-castracao',
    title: 'Mutirão de Castração gratuito atende 150 animais em um dia',
    summary: 'Ação em parceria com clínicas veterinárias populares beneficiou tutores de baixa renda.',
    content: `No último fim de semana, realizamos um mutirão de castração que atendeu 150 animais em um único dia! A ação, realizada em parceria com clínicas veterinárias parceiras, foi voltada para tutores de baixa renda.

A castração é uma das medidas mais eficazes para o controle populacional de animais abandonados. Por isso, investimos forte nessa iniciativa.

"Conseguimos castrar cães e gatos, machos e fêmeas, todos cadastrados previamente. A procura foi tão grande que tivemos que abrir lista de espera para o próximo mutirão", explicou a coordenadora.

Nosso objetivo é realizar mutirões trimestrais. Se você quer participar do próximo, fique de olho em nossas redes sociais!`,
    date: '2026-07-05',
    image: '/images/demo/animal-group.jpg',
    author: 'Dr. Rafael Souza',
    category: 'Campanhas',
  },
  {
    slug: 'voluntario-destaque-junho',
    title: 'Conheça Maria, nossa voluntária do mês que inspirou toda a equipe',
    summary: 'Maria dedica mais de 20 horas semanais ao abrigo e transformou a rotina dos animais idosos.',
    content: `Todo mês, destacamos um voluntário que fez a diferença. Em junho, a escolhida foi Maria Aparecida, de 62 anos, que dedica mais de 20 horas semanais ao abrigo.

Maria é aposentada e encontrou no voluntariado um novo propósito de vida. Ela se dedica especialmente aos animais idosos — aqueles que muitas vezes são preteridos nas feiras de adoção.

"Eles me ensinam tanto quanto eu cuido deles. Cada rabinho abanando é uma recompensa que não tem preço", conta Maria emocionada.

Além de cuidar dos animais, Maria também auxilia na organização de eventos e na recepção de visitantes. Sua energia contagiante inspirou outros voluntários a se dedicarem ainda mais.

Quer ser voluntário também? Acesse nossa página de voluntariado e cadastre-se!`,
    date: '2026-06-28',
    image: '/images/demo/volunteer-team.jpg',
    author: 'Equipe SOS',
    category: 'Voluntariado',
  },
];
