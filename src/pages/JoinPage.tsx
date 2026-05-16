import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { toast } from "sonner";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { WizardFooter } from "@/components/wizard/WizardFooter";
import { WizardPreviewCard } from "@/components/wizard/WizardPreviewCard";
import { SuccessPanel } from "@/components/wizard/SuccessPanel";
import { Step1Shop } from "@/components/wizard/steps/Step1Shop";
import { Step2Offering } from "@/components/wizard/steps/Step2Offering";
import { Step3Contact } from "@/components/wizard/steps/Step3Contact";
import { Step4Review } from "@/components/wizard/steps/Step4Review";
import { validateStep, type WizardForm, type WizardErrors } from "@/lib/wizard-validation";

const TOTAL_STEPS = 4;

const JoinPage = () => {
  const navigate = useNavigate();
  const { loading, hasProfile } = useAuth();
  const { t, locale } = useLanguage();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<WizardForm>({
    shopName: "",
    city: "",
    website: "",
    email: "",
    categories: [],
    terms: false,
  });
  const [errors, setErrors] = useState<WizardErrors>({});

  useEffect(() => {
    if (!loading && hasProfile) navigate("/profile", { replace: true });
  }, [hasProfile, loading, navigate]);

  const update = <K extends keyof WizardForm>(field: K, value: WizardForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleNext = () => {
    const stepErrors = validateStep(step, form, t);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      setStep((s) => Math.min(TOTAL_STEPS, s + 1));
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));
  const handleEdit = (target: number) => setStep(target);

  const handleSubmit = async () => {
    const finalErrors = validateStep(2, form, t);
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      setStep(2);
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("register-vendor", {
        body: {
          shopName: form.shopName.trim(),
          city: form.city.trim(),
          website: form.website.trim() || null,
          email: form.email.trim().toLowerCase(),
          categories: form.categories.length > 0 ? form.categories : null,
          locale,
        },
      });
      if (error) throw error;
      const result = data as { status: string; message?: string };

      if (result.status === "account_exists") {
        toast.info(t("join.accountExists"));
        navigate(`/login?email=${encodeURIComponent(form.email.trim())}`, { replace: true });
        return;
      }
      if (result.status === "validation_error") {
        toast.error(result.message || t("join.errorRequired"));
        return;
      }
      if (result.status === "error") {
        toast.error(result.message || t("join.errorGeneric"));
        return;
      }

      setStep(TOTAL_STEPS);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("join.errorGeneric");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <header className="bg-navy text-cream px-4 sm:px-8 py-4 flex items-center justify-between">
        <img src="/outzip-logo.png" alt="Outzip" className="h-8" />
        <LanguageSwitcher variant="inline" />
      </header>

      {step < TOTAL_STEPS && <WizardProgress step={step} total={TOTAL_STEPS} />}

      <main className="flex-1 px-4 py-6 sm:py-10">
        <div className="mx-auto max-w-lg">
          {step === 0 && <Step1Shop form={form} update={update} errors={errors} />}
          {step === 1 && <Step2Offering form={form} update={update} errors={errors} />}
          {step === 2 && <Step3Contact form={form} update={update} errors={errors} />}
          {step === 3 && <Step4Review form={form} onEdit={handleEdit} />}
          {step === TOTAL_STEPS && (
            <SuccessPanel email={form.email} shopName={form.shopName} />
          )}

          {step < 3 && <WizardPreviewCard form={form} />}
        </div>
      </main>

      {step < TOTAL_STEPS && (
        <WizardFooter
          step={step}
          isLast={step === 3}
          submitting={submitting}
          onBack={handleBack}
          onNext={step === 3 ? handleSubmit : handleNext}
        />
      )}

      <footer className="bg-navy text-cream/60 px-4 py-6 text-center text-sm flex flex-wrap items-center justify-center gap-2">
        <span>© 2026 Outzip</span>
        <span>·</span>
        <a
          href={`https://outzip.de/${locale}/help?header=3`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-cream transition-colors"
        >
          {t("join.footerPrivacy")}
        </a>
        <span>·</span>
        <a
          href={`https://outzip.de/${locale}/help?header=4`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-cream transition-colors"
        >
          {t("join.footerImprint")}
        </a>
      </footer>
    </div>
  );
};

export default JoinPage;
