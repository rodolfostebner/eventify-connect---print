/**
 * constants/index.ts
 *
 * Shared constants and enums for the Eventify platform.
 * Centralizes values that were previously hardcoded across page components.
 */

// ─── Event Status ─────────────────────────────────────────────────────────────

export enum EventStatus {
  PRE_EVENT = 'pre',
  LIVE = 'live',
  POST_EVENT = 'post',
}

// ─── Categorias de Expositor (fallback) ──────────────────────────────────────
// Lista padrão usada quando o evento ainda não definiu categorias próprias.
// As categorias reais são configuráveis por evento em events.exhibitor_categories.

export const DEFAULT_EXHIBITOR_CATEGORIES = ['Salgados', 'Doces', 'Artesanato', 'Outros'];

// ─── Route Paths ──────────────────────────────────────────────────────────────

export const ROUTES = {
  HOME: '/',
  EVENT: '/evento/:slug',
  TV: '/evento/:slug/tv',
  OPERATOR: '/evento/:slug/operator',
  MODERATION: '/evento/:slug/moderation',
} as const;
