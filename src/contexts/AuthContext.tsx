import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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

// Exported ref so JoinPage can skip the orphan check during signup
export const skipProfileCheck = { current: false };

async function checkProfile(userId: string): Promise<boolean | null> {
  const { data, error } = await supabase
    .from("profiles" as any)
    .select("vendor_id")
    .eq("id", userId)
    .maybeSingle();
  if (error) return null; // null = unknown, don't treat as orphan
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

      if (profileLinked === false) {
        // Confirmed orphan — sign out
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setHasProfile(false);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session.user);
      setHasProfile(profileLinked === true);
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (!session?.user) {
          setSession(null);
          setUser(null);
          setHasProfile(false);
          setLoading(false);
          return;
        }

        // If JoinPage flagged that signup is in progress, accept session as-is
        if (skipProfileCheck.current) {
          setSession(session);
          setUser(session.user);
          setHasProfile(false); // profile not yet created
          setLoading(false);
          return;
        }

        // Set loading=true while we verify the profile to prevent premature redirects
        setLoading(true);

        const profileLinked = await checkProfile(session.user.id);

        // Send login notification email (fire-and-forget, only on actual sign-in)
        if (profileLinked === true && event === "SIGNED_IN") {
          supabase.functions.invoke("notify-login").catch(() => {});
        }
        if (!mounted) return;

        if (profileLinked === false && event === "INITIAL_SESSION") {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setHasProfile(false);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session.user);
        setHasProfile(profileLinked === true);
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
