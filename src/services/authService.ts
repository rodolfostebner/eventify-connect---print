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

/**
 * Verifica o código OTP de 6 dígitos enviado por e-mail.
 *
 * Usamos código digitado (em vez do clique no magic link) porque scanners de
 * e-mail — Microsoft Safe Links (Outlook/Hotmail) e Apple Mail Privacy
 * Protection (iCloud) — pré-carregam o link e consomem o token de uso único
 * antes do usuário clicar, causando "otp_expired". O código é digitado no
 * mesmo navegador onde o login foi solicitado, contornando esse problema.
 */
export async function verifyEmailOtp(email: string, token: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'email',
  });
  if (error) throw error;
}

export async function logout(): Promise<void> {
  localStorage.removeItem('eventify_beta_session');
  if (!supabase) return;
  await supabase.auth.signOut();
}

