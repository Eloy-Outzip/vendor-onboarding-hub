import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, session, loading } = useAuth();
  const { t } = useLanguage();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    // If we have a user but no valid session, sign out
    if (!loading && user && !session) {
      setSigningOut(true);
      supabase.auth.signOut().finally(() => setSigningOut(false));
    }
  }, [loading, user, session]);

  if (loading || signingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (!user) return <Navigate to="/join" replace />;

  return <>{children}</>;
};
