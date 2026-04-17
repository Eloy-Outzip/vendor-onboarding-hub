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
  // Track which user IDs we've already verified profile for in this tab session
  const verifiedUserRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // Safety timeout: force loading=false after 10s
    const safetyTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 10000);

    // Fire-and-forget profile verification — never blocks the auth event queue
    const verifyProfile = (currentSession: Session) => {
      const uid = currentSession.user.id;
      // Skip if we've already verified this user in this tab session
      if (verifiedUserRef.current === uid) return;

      setTimeout(async () => {
        if (!mounted) return;
        let profileResult: ProfileResult | null = null;
        try {
          profileResult = await checkProfile(uid);
        } catch {
          profileResult = null;
        }
        if (!mounted) return;

        // Only sign out orphans: confirmed no vendor AND not admin
        if (profileResult && !profileResult.hasVendor && !profileResult.isAdmin && !skipProfileCheck.current) {
          await supabase.auth.signOut();
          return;
        }

        verifiedUserRef.current = uid;
        setHasProfile(profileResult ? profileResult.hasVendor : true);
        setIsAdmin(profileResult ? profileResult.isAdmin : false);

        // Notify only on real new sign-ins
        if (profileResult && (profileResult.hasVendor || profileResult.isAdmin)) {
          // no-op — notify-login is now driven by SIGNED_IN below
        }
      }, 0);
    };

    // Set up listener FIRST (Supabase best practice)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;

        // No session → clear everything
        if (!newSession?.user) {
          verifiedUserRef.current = null;
          setSession(null);
          setUser(null);
          setHasProfile(false);
          setIsAdmin(false);
          setLoading(false);
          initializedRef.current = true;
          return;
        }

        // Always update session/user (cheap, synchronous)
        setSession(newSession);
        setUser(newSession.user);

        // Skip-profile-check mode (used during signup flow)
        if (skipProfileCheck.current) {
          setHasProfile(false);
          setIsAdmin(false);
          setLoading(false);
          initializedRef.current = true;
          return;
        }

        // INITIAL_SESSION → first paint, must verify and unblock loading
        if (event === "INITIAL_SESSION") {
          if (!initializedRef.current) {
            initializedRef.current = true;
            verifyProfile(newSession);
            setLoading(false);
          }
          return;
        }

        // SIGNED_IN with a NEW user → real login, verify + notify
        if (event === "SIGNED_IN") {
          const isNewUser = verifiedUserRef.current !== newSession.user.id;
          if (isNewUser) {
            verifyProfile(newSession);
            supabase.functions.invoke("notify-login").catch(() => {});
          }
          // Don't toggle loading on refocus-driven SIGNED_IN events
          setLoading(false);
          initializedRef.current = true;
          return;
        }

        // TOKEN_REFRESHED, USER_UPDATED, etc. → just keep session fresh
        // No loading toggle, no profile re-check
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
