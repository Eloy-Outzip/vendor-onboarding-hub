import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
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

async function checkProfile(userId: string, retries = 1): Promise<boolean | null> {
  const { data, error } = await supabase
    .from("profiles" as any)
    .select("vendor_id")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1500));
      return checkProfile(userId, retries - 1);
    }
    return null;
  }
  return !!(data as any)?.vendor_id;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const checkingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // Safety timeout: force loading=false after 10s
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 10000);

    const init = async () => {
      checkingRef.current = true;
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (error || !session?.user) {
          setSession(null);
          setUser(null);
          setHasProfile(false);
          setLoading(false);
          return;
        }

        let profileLinked: boolean | null = null;
        try {
          profileLinked = await checkProfile(session.user.id);
        } catch {
          profileLinked = null;
        }
        if (!mounted) return;

        if (profileLinked === false && !skipProfileCheck.current) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setHasProfile(false);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session.user);
        setHasProfile(profileLinked !== false);
        setLoading(false);
      } catch {
        if (mounted) {
          setLoading(false);
        }
      } finally {
        checkingRef.current = false;
      }
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

        if (skipProfileCheck.current) {
          setSession(session);
          setUser(session.user);
          setHasProfile(false);
          setLoading(false);
          return;
        }

        // Skip if init() is already running a profile check
        if (checkingRef.current) return;

        // Don't flash loading for token refreshes (e.g. tab switch)
        if (event !== "TOKEN_REFRESHED") {
          setLoading(true);
        }

        let profileLinked: boolean | null = null;
        try {
          profileLinked = await checkProfile(session.user.id);
        } catch {
          profileLinked = null;
        }

        if ((profileLinked === true || profileLinked === null) && event === "SIGNED_IN") {
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
        setHasProfile(profileLinked !== false);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, hasProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
