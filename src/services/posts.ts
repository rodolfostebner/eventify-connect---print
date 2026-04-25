import { supabase } from "../lib/supabase/client";
import type { PostData, PostReaction, PostComment, PhotoData } from '../types';

/**
 * Helper: Map row from DB to our PostData (PhotoData) interface
 */
function mapRowToPostData(row: any): PostData {
  const reactions: PostReaction[] = row.reactions || [];
  const comments: PostComment[] = row.comments || [];

  // Calculate aggregations
  const reactionCounts: Record<string, number> = {};
  const reactedUsers: string[] = [];

  reactions.forEach(r => {
    reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
    reactedUsers.push(`${r.user_id}_${r.type}`);
  });

  // Map comments
  const mappedComments = comments.map(c => ({
    ...c,
    user_name: c.user?.display_name || 'Anônimo',
    uid: c.user_id,
    timestamp: c.created_at,
  }));

  return {
    id: row.id,
    event_id: row.event_id,
    user_id: row.user_id,
    image_url: row.image_url,
    status: row.status,
    is_official: row.is_official,
    printed: row.printed,
    created_at: row.created_at,
    
    user: row.users,
    reactions,
    comments: mappedComments,
    reaction_counts: reactionCounts,

    // Legacy fallback bindings
    url: row.image_url,
    eventId: row.event_id,
    firebase_uid: row.user_id,
    user_name: row.users?.display_name || 'Anônimo',
    likes: reactionCounts['🔥'] || 0,
    reacted_users: reactedUsers,
    timestamp: row.created_at
  };
}

/**
 * Fetch all approved posts for a specific event.
 */
export async function fetchPosts(eventId: string): Promise<PostData[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      users (*),
      reactions (*),
      comments (*, user:users(*))
    `)
    .eq('event_id', eventId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[PostsService] Error fetching posts:', error);
    throw error;
  }

  return (data || []).map(mapRowToPostData);
}

/**
 * Fetch ALL posts for a specific event (any status).
 */
export async function fetchAllPosts(eventId: string): Promise<PostData[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      users (*),
      reactions (*),
      comments (*, user:users(*))
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapRowToPostData);
}

/**
 * Create a new post
 */
export async function createPost(post: Partial<PostData>): Promise<PostData> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const row = {
    event_id: post.eventId || post.event_id,
    user_id: post.firebase_uid || post.user_id,
    image_url: post.url || post.image_url,
    status: post.status || 'pending',
    is_official: post.is_official || false,
    printed: post.printed || false
  };

  const { data, error } = await supabase
    .from('posts')
    .insert([row])
    .select('*, users(*), reactions(*), comments(*, user:users(*))')
    .single();

  if (error) throw error;
  return mapRowToPostData(data);
}

/**
 * Update photo status (approve/reject).
 */
export async function updatePostStatus(id: string, status: 'approved' | 'rejected' | 'pending'): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('posts').update({ status }).eq('id', id);
  if (error) throw error;
}
/**
 * Delete a post.
 */
export async function deletePost(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Toggle like reaction
 */
export async function likePost(postId: string, userId: string, delta: 1 | -1): Promise<void> {
  if (!supabase) return;
  if (delta === 1) {
    await supabase.from('reactions').upsert({ post_id: postId, user_id: userId, type: '🔥' });
  } else {
    await supabase.from('reactions').delete().match({ post_id: postId, user_id: userId, type: '🔥' });
  }
}

/**
 * Toggle an emoji reaction.
 */
export async function reactToPost(postId: string, emoji: string, userId: string, delta: 1 | -1): Promise<void> {
  if (!supabase) return;
  if (delta === 1) {
    await supabase.from('reactions').upsert({ post_id: postId, user_id: userId, type: emoji });
  } else {
    await supabase.from('reactions').delete().match({ post_id: postId, user_id: userId, type: emoji });
  }
}

/**
 * Add a comment to a post.
 */
export async function commentOnPost(postId: string, comment: { uid: string, text: string, status?: string }): Promise<void> {
  if (!supabase) return;
  
  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: comment.uid,
    text: comment.text,
    status: comment.status || 'pending',
    is_predefined: false
  });

  if (error) throw error;
}

/**
 * Approve a comment.
 */
export async function approveComment(commentId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('comments').update({ status: 'approved' }).eq('id', commentId);
  if (error) throw error;
}

/**
 * Delete/Reject a comment.
 */
export async function deleteComment(commentId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) throw error;
}

/**
 * Subscriptions
 */
export function subscribeToPosts(eventId: string, onUpdate: (payload: any) => void) {
  if (!supabase) return () => {};

  const channel = supabase.channel(`public:event_data:${eventId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts', filter: `event_id=eq.${eventId}` }, onUpdate)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, onUpdate)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, onUpdate)
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export function subscribeToAllPosts(eventId: string, onUpdate: (payload: any) => void) {
  return subscribeToPosts(eventId, onUpdate);
}
