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

// ─── Route Paths ──────────────────────────────────────────────────────────────

export const ROUTES = {
  HOME: '/',
  EVENT: '/evento/:slug',
  TV: '/evento/:slug/tv',
  OPERATOR: '/evento/:slug/operator',
  MODERATION: '/evento/:slug/moderation',
} as const;
