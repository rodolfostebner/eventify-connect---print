/**
 * authService.ts
 *
 * Authentication helpers — login, logout, auth state observation.
 *
 * Currently backed by mockAuth (mockFirestore).
 * To switch to Supabase Auth, replace the function bodies here —
 * no changes needed in any page or component.
 */

import { auth, loginWithGoogle, logout as firebaseLogout, onAuthStateChanged } from '../lib/firebase';
import type { User } from '../lib/firebase';

export type { User };

/**
 * Trigger Google OAuth login popup.
 * Returns the authenticated user or throws on failure.
 */
export async function login(): Promise<User> {
  const result = await loginWithGoogle();
  return result.user as User;
}

/** Sign out the current user. */
export async function logoutUser(): Promise<void> {
  await firebaseLogout();
}

/**
 * Listen for authentication state changes.
 * Returns an unsubscribe function.
 */
export function onAuthChange(
  callback: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}
