import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, skipProfileCheck } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const JoinPage = () => {
  const navigate = useNavigate();
  const { loading, hasProfile } = useAuth();
  const { t, locale } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");
  const [magicLinkSending, setMagicLinkSending] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    if (!loading && hasProfile) navigate("/profile", { replace: true });
  }, [hasProfile, loading, navigate]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleMagicLink = async () => {
    if (!magicEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(magicEmail)) {
      toast.error(t("join.errorEmail"));
      return;
    }
    setMagicLinkSending(true);
    setMagicLinkSent(false);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicEmail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/profile`,
          data: { locale },
        },
      });
      if (error) throw error;
      setMagicLinkSent(true);
    } catch (err: any) {
      const msg = err.message?.toLowerCase().includes("signups not allowed")
        ? t("join.errorAccountNotFound")
        : err.message || t("join.errorMagic");
      toast.error(msg);
    } finally {
      setMagicLinkSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.companyName.trim() || !form.email.trim()) {
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
          first_name: form.fullName,
          name: form.companyName,
          email: form.email,
          phone: form.phone || null,
          website: form.website || null,
          address: form.address || null,
          city: form.city || null,
          country: form.country || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (vendorError) throw vendorError;

      const password = crypto.randomUUID().slice(0, 32) + "Aa1!";

      // Prevent AuthContext from signing out the new session before profile is created
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

      // Profile created (or failed) — re-enable orphan detection
      skipProfileCheck.current = false;

      if (profileError) {
        toast.error(t("join.errorAccount"));
        return;
      }

      navigate("/welcome");
    } catch (err: any) {
      toast.error(err.message || t("join.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-xl px-4 py-12 sm:py-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("join.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("join.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("join.fullName")}</Label>
              <Input id="fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder={t("join.fullNamePlaceholder")} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">{t("join.companyName")}</Label>
              <Input id="companyName" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder={t("join.companyNamePlaceholder")} maxLength={100} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("join.email")}</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder={t("join.emailPlaceholder")} maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("join.phone")}</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder={t("join.phonePlaceholder")} maxLength={30} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">{t("join.website")}</Label>
            <Input id="website" value={form.website} onChange={(e) => update("website", e.target.value)} placeholder={t("join.websitePlaceholder")} maxLength={255} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t("join.address")}</Label>
            <Input id="address" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder={t("join.addressPlaceholder")} maxLength={255} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{t("join.city")}</Label>
              <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} placeholder={t("join.cityPlaceholder")} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">{t("join.country")}</Label>
              <Input id="country" value={form.country} onChange={(e) => update("country", e.target.value)} placeholder={t("join.countryPlaceholder")} maxLength={100} />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
            {submitting ? t("common.submitting") : t("join.submit")}
          </Button>
        </form>

        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-foreground">{t("join.returningTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("join.returningSubtitle")}</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Input type="email" placeholder={t("join.magicPlaceholder")} value={magicEmail} onChange={(e) => setMagicEmail(e.target.value)} className="sm:max-w-xs" />
            <Button variant="outline" disabled={magicLinkSending} onClick={handleMagicLink}>
              {magicLinkSending ? t("join.sendingLink") : t("join.sendLink")}
            </Button>
          </div>
          {magicLinkSent && (
            <p className="mt-3 text-sm text-primary">{t("join.magicSent")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinPage;
