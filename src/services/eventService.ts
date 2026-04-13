import { supabase } from "../lib/supabase/client";
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

  // Initial fetch
  supabase
    .from('events')
    .select('*')
    .eq('slug', cleanSlug)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) onError?.(error);
      else onUpdate(data as EventData | null);
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
 * Delete an event document.
 */
export async function deleteEvent(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/**
 * Upload an event summary file to Supabase Storage.
 */
export async function uploadEventSummary(eventId: string, file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase not initialized');

  const filePath = `${eventId}/${file.name}`;
  const { error } = await supabase.storage
    .from('event-summaries')
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage
    .from('event-summaries')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
