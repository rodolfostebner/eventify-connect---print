// ─── Temas plugáveis do telão ─────────────────────────────────────────────────
// Cada tema fornece os tokens visuais que os módulos consomem. O motor de rotação
// (TVDisplay) é agnóstico ao tema — só o visual muda.

export type TvThemeId = 'pop-yearbook';

export interface TvTheme {
  id: TvThemeId;
  label: string;
  // Fontes Google a carregar (href do <link>)
  fontHref?: string;
  // Famílias tipográficas
  fontDisplay: string;   // títulos grandes (Mochiy Pop One)
  fontBody: string;      // textos (Fredoka)
  fontHand: string;      // manuscrito (Caveat)
  fontSerif: string;     // serifada elegante (Fraunces)
  // Cores base
  paper: string;         // fundo "papel craft"
  ink: string;           // texto principal
  inkSoft: string;       // texto secundário
  accent: string;        // cor de destaque
  accent2: string;       // cor de destaque secundária
  frame: string;         // moldura polaroid
  tape: string;          // fita adesiva
}

export const POP_YEARBOOK: TvTheme = {
  id: 'pop-yearbook',
  label: 'Pop Yearbook',
  fontHref:
    'https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&family=Fredoka:wght@400;500;600;700&family=Caveat:wght@500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&display=swap',
  fontDisplay: "'Mochiy Pop One', system-ui, sans-serif",
  fontBody: "'Fredoka', system-ui, sans-serif",
  fontHand: "'Caveat', cursive",
  fontSerif: "'Fraunces', Georgia, serif",
  paper: '#F5ECDD',
  ink: '#3A2E26',
  inkSoft: '#8a7563',
  accent: '#E5683C',
  accent2: '#2E8B8B',
  frame: '#FFFDF8',
  tape: 'rgba(229, 168, 153, 0.55)',
};

export const TV_THEMES: Record<string, TvTheme> = {
  'pop-yearbook': POP_YEARBOOK,
};

export function getTvTheme(id?: string | null): TvTheme {
  return TV_THEMES[id ?? ''] ?? POP_YEARBOOK;
}

// Carrega o <link> de fontes do tema uma única vez.
export function ensureThemeFonts(theme: TvTheme) {
  if (!theme.fontHref) return;
  const id = `tv-theme-fonts-${theme.id}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = theme.fontHref;
  document.head.appendChild(link);
}

// ─── Imagem do expositor no telão ─────────────────────────────────────────────
// Padrão: foto do stand com fallback para a logo. O cadastro do expositor pode
// inverter (tv_use_logo) para stands cuja logo representa melhor que a foto.

export function tvImageFor(ex: { photo_url?: string | null; logo_url?: string | null; tv_use_logo?: boolean }): string {
  return (ex.tv_use_logo
    ? ex.logo_url || ex.photo_url
    : ex.photo_url || ex.logo_url) || '';
}

// ─── Módulos de rotação (ordem padrão) ────────────────────────────────────────
// MOD-06 (boas-vindas/marketing) abre a rotação: é a "tela inicial" do telão e
// reaparece no começo de cada ciclo. Sem isto, com muitos expositores (MOD-04)
// e parceiros (MOD-05) o ciclo fica longo e o welcome — se ficasse por último —
// só apareceria por poucos segundos a cada vários minutos.

export const ROTATION_MODULES = [
  'mod06', 'mod01', 'mod02', 'mod03', 'mod04', 'mod05', 'mod07',
] as const;

export type RotationModuleId = typeof ROTATION_MODULES[number];

// ─── Personalidade do visitante (MOD-01) ──────────────────────────────────────
// Derivada da reação predominante recebida na foto.

const PERSONALITY: Record<string, string> = {
  '🔥': 'On Fire',
  '❤️': 'Amado',
  '❤': 'Amado',
  '😍': 'Apaixonante',
  '😂': 'Hilário',
  '🤣': 'Hilário',
  '👏': 'Aplaudido',
  '😮': 'Surpreendente',
  '🥹': 'Emocionante',
  '⭐': 'Estrela',
  '🎉': 'Festa',
};

export function personalityFor(reactionCounts?: Record<string, number>): { emoji: string; label: string; total: number } {
  const entries = Object.entries(reactionCounts ?? {});
  if (entries.length === 0) return { emoji: '⭐', label: 'Destaque', total: 0 };
  const total = entries.reduce((s, [, n]) => s + n, 0);
  const [topEmoji] = entries.sort((a, b) => b[1] - a[1])[0];
  return { emoji: topEmoji, label: PERSONALITY[topEmoji] ?? 'Destaque', total };
}

export function totalReactions(reactionCounts?: Record<string, number>): number {
  return Object.values(reactionCounts ?? {}).reduce((s, n) => s + n, 0);
}
