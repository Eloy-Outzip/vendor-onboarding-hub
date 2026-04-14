import { Link } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LayoutDashboard, Map, UserPlus, User } from "lucide-react";

const AppHeader = () => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="bg-navy text-cream px-4 sm:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <img src="/outzip-logo.png" alt="Outzip" className="h-8" />
        {isAdmin && (
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link to="/admin/dashboard" className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
              <LayoutDashboard className="h-4 w-4" /> {t("admin.dashboard")}
            </Link>
            <Link to="/admin/create-vendor" className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
              <UserPlus className="h-4 w-4" /> {t("admin.createVendor")}
            </Link>
            <Link to="/map" className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
              <Map className="h-4 w-4" /> {t("vendorMap.directory")}
            </Link>
            <Link to="/profile" className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
              <User className="h-4 w-4" /> {t("profile.yourDetails")}
            </Link>
          </nav>
        )}
      </div>
      <LanguageSwitcher variant="inline" />
    </header>
  );
};

export default AppHeader;
