import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAppUrl() {
  // Use VITE_APP_URL if defined, otherwise fallback to window.location.origin
  const url = import.meta.env.VITE_APP_URL || window.location.origin;
  // Ensure no trailing slash
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

// ─── Data do evento como "relógio de parede" (sem fuso horário) ──────────────
// A data do evento é tratada como hora literal: a hora cadastrada é a hora
// exibida e contada, sem conversão de timezone. Por isso NÃO usamos
// toISOString()/parse com fuso — apenas os componentes Y-M-D H:M.

/**
 * Valor para um <input type="datetime-local"> a partir da data armazenada.
 * Retorna "YYYY-MM-DDTHH:mm" (os 16 primeiros caracteres, ignorando qualquer
 * designador de fuso). Use o valor cru do input direto no onChange (sem Date()).
 */
export function toDatetimeLocalValue(value?: string | null): string {
  if (!value || typeof value !== 'string') return '';
  return value.slice(0, 16);
}

/**
 * Faz parse de uma data de evento como hora local (relógio de parede),
 * ignorando qualquer fuso (Z/offset) presente na string. Garante que a
 * contagem regressiva use exatamente a hora cadastrada vs. a hora atual.
 */
export function parseEventDate(value?: string | null): Date | null {
  if (!value || typeof value !== 'string') return null;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h = '0', mi = '0'] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));
}
