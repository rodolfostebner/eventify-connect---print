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
    reactedUsers.push(r.type === 'like' ? r.user_id : `${r.user_id}_${r.type}`);
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
    likes: reactionCounts['like'] || 0,
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
 * Toggle like reaction
 */
export async function likePost(postId: string, userId: string, delta: 1 | -1): Promise<void> {
  if (!supabase) return;
  if (delta === 1) {
    await supabase.from('reactions').upsert({ post_id: postId, user_id: userId, type: 'like' });
  } else {
    await supabase.from('reactions').delete().match({ post_id: postId, user_id: userId, type: 'like' });
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
 * Legacy behavior receives the full array, so we extract the new comment to insert.
 */
export async function commentOnPost(postId: string, comments: any[]): Promise<void> {
  if (!supabase) return;
  
  // Find the last comment which is the new one (legacy behavior appends to array)
  // For proper refactoring, we should change the UI to just pass the new text.
  // But to satisfy "tolerar a transição sem quebrar" we adapt here:
  const newComment = comments[comments.length - 1];
  
  // Se for uma chamada de moderação para deletar um comentário (deleted: true)
  const deletedComment = comments.find(c => c.deleted);
  if (deletedComment) {
    await supabase.from('comments').delete().eq('id', deletedComment.id);
    return;
  }
  
  // Se for aprovação de comentário:
  const approvedComment = comments.find(c => c.status === 'approved' && !c.id.startsWith('temp-'));
  if (approvedComment) {
    await supabase.from('comments').update({ status: 'approved' }).eq('id', approvedComment.id);
  }

  // Se for novo comentário:
  if (newComment && (!newComment.id || newComment.id.includes('-'))) {
     await supabase.from('comments').insert({
       post_id: postId,
       user_id: newComment.uid,
       text: newComment.text,
       status: newComment.status || 'pending',
       is_predefined: false
     });
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
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export function subscribeToAllPosts(eventId: string, onUpdate: (payload: any) => void) {
  return subscribeToPosts(eventId, onUpdate);
}
