import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";

const WelcomePage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {t("welcome.title")}
        </h1>
        <p className="text-muted-foreground text-lg">{t("welcome.subtitle")}</p>
        <Button asChild size="lg">
          <Link to="/profile">{t("welcome.cta")}</Link>
        </Button>
      </div>
      </div>
    </div>
  );
};

export default WelcomePage;
