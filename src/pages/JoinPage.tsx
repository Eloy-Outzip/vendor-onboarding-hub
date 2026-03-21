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
  { key: "catTents", emoji: "⛺" },
  { key: "catSleepingBags", emoji: "🌙" },
  { key: "catBackpacks", emoji: "🎒" },
  { key: "catBikes", emoji: "🚴" },
  { key: "catWinter", emoji: "🏔️" },
  { key: "catOther", emoji: "📦" },
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

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
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

      skipProfileCheck.current = true;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
          data: { locale },
        },
      });

      if (authError) {
        skipProfileCheck.current = false;
        toast.error(t("join.errorAccount"));
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        skipProfileCheck.current = false;
        toast.error(t("join.errorAccount"));
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles" as any)
        .insert({ id: userId, email: form.email, vendor_id: vendor.id } as any);

      skipProfileCheck.current = false;

      if (profileError) {
        toast.error(t("join.errorAccount"));
        return;
      }

      setShowSuccess(true);
    } catch (err: any) {
      toast.error(err.message || t("join.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-navy text-cream px-4 sm:px-8 py-4 flex items-center justify-between">
        <img src="/outzip-logo.svg" alt="Outzip" className="h-8" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).insertAdjacentText('afterend', 'Outzip'); }} />
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-70 hidden sm:block">{t("join.topBarTag")}</span>
          <LanguageSwitcher variant="inline" />
        </div>
      </header>

      {/* Hero */}
      <section className="bg-navy text-cream px-4 sm:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight tracking-tight">
            {t("join.heroTitle")}
          </h1>
          <p className="mt-4 text-lg sm:text-xl opacity-80 max-w-xl mx-auto">
            {t("join.heroSubtitle")}
          </p>

          {/* Inline SVG map of Germany */}
          <div className="mt-10 relative flex justify-center">
            <svg viewBox="0 0 300 380" className="w-48 sm:w-64 h-auto" xmlns="http://www.w3.org/2000/svg">
              {/* Germany outline (simplified) */}
              <path
                d="M150 10 L180 30 L200 25 L220 45 L240 50 L260 80 L270 120 L265 150 L280 180 L270 210 L250 230 L260 260 L240 280 L220 300 L200 310 L180 330 L160 350 L140 360 L120 340 L100 320 L80 290 L70 260 L60 230 L50 200 L55 170 L45 140 L50 110 L60 80 L80 50 L100 30 L120 20 Z"
                fill="none"
                stroke="#F4F2EC"
                strokeWidth="2"
                opacity="0.3"
              />
              {/* Regular pins */}
              <circle cx="180" cy="100" r="4" fill="#F4F2EC" opacity="0.3" />
              <circle cx="120" cy="160" r="4" fill="#F4F2EC" opacity="0.25" />
              <circle cx="200" cy="200" r="4" fill="#F4F2EC" opacity="0.3" />
              <circle cx="100" cy="260" r="4" fill="#F4F2EC" opacity="0.2" />
              <circle cx="220" cy="150" r="4" fill="#F4F2EC" opacity="0.25" />
              {/* Highlighted lime pin */}
              <circle cx="155" cy="220" r="12" fill="#E2E71B" opacity="0.2">
                <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="155" cy="220" r="6" fill="#E2E71B" />
            </svg>
            {/* Label for the lime pin */}
            <span className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 translate-y-full text-xs font-medium text-lime animate-pulse whitespace-nowrap">
              {t("join.mapPinLabel")}
            </span>
          </div>
        </div>
      </section>

      {/* Trust pills */}
      <div className="bg-cream px-4 py-6">
        <div className="mx-auto max-w-2xl flex flex-wrap items-center justify-center gap-3">
          {[
            { emoji: "🗺️", key: "trustFree" },
            { emoji: "✉️", key: "trustNoNewsletter" },
            { emoji: "🔒", key: "trustNoContract" },
            { emoji: "🙋", key: "trustYouDecide" },
          ].map(({ emoji, key }) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground"
            >
              <span>{emoji}</span>
              {t(`join.${key}`)}
            </span>
          ))}
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
                          checked={selectedCategories.includes(label)}
                          onCheckedChange={() => toggleCategory(label)}
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
        <span>© 2025 Outzip</span>
        <span>·</span>
        <span>{t("join.footerPrivacy")}</span>
        <span>·</span>
        <span>{t("join.footerImprint")}</span>
      </footer>
    </div>
  );
};

export default JoinPage;
