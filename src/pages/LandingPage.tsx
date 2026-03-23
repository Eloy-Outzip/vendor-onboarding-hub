import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const LandingPage = () => {
  const { t, locale } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-navy text-cream px-4 sm:px-8 py-4 flex items-center justify-between">
        <img src="/outzip-logo.png" alt="Outzip" className="h-8" />
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-70 hidden sm:block">{t("join.topBarTag")}</span>
          <LanguageSwitcher variant="inline" />
        </div>
      </header>

      {/* Hero */}
      <section className="bg-navy text-cream px-4 sm:px-8 pt-12 pb-0 sm:pt-20 sm:pb-0">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight tracking-tight">
            {t("landing.heroTitle")}
          </h1>
          <p className="mt-4 text-lg sm:text-xl opacity-80 max-w-xl mx-auto">
            {t("landing.heroSubtitle")}
          </p>
        </div>
      </section>

      {/* Map banner */}
      <div className="relative w-full overflow-hidden" style={{ height: "180px" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy/80 to-cream" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(244,242,236,1) 1px, transparent 1px), linear-gradient(90deg, rgba(244,242,236,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative h-full max-w-5xl mx-auto">
          <div className="absolute left-[12%] top-[28%] flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full border-2 border-cream/40 bg-transparent" />
            <span className="text-[11px] text-cream/40 font-medium whitespace-nowrap hidden sm:block">Verleih Hamburg</span>
          </div>
          <div className="absolute left-[38%] top-[20%] flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-[11px] font-semibold text-cream bg-primary px-2.5 py-0.5 rounded whitespace-nowrap hidden sm:block">OutdoorBerlin</span>
          </div>
          <div className="absolute left-[46%] top-[48%] flex flex-col items-center gap-1">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-lime/20 animate-ping" />
              <div className="w-3.5 h-3.5 rounded-full bg-lime border-2 border-lime/50 relative z-10" />
            </div>
            <span className="text-[12px] font-bold text-navy bg-lime px-3 py-1 rounded whitespace-nowrap relative z-10">
              {t("join.mapPinLabel")}
            </span>
          </div>
          <div className="absolute right-[12%] top-[22%] flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full border-2 border-cream/30 bg-transparent" />
            <span className="text-[11px] text-cream/35 font-medium whitespace-nowrap hidden sm:block">Bergwelt München</span>
          </div>
          <div className="absolute right-[6%] top-[50%] flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full border-2 border-cream/25 bg-transparent" />
            <span className="text-[11px] text-cream/30 font-medium whitespace-nowrap hidden sm:block">Alpine Gear</span>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-cream px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-lg font-bold text-navy mb-8">{t("steps.title")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-navy text-cream flex items-center justify-center text-sm font-bold">
                  {n}
                </span>
                <div>
                  <p className="font-semibold text-navy text-sm">{t(`steps.step${n}Title`)}</p>
                  <p className="text-sm text-navy/60 mt-0.5">{t(`steps.step${n}Desc`)}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-navy/50 mt-8">{t("steps.note")}</p>
          <div className="mt-4 mx-auto max-w-lg flex items-start gap-2.5 rounded-lg border border-lime/40 bg-lime/10 px-4 py-3">
            <Lightbulb className="h-4 w-4 text-navy/60 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-navy/70">{t("steps.tip")}</p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="bg-cream px-4 pb-16 pt-4">
        <div className="mx-auto max-w-md flex flex-col items-center gap-4">
          <Button asChild size="lg" className="w-full text-base font-semibold">
            <Link to="/join">{t("landing.ctaJoin")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full text-base">
            <Link to="/login">{t("landing.ctaLogin")}</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy text-cream/60 px-4 py-6 text-center text-sm flex flex-wrap items-center justify-center gap-2">
        <span>© 2026 Outzip</span>
        <span>·</span>
        <a href={`https://outzip.de/${locale}/help?header=3`} target="_blank" rel="noopener noreferrer" className="hover:text-cream transition-colors">{t("join.footerPrivacy")}</a>
        <span>·</span>
        <a href={`https://outzip.de/${locale}/help?header=4`} target="_blank" rel="noopener noreferrer" className="hover:text-cream transition-colors">{t("join.footerImprint")}</a>
      </footer>
    </div>
  );
};

export default LandingPage;
