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

let activeSyncPromise: Promise<AppUser | null> | null = null;
let activeSyncUserId: string | null = null;

export async function syncUser(authUser: SupabaseAuthUser): Promise<AppUser | null> {
  if (!supabase) return null;
  const email = authUser.email!.trim().toLowerCase();

  // Deduplicar chamadas concorrentes para o mesmo usuário
  if (activeSyncPromise && activeSyncUserId === authUser.id) {
    return activeSyncPromise;
  }

  activeSyncUserId = authUser.id;
  activeSyncPromise = (async () => {
    try {
      // 1. Busca pelo supabase_user_id — caminho rápido após o primeiro login
      const { data: byUid, error: uidError } = await supabase
        .from('users')
        .select('*')
        .eq('supabase_user_id', authUser.id)
        .maybeSingle();

      if (uidError) {
        console.warn('[UserService] supabase_user_id lookup error:', uidError.message);
      }

      if (byUid) {
        await supabase.from('users').update({
          display_name: authUser.user_metadata?.full_name ?? byUid.display_name,
          photo_url: authUser.user_metadata?.avatar_url ?? byUid.photo_url,
        }).eq('supabase_user_id', authUser.id);
        return byUid as AppUser;
      }

      // 2. Busca por email — limit(1) garante que funciona mesmo se houver duplicatas
      const { data: emailRows } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: true })
        .limit(1);

      const byEmail = emailRows?.[0] ?? null;

      if (byEmail) {
        // Vincula o supabase_user_id ao registro existente (por id, não por email)
        await supabase.from('users').update({
          supabase_user_id: authUser.id,
          display_name: authUser.user_metadata?.full_name ?? byEmail.display_name,
          photo_url: authUser.user_metadata?.avatar_url ?? byEmail.photo_url,
        }).eq('id', byEmail.id);
        return { ...byEmail, supabase_user_id: authUser.id } as AppUser;
      }

      // 3. Usuário novo — verifica pré-cadastro de role
      const { data: preReg } = await supabase
        .from('user_email_roles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      const { data: created, error } = await supabase
        .from('users')
        .insert({
          supabase_user_id: authUser.id,
          email,
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
        await supabase.from('user_email_roles').delete().eq('email', email);
      }

      return created as AppUser;
    } catch (error) {
      console.error('[UserService] Erro na sincronização do usuário:', error);
      return null;
    } finally {
      activeSyncPromise = null;
      activeSyncUserId = null;
    }
  })();

  return activeSyncPromise;
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

export async function listAvaliadores(eventId: string): Promise<ExhibitorLinkedUser[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('users')
    .select('id, email, display_name, photo_url, created_at')
    .eq('event_id', eventId)
    .eq('role', 'avaliador')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as ExhibitorLinkedUser[];
}

export async function updateUserDisplayName(userId: string, displayName: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('users').update({ display_name: displayName }).eq('id', userId);
  if (error) throw error;
}

// ─── Beta mode: lookup/create por email sem Supabase Auth ────────────────────

export async function findOrCreateUserByEmail(email: string): Promise<AppUser | null> {
  if (!supabase) return null;
  const normalizedEmail = email.trim().toLowerCase();

  // limit(1) garante que funciona mesmo se houver duplicatas na tabela
  const { data: rows } = await supabase
    .from('users')
    .select('*')
    .eq('email', normalizedEmail)
    .order('created_at', { ascending: true })
    .limit(1);

  if (rows?.[0]) return rows[0] as AppUser;

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
