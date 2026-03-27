import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasProfile: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  hasProfile: false,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

// Exported ref so JoinPage can skip the orphan check during signup
export const skipProfileCheck = { current: false };

interface ProfileResult {
  hasVendor: boolean;
  isAdmin: boolean;
}

async function checkProfile(userId: string, retries = 1): Promise<ProfileResult | null> {
  const { data, error } = await supabase
    .from("profiles" as any)
    .select("vendor_id, is_super_admin")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1500));
      return checkProfile(userId, retries - 1);
    }
    return null;
  }
  return {
    hasVendor: !!(data as any)?.vendor_id,
    isAdmin: !!(data as any)?.is_super_admin,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        let profileResult: ProfileResult | null = null;
        try {
          profileResult = await checkProfile(session.user.id);
        } catch {
          profileResult = null;
        }
        if (!mounted) return;

        // Only sign out orphans: no vendor AND not admin
        if (profileResult && !profileResult.hasVendor && !profileResult.isAdmin && !skipProfileCheck.current) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setHasProfile(false);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session.user);
        setHasProfile(profileResult ? profileResult.hasVendor : true);
        setIsAdmin(profileResult ? profileResult.isAdmin : false);
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
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // For token refreshes (tab switch), just update session — no profile re-check
        if (event === "TOKEN_REFRESHED") {
          setSession(session);
          setUser(session.user);
          return;
        }

        if (skipProfileCheck.current) {
          setSession(session);
          setUser(session.user);
          setHasProfile(false);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Skip if init() is already running a profile check
        if (checkingRef.current) return;

        // Don't flash loading for token refreshes (e.g. tab switch)
        if (event !== "TOKEN_REFRESHED") {
          setLoading(true);
        }

        let profileResult: ProfileResult | null = null;
        try {
          profileResult = await checkProfile(session.user.id);
        } catch {
          profileResult = null;
        }

        if (profileResult && (profileResult.hasVendor || profileResult.isAdmin) && event === "SIGNED_IN") {
          supabase.functions.invoke("notify-login").catch(() => {});
        }
        if (!mounted) return;

        if (profileResult && !profileResult.hasVendor && !profileResult.isAdmin && event === "INITIAL_SESSION") {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setHasProfile(false);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session.user);
        setHasProfile(profileResult ? profileResult.hasVendor : true);
        setIsAdmin(profileResult ? profileResult.isAdmin : false);
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
    <AuthContext.Provider value={{ user, session, loading, hasProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
