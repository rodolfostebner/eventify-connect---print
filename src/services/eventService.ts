import { supabase } from "../lib/supabase/client";
import { uploadImage } from './storageService';
import type { EventData } from '../types';

/**
 * Subscribe to all events ordered by date descending.
 * Used by AdminDashboard.
 */
export function subscribeToEvents(
  onUpdate: (events: EventData[]) => void,
  onError?: (err: any) => void,
): () => void {
  if (!supabase) return () => { };

  // Initial fetch
  supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false })
    .then(({ data, error }) => {
      if (error) onError?.(error);
      else onUpdate(data as EventData[]);
    });

  // Real-time subscription
  const channel = supabase
    .channel('public:events')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'events' },
      () => {
        // Re-fetch all on any change for simplicity in admin panel
        supabase
          .from('events')
          .select('*')
          .order('date', { ascending: false })
          .then(({ data, error }) => {
            if (error) onError?.(error);
            else onUpdate(data as EventData[]);
          });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Helper for executing queries with retry in case of lock issues
async function executeWithRetry<T>(operation: () => any): Promise<T | null> {
  if (!supabase) return null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { data, error } = await operation();
      if (error) {
        const errMsg = error.message || '';
        if (errMsg.includes('lock') || errMsg.includes('Lock') || errMsg.includes('stole')) {
          console.warn(`[EventService] Lock collision detected on attempt ${attempt}. Retrying in ${attempt * 150}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 150));
          continue;
        }
        throw error;
      }
      return data;
    } catch (err: any) {
      const errMsg = err.message || '';
      if ((errMsg.includes('lock') || errMsg.includes('Lock') || errMsg.includes('stole')) && attempt < 3) {
        console.warn(`[EventService] Promise rejected with lock error on attempt ${attempt}. Retrying...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 150));
        continue;
      }
      throw err;
    }
  }
  return null;
}

/**
 * Subscribe to a single event by slug.
 */
export function subscribeToEvent(
  slug: string,
  onUpdate: (event: EventData | null) => void,
  onError?: (err: any) => void,
): () => void {
  if (!supabase) return () => { };

  const cleanSlug = slug.trim().toLowerCase();

  // Initial fetch with lock retry logic
  executeWithRetry<EventData>(() => 
    supabase
      .from('events')
      .select('*')
      .eq('slug', cleanSlug)
      .maybeSingle()
  )
    .then((data) => {
      onUpdate(data);
    })
    .catch((error) => {
      onError?.(error);
    });

  // Real-time subscription
  const channel = supabase
    .channel(`public:events:slug=eq.${cleanSlug}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'events',
        filter: `slug=eq.${cleanSlug}`
      },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          onUpdate(null);
        } else {
          onUpdate(payload.new as EventData);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Fetch a single event by id (used pelo portal do EventAdmin).
 */
export async function getEventById(id: string): Promise<EventData | null> {
  if (!supabase) return null;
  return await executeWithRetry<EventData>(() => 
    supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle()
  );
}

/**
 * Fetch a single event by slug (used pelo Admin Geral ao abrir o portal do evento).
 */
export async function getEventBySlug(slug: string): Promise<EventData | null> {
  if (!supabase) return null;
  return await executeWithRetry<EventData>(() => 
    supabase
      .from('events')
      .select('*')
      .eq('slug', slug.trim().toLowerCase())
      .maybeSingle()
  );
}

/**
 * Create a new event.
 */
export async function createEvent(data: Omit<EventData, 'id'>): Promise<string> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: result, error } = await supabase
    .from('events')
    .insert([data])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('SLUG_TAKEN');
    throw error;
  }

  return result.id;
}

/** 
 * Update fields on an existing event. 
 */
export async function updateEvent(id: string, data: Partial<EventData>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('events')
    .update(data)
    .eq('id', id);
  if (error) throw error;
}

/**
 * Inativa um evento (active = false) em vez de excluir permanentemente.
 */
export async function inactivateEvent(id: string): Promise<void> {
  await updateEvent(id, { active: false } as Partial<EventData>);
}

/**
 * Upload an event summary file to Cloudflare R2 (reusing image upload pipeline).
 */
export async function uploadEventSummary(eventId: string, file: File): Promise<string> {
  // We reuse the R2 storage service which returns the public URL
  return await uploadImage(file);
}
