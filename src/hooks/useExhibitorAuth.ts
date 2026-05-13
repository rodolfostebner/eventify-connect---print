import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import { getExhibitorByUserId } from '../services/exhibitorService';
import { logoutExhibitor } from '../services/exhibitorAuthService';
import type { Exhibitor } from '../types';

export function useExhibitorAuth() {
  const [exhibitorUser, setExhibitorUser] = useState<User | null>(null);
  const [exhibitor, setExhibitor] = useState<Exhibitor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setExhibitorUser(session.user);
          try {
            const data = await getExhibitorByUserId(session.user.id);
            setExhibitor(data);
          } catch {
            setExhibitor(null);
          }
        } else {
          setExhibitorUser(null);
          setExhibitor(null);
        }
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = () => logoutExhibitor();

  return { exhibitorUser, exhibitor, loading, logout };
}
