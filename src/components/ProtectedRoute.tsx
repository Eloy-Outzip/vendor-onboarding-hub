import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading, hasProfile, user } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  // Not authenticated → login page
  if (!user) return <Navigate to="/" replace />;

  // Authenticated but no profile → join/signup
  if (!hasProfile) return <Navigate to="/join" replace />;

  return <>{children}</>;
};
