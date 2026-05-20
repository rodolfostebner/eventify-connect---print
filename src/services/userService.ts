import { supabase } from '../lib/supabase/client';

export interface ExhibitorLinkedUser {
  id: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  created_at: string;
}
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import type { AppUser, UserRole, UserEmailRole } from '../types';

export async function syncUser(authUser: SupabaseAuthUser): Promise<AppUser | null> {
  if (!supabase) return null;

  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('supabase_user_id', authUser.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('users').update({
      display_name: authUser.user_metadata?.full_name ?? existing.display_name,
      photo_url: authUser.user_metadata?.avatar_url ?? existing.photo_url,
    }).eq('supabase_user_id', authUser.id);
    return existing as AppUser;
  }

  const { data: preReg } = await supabase
    .from('user_email_roles')
    .select('*')
    .eq('email', authUser.email!)
    .maybeSingle();

  const { data: created, error } = await supabase
    .from('users')
    .insert({
      supabase_user_id: authUser.id,
      email: authUser.email!,
      display_name: authUser.user_metadata?.full_name ?? null,
      photo_url: authUser.user_metadata?.avatar_url ?? null,
      role: (preReg?.role as UserRole) ?? 'participant',
      event_id: preReg?.event_id ?? null,
      exhibitor_id: preReg?.exhibitor_id ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('[UserService] Erro ao criar usuário:', error);
    return null;
  }

  if (preReg) {
    await supabase.from('user_email_roles').delete().eq('email', authUser.email!);
  }

  return created as AppUser;
}

// ─── CRUD usuários (painel de admin) ─────────────────────────────────────────

export async function listUsers(): Promise<AppUser[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AppUser[];
}

export async function updateUserRole(userId: string, role: UserRole, eventId?: string | null, exhibitorId?: string | null): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('users').update({
    role,
    event_id: eventId ?? null,
    exhibitor_id: exhibitorId ?? null,
  }).eq('id', userId);
  if (error) throw error;
}

// ─── Pré-cadastro de email com role ──────────────────────────────────────────

export async function listEmailRoles(): Promise<UserEmailRole[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('user_email_roles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as UserEmailRole[];
}

export async function addEmailRole(params: Omit<UserEmailRole, 'created_at'>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('user_email_roles').upsert(params, { onConflict: 'email' });
  if (error) throw error;
}

export async function removeEmailRole(email: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('user_email_roles').delete().eq('email', email);
  if (error) throw error;
}

// ─── Beta mode: lookup/create por email sem Supabase Auth ────────────────────

export async function findOrCreateUserByEmail(email: string): Promise<AppUser | null> {
  if (!supabase) return null;
  const normalizedEmail = email.trim().toLowerCase();

  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (existing) return existing as AppUser;

  const { data: preReg } = await supabase
    .from('user_email_roles')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle();

  const { data: created, error } = await supabase
    .from('users')
    .insert({
      email: normalizedEmail,
      display_name: normalizedEmail.split('@')[0],
      role: (preReg?.role as UserRole) ?? 'participant',
      event_id: preReg?.event_id ?? null,
      exhibitor_id: preReg?.exhibitor_id ?? null,

    })
    .select()
    .single();

  if (error) {
    console.error('[UserService] Erro ao criar usuário beta:', error);
    return null;
  }

  if (preReg) {
    await supabase.from('user_email_roles').delete().eq('email', normalizedEmail);
  }

  return created as AppUser;
}
