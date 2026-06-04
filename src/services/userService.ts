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
      // Pré-cadastro de role/evento/stand definido pelo admin antes do login.
      // Buscado uma vez e aplicado em QUALQUER caminho — inclusive quando o
      // usuário já existe (ex.: logou antes como participante). Sem isto o
      // pré-cadastro pendente era ignorado e o usuário permanecia participante.
      const { data: preReg } = await supabase
        .from('user_email_roles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      const consumePreReg = async () => {
        if (preReg) await supabase!.from('user_email_roles').delete().eq('email', email);
      };

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
        const resolvedName = authUser.user_metadata?.full_name ?? byUid.display_name ?? email;
        const resolvedPhoto = authUser.user_metadata?.avatar_url ?? byUid.photo_url;
        const rolePatch = preReg ? {
          role: preReg.role as UserRole,
          event_id: preReg.event_id ?? byUid.event_id ?? null,
          exhibitor_id: preReg.exhibitor_id ?? byUid.exhibitor_id ?? null,
        } : {};
        await supabase.from('users').update({
          display_name: resolvedName,
          photo_url: resolvedPhoto,
          ...rolePatch,
        }).eq('supabase_user_id', authUser.id);
        await consumePreReg();
        return { ...byUid, display_name: resolvedName, photo_url: resolvedPhoto, ...rolePatch } as AppUser;
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
        const resolvedName = authUser.user_metadata?.full_name ?? byEmail.display_name ?? email;
        const resolvedPhoto = authUser.user_metadata?.avatar_url ?? byEmail.photo_url;
        const rolePatch = preReg ? {
          role: preReg.role as UserRole,
          event_id: preReg.event_id ?? byEmail.event_id ?? null,
          exhibitor_id: preReg.exhibitor_id ?? byEmail.exhibitor_id ?? null,
        } : {};
        // Vincula o supabase_user_id ao registro existente (por id, não por email)
        // e finaliza o pré-cadastro pendente, se houver.
        await supabase.from('users').update({
          supabase_user_id: authUser.id,
          display_name: resolvedName,
          photo_url: resolvedPhoto,
          ...rolePatch,
        }).eq('id', byEmail.id);
        await consumePreReg();
        return { ...byEmail, supabase_user_id: authUser.id, display_name: resolvedName, photo_url: resolvedPhoto, ...rolePatch } as AppUser;
      }

      // 3. Usuário novo — aplica pré-cadastro de role/evento/stand
      const { data: created, error } = await supabase
        .from('users')
        .insert({
          supabase_user_id: authUser.id,
          email,
          display_name: authUser.user_metadata?.full_name ?? email,
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

      await consumePreReg();
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

export async function deleteUser(userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) throw error;
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

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .order('created_at', { ascending: true })
    .limit(1);
  return (data?.[0] as AppUser) ?? null;
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

  const { data: preReg } = await supabase
    .from('user_email_roles')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (rows?.[0]) {
    const existing = rows[0] as AppUser;
    // Usuário já existe + há pré-cadastro pendente: finaliza o cadastro
    // aplicando role/evento/stand (senão permaneceria como participante).
    if (preReg) {
      const patch = {
        role: preReg.role as UserRole,
        event_id: preReg.event_id ?? existing.event_id ?? null,
        exhibitor_id: preReg.exhibitor_id ?? existing.exhibitor_id ?? null,
        display_name: existing.display_name || normalizedEmail,
      };
      await supabase.from('users').update(patch).eq('id', existing.id);
      await supabase.from('user_email_roles').delete().eq('email', normalizedEmail);
      return { ...existing, ...patch } as AppUser;
    }
    // Se display_name estiver vazio, atualiza com o email
    if (!existing.display_name) {
      await supabase.from('users').update({ display_name: normalizedEmail }).eq('id', existing.id);
      return { ...existing, display_name: normalizedEmail } as AppUser;
    }
    return existing;
  }

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
