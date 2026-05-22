import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { WizardForm, WizardErrors } from "@/lib/wizard-validation";

interface Step3ContactProps {
  form: WizardForm;
  update: <K extends keyof WizardForm>(field: K, value: WizardForm[K]) => void;
  errors: WizardErrors;
}

export function Step3Contact({ form, update, errors }: Step3ContactProps) {
  const { t } = useLanguage();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary mb-2">
        {t("join.s3Eyebrow")}
      </p>
      <h2
        className="text-[28px] font-bold leading-[1.05] tracking-[-0.015em] text-navy mb-2"
        style={{ fontFamily: '"Bauhaus Apex Display", system-ui, sans-serif' }}
      >
        {t("join.s3Title")}
      </h2>
      <p className="text-sm leading-[1.45] text-navy/60 mb-6">{t("join.s3Lead")}</p>

      {/* Email field */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          {t("join.email")}
        </label>
        <Input
          ref={emailRef}
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder={t("join.emailPlaceholder")}
          maxLength={255}
          className={`h-11 ${errors.email ? "border-destructive" : ""}`}
        />
        {errors.email && (
          <p className="mt-1 text-xs font-semibold text-destructive">
            {t("join.errorEmail")}
          </p>
        )}
      </div>

      {/* Magic-link hint */}
      <div className="flex items-start gap-3 bg-cream border border-border rounded-[10px] px-3.5 py-3 mb-4">
        <Mail size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-navy/70 leading-snug">{t("join.s3MagicHint")}</p>
      </div>

      {/* Terms tile */}
      <button
        type="button"
        onClick={() => update("terms", !form.terms)}
        className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-[10px] text-left transition-colors ${
          errors.terms
            ? "border-[1.5px] border-destructive bg-destructive/5"
            : form.terms
            ? "border-[1.5px] border-primary bg-primary/5"
            : "border-[1.5px] border-border bg-muted"
        }`}
      >
        <div
          className={`w-4 h-4 rounded shrink-0 flex items-center justify-center mt-0.5 ${
            form.terms ? "bg-primary" : "bg-white border border-border"
          }`}
        >
          {form.terms && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4l2.5 2.5L9 1"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <span className="text-sm font-medium text-navy">{t("join.s3Terms")}</span>
      </button>
      {errors.terms && (
        <p className="mt-1 text-xs font-semibold text-destructive">
          {t("join.errorRequired")}
        </p>
      )}
    </div>
  );
}
