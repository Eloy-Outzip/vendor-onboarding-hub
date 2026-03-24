import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, skipProfileCheck } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { toast } from "sonner";
import { Check } from "lucide-react";

const CATEGORY_KEYS = [
  { key: "catClimbing", emoji: "🧗" },
  { key: "catSnowTouring", emoji: "❄️" },
  { key: "catBikeBags", emoji: "🎒" },
  { key: "catRoofTents", emoji: "⛺" },
] as const;

const JoinPage = () => {
  const navigate = useNavigate();
  const { loading, hasProfile } = useAuth();
  const { t, locale } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({
    shopName: "",
    city: "",
    website: "",
    email: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && hasProfile) navigate("/profile", { replace: true });
  }, [hasProfile, loading, navigate]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleCategory = (key: string) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.shopName.trim() || !form.city.trim() || !form.email.trim()) {
      toast.error(t("join.errorRequired"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error(t("join.errorEmail"));
      return;
    }

    setSubmitting(true);
    skipProfileCheck.current = true;
    try {
      const { data: vendor, error: vendorError } = await supabase
        .from("vendors")
        .insert({
          first_name: form.shopName,
          name: form.shopName,
          email: form.email,
          website: form.website || null,
          city: form.city || null,
          categories: selectedCategories.length > 0 ? selectedCategories : null,
          status: "pending",
        })
        .select("id")
        .single();

      if (vendorError) throw vendorError;

      const password = crypto.randomUUID().slice(0, 32) + "Aa1!";

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
          data: { locale },
        },
      });

      if (authError) {
        toast.error(t("join.errorAccount"));
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        toast.error(t("join.errorAccount"));
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles" as any)
        .insert({ id: userId, email: form.email, vendor_id: vendor.id } as any);

      if (profileError) {
        toast.error(t("join.errorAccount"));
        return;
      }

      setShowSuccess(true);
    } catch (err: any) {
      toast.error(err.message || t("join.errorGeneric"));
    } finally {
      skipProfileCheck.current = false;
      setSubmitting(false);
    }
  };

  if (loading) return null;

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
            {t("join.heroTitle")}
          </h1>
          <p className="mt-4 text-lg sm:text-xl opacity-80 max-w-xl mx-auto">
            {t("join.heroSubtitle")}
          </p>
        </div>
      </section>

      {/* Map banner */}
      <div className="relative w-full overflow-hidden" style={{ height: '180px' }}>
        {/* Navy to cream gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy/80 to-cream" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'linear-gradient(rgba(244,242,236,1) 1px, transparent 1px), linear-gradient(90deg, rgba(244,242,236,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Pins */}
        <div className="relative h-full max-w-5xl mx-auto">
          {/* Verleih Hamburg */}
          <div className="absolute left-[12%] top-[28%] flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full border-2 border-cream/40 bg-transparent" />
            <span className="text-[11px] text-cream/40 font-medium whitespace-nowrap hidden sm:block">Verleih Hamburg</span>
          </div>
          {/* OutdoorBerlin */}
          <div className="absolute left-[38%] top-[20%] flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-[11px] font-semibold text-cream bg-primary px-2.5 py-0.5 rounded whitespace-nowrap hidden sm:block">OutdoorBerlin</span>
          </div>
          {/* Highlighted pin — Du könntest hier sein */}
          <div className="absolute left-[46%] top-[48%] flex flex-col items-center gap-1">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-lime/20 animate-ping" />
              <div className="w-3.5 h-3.5 rounded-full bg-lime border-2 border-lime/50 relative z-10" />
            </div>
            <span className="text-[12px] font-bold text-navy bg-lime px-3 py-1 rounded whitespace-nowrap relative z-10">
              {t("join.mapPinLabel")}
            </span>
          </div>
          {/* Bergwelt München */}
          <div className="absolute right-[12%] top-[22%] flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full border-2 border-cream/30 bg-transparent" />
            <span className="text-[11px] text-cream/35 font-medium whitespace-nowrap hidden sm:block">Bergwelt München</span>
          </div>
          {/* Alpine Gear */}
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
        </div>
      </div>

      {/* Form / Success */}
      <main className="flex-1 bg-cream px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-lg">
          {showSuccess ? (
            <div className="rounded-2xl bg-background p-8 sm:p-12 text-center shadow-lg">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-lime">
                <Check className="h-8 w-8 text-navy" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {t("join.successTitle").replace("{shopname}", form.shopName)}
              </h2>
              <p className="mt-2 text-muted-foreground">{t("join.successSubtitle")}</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl bg-background p-6 sm:p-10 shadow-lg space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="shopName">{t("join.shopName")}</Label>
                <Input
                  id="shopName"
                  value={form.shopName}
                  onChange={(e) => update("shopName", e.target.value)}
                  placeholder={t("join.shopNamePlaceholder")}
                  maxLength={100}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t("join.city")}</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder={t("join.cityPlaceholder")}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">{t("join.website")}</Label>
                  <Input
                    id="website"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder={t("join.websitePlaceholder")}
                    maxLength={255}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("join.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder={t("join.emailPlaceholder")}
                  maxLength={255}
                />
              </div>

              {/* Category checkboxes */}
              <div className="space-y-3">
                <Label>{t("join.categoriesLabel")}</Label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORY_KEYS.map(({ key, emoji }) => {
                    const label = t(`join.${key}`);
                    return (
                      <label
                        key={key}
                        className="flex items-center gap-2 cursor-pointer rounded-lg border border-border px-3 py-2.5 hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                      >
                        <Checkbox
                          checked={selectedCategories.includes(key)}
                          onCheckedChange={() => toggleCategory(key)}
                        />
                        <span className="text-sm">
                          {emoji} {label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full text-base font-semibold"
                disabled={submitting}
              >
                {submitting ? t("common.submitting") : t("join.submit")}
              </Button>
            </form>
          )}
        </div>
      </main>

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

export default JoinPage;
