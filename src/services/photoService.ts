/**
 * photoService.ts
 *
 * All data access for the `photos` collection.
 *
 * Currently backed by mockFirestore (localStorage).
 * To switch to Supabase, replace the function bodies here —
 * no changes needed in any page or component.
 */

import {
  db, storage,
  collection, query, where, orderBy,
  onSnapshot, addDoc, updateDoc, doc, deleteDoc,
  increment, arrayUnion, arrayRemove, Timestamp,
  ref, uploadBytes, getDownloadURL,
} from '../lib/firebase';
import type { PhotoData, PhotoComment } from '../types';

// ─── Real-time subscriptions ──────────────────────────────────────────────────

/**
 * Subscribe to ALL photos for an event (any status), ordered by timestamp desc.
 * Used by ModerationPanel.
 */
export function subscribeToPhotos(
  eventId: string,
  onUpdate: (photos: PhotoData[]) => void,
  onError?: (err: any) => void,
): () => void {
  const q = query(
    collection(db, 'photos'),
    where('eventId', '==', eventId),
    orderBy('timestamp', 'desc'),
  );
  return onSnapshot(
    q,
    (snap) => onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PhotoData))),
    onError,
  );
}

/**
 * Subscribe to approved photos for an event.
 * Used by TVView and EventPage gallery.
 */
export function subscribeToApprovedPhotos(
  eventId: string,
  onUpdate: (photos: PhotoData[]) => void,
  onError?: (err: any) => void,
): () => void {
  const q = query(
    collection(db, 'photos'),
    where('eventId', '==', eventId),
    where('status', '==', 'approved'),
  );
  return onSnapshot(
    q,
    (snap) => onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PhotoData))),
    onError,
  );
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Upload a photo file to storage and add its record to the photos collection.
 * Returns the new photo id.
 */
export async function addPhoto(
  eventId: string,
  file: File,
  userName: string,
  userId: string,
  needsModeration: boolean,
): Promise<string> {
  const storageRef = ref(storage, `events/${eventId}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  const result = await addDoc(collection(db, 'photos'), {
    eventId,
    url,
    user_name: userName,
    user_id: userId,
    likes: 0,
    reactions: {},
    reacted_users: [],
    comments: [],
    status: needsModeration ? 'pending' : 'approved',
    timestamp: Timestamp.now(),
    is_official: false,
  });
  return result.id;
}

/** Upload official photos from the moderation panel. */
export async function addOfficialPhoto(
  eventId: string,
  file: File,
): Promise<string> {
  const storageRef = ref(storage, `events/${eventId}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  const result = await addDoc(collection(db, 'photos'), {
    eventId,
    url,
    user_name: 'Equipe Oficial',
    user_id: '',
    status: 'approved',
    timestamp: Timestamp.now(),
    likes: 0,
    reactions: {},
    reacted_users: [],
    comments: [],
    is_official: true,
  });
  return result.id;
}

/** Approve or reject a photo. */
export async function updatePhotoStatus(
  id: string,
  status: 'approved' | 'rejected',
): Promise<void> {
  await updateDoc(doc(db, 'photos', id), { status });
}

/** Hard-delete a photo. */
export async function deletePhoto(id: string): Promise<void> {
  await deleteDoc(doc(db, 'photos', id));
}

/**
 * Toggle a like reaction on a photo.
 * @param delta  +1 to add, -1 to remove
 */
export async function likePhoto(
  photoId: string,
  userId: string,
  delta: 1 | -1,
): Promise<void> {
  await updateDoc(doc(db, 'photos', photoId), {
    likes: increment(delta),
    reacted_users: delta === 1 ? arrayUnion(userId) : arrayRemove(userId),
  });
}

/**
 * Toggle an emoji reaction (not a like) on a photo.
 * @param delta  +1 to add, -1 to remove
 */
export async function reactToPhoto(
  photoId: string,
  emoji: string,
  userId: string,
  delta: 1 | -1,
): Promise<void> {
  await updateDoc(doc(db, 'photos', photoId), {
    [`reactions.${emoji}`]: increment(delta),
    reacted_users: delta === 1 ? arrayUnion(`${userId}_${emoji}`) : arrayRemove(`${userId}_${emoji}`),
  });
}

/** Add a comment to a photo. */
export async function commentOnPhoto(
  photoId: string,
  existingComments: PhotoComment[],
  comment: PhotoComment,
): Promise<void> {
  await updateDoc(doc(db, 'photos', photoId), {
    comments: [...existingComments, comment],
  });
}

/**
 * Approve or reject (delete) a comment inside a photo document.
 * Returns the updated comments array to avoid a second read.
 */
export async function moderateComment(
  photoId: string,
  currentComments: PhotoComment[],
  commentIndex: number,
  action: 'approved' | 'rejected',
): Promise<PhotoComment[]> {
  const newComments = [...currentComments];
  if (action === 'rejected') {
    newComments.splice(commentIndex, 1);
  } else {
    newComments[commentIndex] = { ...newComments[commentIndex], status: 'approved' };
  }
  await updateDoc(doc(db, 'photos', photoId), { comments: newComments });
  return newComments;
}
