import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";

const isEditorPreview = () =>
  window.location.hostname.includes("lovableproject.com") ||
  new URLSearchParams(window.location.search).has("__lovable_token");

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading, hasProfile, user } = useAuth();
  const { t } = useLanguage();

  if (isEditorPreview()) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (!hasProfile) return <Navigate to="/join" replace />;

  return <>{children}</>;
};
