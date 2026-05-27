import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { supabase } from '../lib/supabase/client';
import { syncUser, findOrCreateUserByEmail } from '../services/userService';
import { loginWithGoogle, loginWithMagicLink, logout as doLogout } from '../services/authService';
import type { AppUser } from '../types';

export const BETA_MODE = import.meta.env.VITE_BETA_MODE === 'true';
const BETA_KEY = 'eventify_beta_session';

function getBetaUser(): AppUser | null {
  try {
    const stored = localStorage.getItem(BETA_KEY);
    return stored ? (JSON.parse(stored) as AppUser) : null;
  } catch {
    return null;
  }
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  login: () => Promise<void>;
  loginMagic: (email: string) => Promise<void>;
  loginBeta: (email: string) => Promise<AppUser | null>;
  logout: () => void | Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => (BETA_MODE ? getBetaUser() : null));
  const [loading, setLoading] = useState(!BETA_MODE);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (BETA_MODE) return;
    if (!supabase) { setLoading(false); return; }

    // 1. Initial session load — uses getSession() which does NOT compete
    //    for the Web Lock, avoiding the deadlock that onAuthStateChange causes.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const appUser = await syncUser(session.user);
          setUser(appUser);
        } catch (err) {
          console.warn('[AuthProvider] Initial syncUser failed:', err);
        }
      }
      setLoading(false);
      initialLoadDone.current = true;
    }).catch((err) => {
      console.warn('[AuthProvider] getSession failed:', err);
      setLoading(false);
      initialLoadDone.current = true;
    });

    // 2. Listen for SUBSEQUENT auth changes (login, logout, token refresh).
    //    We skip the first event (INITIAL_SESSION) because we handled it above.
    //    We defer syncUser with setTimeout(0) to let Supabase release the
    //    internal Web Lock before we make any database queries.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Skip the initial event — already handled by getSession above
        if (!initialLoadDone.current) return;

        if (session?.user) {
          // Defer to next tick so the auth lock is released
          setTimeout(async () => {
            try {
              const appUser = await syncUser(session.user);
              setUser(appUser);
            } catch (err) {
              console.warn('[AuthProvider] syncUser on auth change failed:', err);
            }
          }, 0);
        } else {
          setUser(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const loginBeta = async (email: string): Promise<AppUser | null> => {
    const appUser = await findOrCreateUserByEmail(email);
    if (appUser) {
      localStorage.setItem(BETA_KEY, JSON.stringify(appUser));
      setUser(appUser);
    }
    return appUser;
  };

  const logoutBeta = () => {
    localStorage.removeItem(BETA_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login: loginWithGoogle,
      loginMagic: loginWithMagicLink,
      loginBeta,
      logout: BETA_MODE ? logoutBeta : doLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return ctx;
}
