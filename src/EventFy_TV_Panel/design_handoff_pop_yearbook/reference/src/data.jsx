// Shared mock data for the EventFy TV Panel design exploration.
// Three slide types: visitor photos, exhibitors, partners + raffle/alert moments.

const FAIR = {
  org: 'COLÉGIO JOURNEY',
  event: 'FEIRA DE EMPREENDEDORISMO 2026',
  shortEvent: 'Feira 2026',
  handle: '/fe2026',
  startsAt: '9h',
  endsAt: '16h',
  date: '21 MAI · 2026',
};

// Visitor photos — selfies people sent in, with reactions + category
const PHOTOS = [
  { id: 'v1', name: 'Cibelle Stebner', category: 'ROCKSTAR', emoji: '🎸', src: 'https://picsum.photos/seed/journey-selfie-1/1200/900', reactions: { heart: 2, rock: 2, fire: 2, laugh: 2 } },
  { id: 'v2', name: 'Rafael Tavares',  category: 'BOSS',     emoji: '👔', src: 'https://picsum.photos/seed/journey-selfie-2/1200/900', reactions: { heart: 5, rock: 1, fire: 3, laugh: 0 } },
  { id: 'v3', name: 'Mariana Lemos',   category: 'CRAFT',    emoji: '✂️', src: 'https://picsum.photos/seed/journey-selfie-3/1200/900', reactions: { heart: 7, rock: 0, fire: 1, laugh: 4 } },
  { id: 'v4', name: 'Pedro Hoffmann',  category: 'CHEF',     emoji: '🍳', src: 'https://picsum.photos/seed/journey-selfie-4/1200/900', reactions: { heart: 3, rock: 2, fire: 6, laugh: 1 } },
  { id: 'v5', name: 'Júlia Castro',    category: 'ARTIST',   emoji: '🎨', src: 'https://picsum.photos/seed/journey-selfie-5/1200/900', reactions: { heart: 9, rock: 1, fire: 2, laugh: 3 } },
];

const RANKING = [
  { rank: 1, name: 'Cibelle Stebner', votes: 12, src: 'https://picsum.photos/seed/journey-rank-1/200/200' },
  { rank: 2, name: 'Rafael Tavares',  votes: 9,  src: 'https://picsum.photos/seed/journey-rank-2/200/200' },
  { rank: 3, name: 'Mariana Lemos',   votes: 7,  src: 'https://picsum.photos/seed/journey-rank-3/200/200' },
  { rank: 4, name: 'Pedro Hoffmann',  votes: 4,  src: 'https://picsum.photos/seed/journey-rank-4/200/200' },
  { rank: 5, name: 'Júlia Castro',    votes: 3,  src: 'https://picsum.photos/seed/journey-rank-5/200/200' },
];

// Exhibitor stands. Each has an accent color the slide can theme to.
// `tier` controls how often it shows up + whether it gets the hero treatment.
const EXHIBITORS = [
  { id: 'e1', name: 'Capivara Dog',       cat: 'COMIDA',    emoji: '🌭', accent: '#E63946', tier: 'gold',     tagline: 'Feito por quem ama cachorro quente.', stand: 'A-12', product: 'https://picsum.photos/seed/journey-prod-hotdog/1200/900', insta: '@capivaradog' },
  { id: 'e2', name: 'Pedaço de Felicidade', cat: 'DOCES',   emoji: '🍰', accent: '#B5651D', tier: 'standard', tagline: 'Bolos pra qualquer ocasião.',        stand: 'B-04', product: 'https://picsum.photos/seed/journey-prod-cake/1200/900',    insta: '@pedaco.feliz' },
  { id: 'e3', name: 'Velas Aromáticas',   cat: 'CASA',      emoji: '🕯️', accent: '#D97757', tier: 'standard', tagline: 'Aromáticas, repelentes, decorativas.', stand: 'C-09', product: 'https://picsum.photos/seed/journey-prod-candle/1200/900',  insta: '@velas.ja' },
  { id: 'e4', name: 'Suco do Bem',        cat: 'BEBIDA',    emoji: '🧃', accent: '#2A9D8F', tier: 'gold',     tagline: 'Sucos naturais prensados na hora.',  stand: 'A-08', product: 'https://picsum.photos/seed/journey-prod-juice/1200/900',   insta: '@suco.do.bem' },
  { id: 'e5', name: 'Tear & Trama',       cat: 'ARTESANATO', emoji: '🧶', accent: '#7B2CBF', tier: 'standard', tagline: 'Crochê e bordado feito à mão.',     stand: 'D-02', product: 'https://picsum.photos/seed/journey-prod-yarn/1200/900',    insta: '@tear.trama' },
  { id: 'e6', name: 'Plant Lovers',       cat: 'PLANTAS',   emoji: '🪴', accent: '#3E8E3E', tier: 'standard', tagline: 'Mudas e suculentas pra todo canto.', stand: 'C-11', product: 'https://picsum.photos/seed/journey-prod-plant/1200/900',   insta: '@plant.lovers.fe' },
  { id: 'e7', name: 'Bling Studio',       cat: 'ACESSÓRIOS', emoji: '💎', accent: '#FF4D8F', tier: 'standard', tagline: 'Joias feitas com resina e flores secas.', stand: 'B-07', product: 'https://picsum.photos/seed/journey-prod-jewel/1200/900', insta: '@bling.studio' },
  { id: 'e8', name: 'Burger Boom',        cat: 'COMIDA',    emoji: '🍔', accent: '#F4A261', tier: 'gold',     tagline: 'Smash burgers grelhados na chapa.',  stand: 'A-03', product: 'https://picsum.photos/seed/journey-prod-burger/1200/900',  insta: '@burger.boom' },
];

