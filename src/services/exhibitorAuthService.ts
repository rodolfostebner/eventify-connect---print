import { supabase } from '../lib/supabase/client';

const EXHIBITOR_EMAIL_DOMAIN = 'expo.eventify.app';

export function buildEmail(username: string): string {
  return `${username}@${EXHIBITOR_EMAIL_DOMAIN}`;
}

export async function loginExhibitor(username: string, password: string) {
  if (!supabase) throw new Error('Supabase não inicializado');
  const email = buildEmail(username);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logoutExhibitor(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function createExhibitorUser(params: {
  username: string;
  password: string;
  exhibitorId: string;
}): Promise<{ userId: string; username: string; email: string }> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { data, error } = await supabase.functions.invoke('create-exhibitor-user', {
    body: params,
  });
  if (error) throw error;
  if (data?.error === 'USERNAME_TAKEN') throw new Error('USERNAME_TAKEN');
  return data;
}

export async function resetExhibitorPassword(params: {
  supabaseUserId: string;
  newPassword: string;
}): Promise<void> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { data, error } = await supabase.functions.invoke('reset-exhibitor-password', {
    body: params,
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
}

export function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  return Array.from(
    { length: 12 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

export function generateUsername(
  exhibitorNumber: number,
  eventSlug: string,
  userName: string,
): string {
  const clean = (s: string) =>
    s.toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '');
  return `exp${exhibitorNumber}_${clean(eventSlug)}_${clean(userName)}`;
}
