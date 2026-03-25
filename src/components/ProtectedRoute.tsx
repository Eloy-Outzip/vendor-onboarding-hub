import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";

import { isEditorPreview } from "@/lib/isEditorPreview";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading, hasProfile, isAdmin, user } = useAuth();
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
  if (!hasProfile && !isAdmin) return <Navigate to="/join" replace />;

  return <>{children}</>;
};
