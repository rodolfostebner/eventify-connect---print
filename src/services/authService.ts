import { auth, googleProvider } from "../lib/firebase/client";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  updatePassword as firebaseUpdatePassword,
  sendPasswordResetEmail
} from "firebase/auth";

/**
 * Interface compatível com o resto do app.
 */
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Sign in using Magic Link (Firebase does this differently, usually via sendSignInLinkToEmail).
 * For now, if the user wants "Link Mágico", we can implement it or keep it as placeholder.
 */
export async function login(email: string): Promise<void> {
  // Placeholder for magic link or redirect to password reset
  await sendPasswordResetEmail(auth, email);
}

/**
 * Sign in using Google (Firebase).
 */
export async function loginWithGoogle(): Promise<void> {
  await signInWithPopup(auth, googleProvider);
}

/**
 * Sign in using Email and Password (Firebase).
 */
export async function loginWithPassword(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Update the current user's password (Firebase).
 */
export async function updatePassword(password: string): Promise<void> {
  if (!auth.currentUser) throw new Error("No user logged in");
  await firebaseUpdatePassword(auth.currentUser, password);
}

/**
 * Sign out the current user (Firebase).
 */
export async function logout(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes and map Firebase user to our internal User type.
 */
export function subscribeToAuth(onUpdate: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (fbUser) => {
    onUpdate(fbUser ? mapFirebaseUser(fbUser) : null);
  });
}

/**
 * Helper to map Firebase User to our internal User interface.
 */
function mapFirebaseUser(fbUser: any): User {
  return {
    uid: fbUser.uid,
    email: fbUser.email ?? null,
    displayName: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'Usuário',
    photoURL: fbUser.photoURL ?? null,
  };
}

/**
 * Listen for authentication state changes (Legacy wrapper).
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return subscribeToAuth(callback);
}