// Sponsor / partner. Brand color is the entire slide's hero color.
const PARTNERS = [
  { id: 'p1', name: 'Stebner Câmbio',   role: 'PATROCINADOR OURO', accent: '#005DAA', textOn: '#FFFFFF', tagline: 'Apoiando a juventude empreendedora desde 2018.', logoText: 'STEBNER', tier: 'gold' },
  { id: 'p2', name: 'Padaria Estrela',  role: 'APOIO',             accent: '#FFC93C', textOn: '#1A1B3A', tagline: 'Pão quentinho desde 1962.',                       logoText: '★ ESTRELA',  tier: 'standard' },
  { id: 'p3', name: 'Livraria Janela',  role: 'PARCEIRO',          accent: '#1A8F5E', textOn: '#FFFFFF', tagline: 'Para os curiosos de todas as idades.',           logoText: 'JANELA',     tier: 'standard' },
  { id: 'p4', name: 'TechKids Lab',     role: 'PATROCINADOR PRATA', accent: '#7C3AED', textOn: '#FFFFFF', tagline: 'Programação e robótica pra quem tá começando.', logoText: 'TK LAB',     tier: 'gold' },
];

// Raffle / giveaway moment data
const RAFFLE = {
  prize: 'Kit Capivara Dog',
  prizeSub: '4 combos + camiseta',
  drawAt: '14:00',
  enteredCount: 217,
  winner: { name: 'Letícia Vargas', stand: 'visitante · /fe2026', src: 'https://picsum.photos/seed/journey-winner/600/600' },
};

// Alert / announcement
const ALERTS = {
  flash: { title: 'TUDO 50% OFF', sub: 'Últimos 30 minutos da feira. Aproveita.', kicker: 'AVISO · ENCERRAMENTO' },
  side:  { title: 'Capivara Dog acabou de soltar combo', sub: 'Combo duplo R$ 18 · enquanto durar', kicker: 'OFERTA RELÂMPAGO' },
  strip: { text: '★ RIFA em 12 minutos no estande A-12  ·  Burger Boom: combo R$ 22  ·  Bling Studio: brincos a partir de R$ 15  ·  Tear & Trama: aceita Pix' },
};

// Ticker — rotating one-liners across the bottom strip
const TICKER_ITEMS = [
  '📸 Envie sua foto em /fe2026',
  '🎁 Próxima rifa às 14h — Kit Capivara Dog',
  '🍔 Burger Boom — combo do dia R$ 22',
  '🕯️ Velas Aromáticas com 2 por R$ 30',
  '🧃 Suco do Bem — leve 3 pague 2',
  '⏰ Feira encerra às 16h',
];

Object.assign(window, { FAIR, PHOTOS, RANKING, EXHIBITORS, PARTNERS, RAFFLE, ALERTS, TICKER_ITEMS });
