import { supabase } from '../lib/supabase/client';

export async function loginWithGoogle(): Promise<void> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function loginWithMagicLink(email: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function logout(): Promise<void> {
  localStorage.removeItem('eventify_beta_session');
  if (!supabase) return;
  await supabase.auth.signOut();
}
