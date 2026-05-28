import { supabase } from '../lib/supabase/client';

export async function loginWithGoogle(redirectTo?: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectTo || window.location.href },
  });
  if (error) throw error;
}

export async function loginWithMagicLink(email: string, redirectTo?: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo || window.location.href },
  });
  if (error) throw error;
}

export async function logout(): Promise<void> {
  localStorage.removeItem('eventify_beta_session');
  if (!supabase) return;
  await supabase.auth.signOut();
}

