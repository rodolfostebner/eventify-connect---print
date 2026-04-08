import { supabase } from '../lib/supabase';
import type { PhotoData } from '../types';

/**
 * Fetch all approved photos for a specific event.
 */
export async function fetchPosts(eventId: string): Promise<PhotoData[]> {
  if (!supabase) {
    console.warn('[PostsService] Supabase client not initialized. Returning empty list.');
    return [];
  }

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[PostsService] Error fetching posts:', error);
    throw error;
  }

  return (data || []).map(mapRowToPhotoData);
}

/**
 * Fetch ALL photos for a specific event (any status).
 * Used by ModerationPanel.
 */
export async function fetchAllPosts(eventId: string): Promise<PhotoData[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[PostsService] Error fetching all posts:', error);
    throw error;
  }

  return (data || []).map(mapRowToPhotoData);
}

/**
 * Create a new post (photo) in Supabase.
 */
export async function createPost(post: Partial<PhotoData>): Promise<PhotoData> {
  if (!supabase) {
    throw new Error('[PostsService] Supabase client not initialized.');
  }

  const row = mapPhotoDataToRow(post);

  const { data, error } = await supabase
    .from('photos')
    .insert([row])
    .select()
    .single();

  if (error) {
    console.error('[PostsService] Error creating post:', error);
    throw error;
  }

  return mapRowToPhotoData(data);
}

/**
 * Subscribe to real-time changes in the photos table for a specific event.
 */
export function subscribeToPosts(eventId: string, onUpdate: (payload: any) => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`public:photos:event_id=eq.${eventId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'photos',
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        const mappedPayload = {
          ...payload,
          new: payload.new ? mapRowToPhotoData(payload.new) : null,
          old: payload.old ? mapRowToPhotoData(payload.old) : null,
        };
        onUpdate(mappedPayload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to ALL changes in the photos table for a specific event.
 * Used by ModerationPanel.
 */
export function subscribeToAllPosts(eventId: string, onUpdate: (payload: any) => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`public:photos:all:event_id=eq.${eventId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'photos',
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        const mappedPayload = {
          ...payload,
          new: payload.new ? mapRowToPhotoData(payload.new) : null,
          old: payload.old ? mapRowToPhotoData(payload.old) : null,
        };
        onUpdate(mappedPayload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Update photo status (approve/reject).
 */
export async function updatePostStatus(id: string, status: 'approved' | 'rejected' | 'pending'): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('photos')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

/**
 * Increment likes and add user to reacted_users.
 */
export async function likePost(photoId: string, userId: string, delta: 1 | -1): Promise<void> {
  if (!supabase) return;

  // For simplicity in this demo, we'll fetch then update. 
  // In production, use an RPC for atomic increments.
  const { data: photo } = await supabase.from('photos').select('likes, reacted_users').eq('id', photoId).single();
  if (!photo) return;

  const newLikes = (photo.likes || 0) + delta;
  let newReactedUsers = [...(photo.reacted_users || [])];
  
  if (delta === 1) {
    newReactedUsers.push(userId);
  } else {
    newReactedUsers = newReactedUsers.filter(u => u !== userId);
  }

  await supabase.from('photos').update({ 
    likes: newLikes, 
    reacted_users: newReactedUsers 
  }).eq('id', photoId);
}

/**
 * Toggle an emoji reaction.
 */
export async function reactToPost(photoId: string, emoji: string, userId: string, delta: 1 | -1): Promise<void> {
  if (!supabase) return;
  
  const { data: photo } = await supabase.from('photos').select('reactions, reacted_users').eq('id', photoId).single();
  if (!photo) return;

  const reactions = photo.reactions || {};
  reactions[emoji] = (reactions[emoji] || 0) + delta;
  
  const reactionKey = `${userId}_${emoji}`;
  let newReactedUsers = [...(photo.reacted_users || [])];
  
  if (delta === 1) {
    newReactedUsers.push(reactionKey);
  } else {
    newReactedUsers = newReactedUsers.filter(u => u !== reactionKey);
  }

  await supabase.from('photos').update({ 
    reactions, 
    reacted_users: newReactedUsers 
  }).eq('id', photoId);
}

/**
 * Add a comment to a post.
 */
export async function commentOnPost(photoId: string, comments: any[]): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('photos')
    .update({ comments })
    .eq('id', photoId);
  if (error) throw error;
}

/**
 * Helper to map Supabase row (snake_case) to our PhotoData interface (mixed/camelCase).
 */
function mapRowToPhotoData(row: any): PhotoData {
  return {
    id: row.id,
    url: row.url,
    user_name: row.user_name,
    user_id: row.user_id,
    eventId: row.event_id, // Map event_id -> eventId
    likes: row.likes || 0,
    reactions: row.reactions || {},
    reacted_users: row.reacted_users || [],
    comments: row.comments || [],
    timestamp: row.created_at || row.timestamp,
    status: row.status,
    is_official: row.is_official,
  };
}

/**
 * Helper to map PhotoData interface to Supabase row (snake_case).
 */
function mapPhotoDataToRow(data: Partial<PhotoData>): any {
  return {
    event_id: data.eventId,
    url: data.url,
    user_name: data.user_name,
    user_id: data.user_id,
    likes: data.likes ?? 0,
    reactions: data.reactions ?? {},
    reacted_users: data.reacted_users ?? [],
    comments: data.comments ?? [],
    status: data.status ?? 'pending',
    is_official: data.is_official ?? false,
  };
}
