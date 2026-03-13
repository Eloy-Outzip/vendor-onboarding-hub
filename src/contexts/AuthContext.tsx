import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasProfile: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  hasProfile: false,
});

export const useAuth = () => useContext(AuthContext);

async function checkProfile(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles" as any)
    .select("vendor_id")
    .eq("id", userId)
    .maybeSingle();
  return !!(data as any)?.vendor_id;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error || !session?.user) {
        setSession(null);
        setUser(null);
        setHasProfile(false);
        setLoading(false);
        return;
      }

      const profileLinked = await checkProfile(session.user.id);
      if (!mounted) return;

      if (!profileLinked) {
        // Orphan auth account — sign out
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setHasProfile(false);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session.user);
      setHasProfile(true);
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        if (!session?.user) {
          setSession(null);
          setUser(null);
          setHasProfile(false);
          setLoading(false);
          return;
        }

        const profileLinked = await checkProfile(session.user.id);
        if (!mounted) return;

        if (!profileLinked) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setHasProfile(false);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session.user);
        setHasProfile(true);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, hasProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
