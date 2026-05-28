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

  const mappedComments = comments.map(c => ({
    ...c,
    user_name: c.user_name || 'Anônimo',
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

    user: undefined,
    reactions,
    comments: mappedComments,
    reaction_counts: reactionCounts,
    views_count: row.views_count || 0,

    // Legacy fallback bindings
    url: row.image_url,
    eventId: row.event_id,
    user_name: row.user_name || 'Anônimo',
    likes: reactionCounts['🔥'] || 0,
    reacted_users: reactedUsers,
    timestamp: row.created_at
  };
}

/**
 * Anexa reactions, comments e resolve display_name dos usuários (posts + comments).
 * Fetch separado — sem depender de FK no PostgREST.
 */
async function attachInteractions(rows: any[]): Promise<any[]> {
  if (!supabase || rows.length === 0) return rows;

  const postIds = rows.map(r => r.id);

  const [{ data: reactions }, { data: comments }, { data: views }] = await Promise.all([
    supabase.from('reactions').select('*').in('post_id', postIds),
    supabase.from('comments').select('*').in('post_id', postIds),
    supabase.from('photo_views').select('*').in('post_id', postIds),
  ]);

  // Resolve nomes: autores dos posts + autores dos comments
  const userIdSet = new Set<string>();
  rows.forEach(r => { if (r.user_id && r.user_id !== 'official') userIdSet.add(r.user_id); });
  (comments || []).forEach(c => { if (c.user_id) userIdSet.add(c.user_id); });

  const userNames: Record<string, string> = {};
  if (userIdSet.size > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name, email')
      .in('id', [...userIdSet]);
    (users || []).forEach(u => { userNames[u.id] = u.display_name || u.email || 'Anônimo'; });
  }

  const reactionsByPost: Record<string, any[]> = {};
  (reactions || []).forEach(r => {
    (reactionsByPost[r.post_id] ||= []).push(r);
  });

  const commentsByPost: Record<string, any[]> = {};
  (comments || []).forEach(c => {
    (commentsByPost[c.post_id] ||= []).push({
      ...c,
      user_name: userNames[c.user_id] || 'Anônimo',
    });
  });

  const viewsByPost: Record<string, number> = {};
  (views || []).forEach(v => {
    viewsByPost[v.post_id] = (viewsByPost[v.post_id] || 0) + 1;
  });

  return rows.map(r => ({
    ...r,
    user_name: userNames[r.user_id] || null,
    reactions: reactionsByPost[r.id] || [],
    comments: commentsByPost[r.id] || [],
    views_count: viewsByPost[r.id] || 0,
  }));
}

/**
 * Fetch all approved posts for a specific event.
 */
export async function fetchPosts(eventId: string): Promise<PostData[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[PostsService] Error fetching posts:', error);
    throw error;
  }

  const withInteractions = await attachInteractions(data || []);
  return withInteractions.map(mapRowToPostData);
}

/**
 * Fetch ALL posts for a specific event (any status).
 */
export async function fetchAllPosts(eventId: string): Promise<PostData[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const withInteractions = await attachInteractions(data || []);
  return withInteractions.map(mapRowToPostData);
}

/**
 * Create a new post
 */
export async function createPost(post: Partial<PostData>): Promise<PostData> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const row = {
    event_id: post.eventId || post.event_id,
    user_id: post.user_id,
    image_url: post.url || post.image_url,
    status: post.status || 'pending',
    is_official: post.is_official || false,
    printed: post.printed || false
  };

  const { data, error } = await supabase
    .from('posts')
    .insert([row])
    .select('*')
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
    const { error } = await supabase.from('reactions').upsert(
      { post_id: postId, user_id: userId, type: '🔥' },
      { onConflict: 'post_id,user_id,type' }
    );
    if (error) throw error;
  } else {
    const { error } = await supabase.from('reactions').delete().match({ post_id: postId, user_id: userId, type: '🔥' });
    if (error) throw error;
  }
}

/**
 * Toggle an emoji reaction.
 */
export async function reactToPost(postId: string, emoji: string, userId: string, delta: 1 | -1): Promise<void> {
  if (!supabase) return;
  if (delta === 1) {
    const { error } = await supabase.from('reactions').upsert(
      { post_id: postId, user_id: userId, type: emoji },
      { onConflict: 'post_id,user_id,type' }
    );
    if (error) throw error;
  } else {
    const { error } = await supabase.from('reactions').delete().match({ post_id: postId, user_id: userId, type: emoji });
    if (error) throw error;
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
 * Record a unique view for a photo.
 */
export async function recordPhotoView(postId: string, userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('photo_views')
    .upsert({ post_id: postId, user_id: userId }, { onConflict: 'post_id,user_id' });
  
  if (error) {
    console.error('[PostsService] Error recording photo view:', error);
  }
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
    .on('postgres_changes', { event: '*', schema: 'public', table: 'photo_views' }, onUpdate)
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export function subscribeToAllPosts(eventId: string, onUpdate: (payload: any) => void) {
  return subscribeToPosts(eventId, onUpdate);
}
