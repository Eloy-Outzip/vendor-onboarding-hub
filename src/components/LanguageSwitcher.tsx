import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageSwitcherProps {
  variant?: "fixed" | "inline";
}

const LanguageSwitcher = ({ variant = "fixed" }: LanguageSwitcherProps) => {
  const { locale, setLocale } = useLanguage();

  const positionClass = variant === "fixed" ? "fixed top-4 right-4 z-50" : "";

  return (
    <div className={`${positionClass} flex rounded-full border bg-background shadow-sm text-xs font-medium overflow-hidden`}>
      <button
        onClick={() => setLocale("en")}
        className={`px-3 py-1.5 transition-colors ${
          locale === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("de")}
        className={`px-3 py-1.5 transition-colors ${
          locale === "de" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        DE
      </button>
    </div>
  );
};

export default LanguageSwitcher;
