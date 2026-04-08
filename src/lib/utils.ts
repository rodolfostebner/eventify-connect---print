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
