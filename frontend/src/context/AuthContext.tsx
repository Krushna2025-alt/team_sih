import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as authService from '../services/authService';
import { supabase } from '../services/supabaseClient';
import type { User } from '../types';
interface AuthCtx {
user: User | null;
loading: boolean;
signOut: () => Promise<void>;
setUser: (u: User | null) => void;
}
const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    // Load initial session user
    authService
      .getSessionUser()
      .then((u) => { if (alive) setUser(u); })
      .catch(() => { if (alive) setUser(null); })
      .finally(() => { if (alive) setLoading(false); });

    // Listen to real-time auth events (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(async (_event, session) => {
      if (!alive) return;
      if (session?.user) {
        try {
          const u = await authService.getSessionUser();
          if (alive) setUser(u);
        } catch {
          if (alive) setUser(null);
        }
      } else {
        if (alive) setUser(null);
      }
    }) || { data: { subscription: null } };

    return () => { 
      alive = false; 
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };
return <Ctx.Provider value={{ user, loading, signOut, setUser }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
