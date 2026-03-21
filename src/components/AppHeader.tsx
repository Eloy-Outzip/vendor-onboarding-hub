import LanguageSwitcher from "@/components/LanguageSwitcher";

const AppHeader = () => (
  <header className="bg-navy text-cream px-4 sm:px-8 py-4 flex items-center justify-between">
    <img src="/outzip-logo.png" alt="Outzip" className="h-8" />
    <LanguageSwitcher variant="inline" />
  </header>
);

export default AppHeader;
