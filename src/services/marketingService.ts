import { supabase } from '../lib/supabase/client';

export interface MarketingContact {
  id: string;
  event_id: string;
  instagram: string | null;
  phone: string | null;
  email: string | null;
}

export interface MarketingPhoto {
  id: string;
  event_id: string;
  image_url: string;
  phrase: string | null;
  text: string | null;
  order_index: number;
  active: boolean;
  created_at: string;
}

// --- Contato ---

export async function getMarketingContact(eventId: string): Promise<MarketingContact | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('event_marketing')
    .select('*')
    .eq('event_id', eventId)
    .maybeSingle();
  return data;
}

export async function saveMarketingContact(
  eventId: string,
  contact: { instagram?: string; phone?: string; email?: string }
): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('event_marketing')
    .upsert({ event_id: eventId, ...contact, updated_at: new Date().toISOString() }, { onConflict: 'event_id' });
}

// --- Fotos ---

export async function getMarketingPhotos(eventId: string): Promise<MarketingPhoto[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('event_marketing_photos')
    .select('*')
    .eq('event_id', eventId)
    .order('order_index', { ascending: true });
  return data || [];
}

export async function createMarketingPhoto(
  eventId: string,
  photo: { image_url: string; phrase?: string; text?: string; order_index?: number }
): Promise<MarketingPhoto | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('event_marketing_photos')
    .insert({ event_id: eventId, ...photo })
    .select()
    .single();
  return data;
}

export async function updateMarketingPhoto(
  id: string,
  updates: { image_url?: string; phrase?: string; text?: string; order_index?: number; active?: boolean }
): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('event_marketing_photos')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
}

export async function deleteMarketingPhoto(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('event_marketing_photos').delete().eq('id', id);
}

export async function reorderMarketingPhotos(photos: { id: string; order_index: number }[]): Promise<void> {
  if (!supabase) return;
  await Promise.all(
    photos.map(({ id, order_index }) =>
      supabase!.from('event_marketing_photos').update({ order_index }).eq('id', id)
    )
  );
}
