import { supabase } from '../lib/supabase';

/**
 * Interface compatível com o resto do app (originalmente do Firebase).
 */
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Sign in using Magic Link (Supabase OTP).
 */
export async function login(email: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin
    }
  });

  if (error) {
    console.error('Error during magic link login:', error);
    throw error;
  }
}

/**
 * Sign in using Google (Supabase OAuth).
 */
export async function loginWithGoogle(): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });

  if (error) {
    console.error('Error during Google login:', error);
    throw error;
  }
}

/**
 * Sign in using Email and Password.
 */
export async function loginWithPassword(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error during password login:', error);
    throw error;
  }
}

/**
 * Update the current user's password.
 */
export async function updatePassword(password: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}



/**
 * Sign out the current user.
 */
export async function logout(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Subscribe to auth state changes and map Supabase user to our internal User type.
 */
export function subscribeToAuth(onUpdate: (user: User | null) => void): () => void {
  if (!supabase) return () => {};

  // Get current session first
  supabase.auth.getSession().then(({ data: { session } }) => {
    onUpdate(session?.user ? mapSupabaseUser(session.user) : null);
  });

  // Listen for changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    onUpdate(session?.user ? mapSupabaseUser(session.user) : null);
  });

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Helper to map Supabase User to our internal User interface.
 */
function mapSupabaseUser(sbUser: any): User {
  return {
    uid: sbUser.id,
    email: sbUser.email ?? null,
    displayName: sbUser.user_metadata?.full_name ?? sbUser.user_metadata?.name ?? 'Usuário',
    photoURL: sbUser.user_metadata?.avatar_url ?? null,
  };
}



/**
 * Listen for authentication state changes (Legacy wrapper).
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return subscribeToAuth(callback);
}
