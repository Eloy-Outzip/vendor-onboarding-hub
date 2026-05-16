import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import type { WizardForm, WizardErrors } from "@/lib/wizard-validation";

interface Step1ShopProps {
  form: WizardForm;
  update: <K extends keyof WizardForm>(field: K, value: WizardForm[K]) => void;
  errors: WizardErrors;
}

export function Step1Shop({ form, update, errors }: Step1ShopProps) {
  const { t } = useLanguage();
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary mb-2">
        {t("join.s1Eyebrow")}
      </p>
      <h2
        className="text-[28px] font-bold leading-[1.05] tracking-[-0.015em] text-navy mb-2"
        style={{ fontFamily: '"Bauhaus Apex Display", system-ui, sans-serif' }}
      >
        {t("join.s1Title")}
      </h2>
      <p className="text-sm leading-[1.45] text-navy/60 mb-6">{t("join.s1Lead")}</p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t("join.shopName")}
          </label>
          <Input
            ref={firstRef}
            value={form.shopName}
            onChange={(e) => update("shopName", e.target.value)}
            placeholder={t("join.shopNamePlaceholder")}
            maxLength={100}
            className={`h-11 ${errors.shopName ? "border-destructive" : ""}`}
          />
          {errors.shopName && (
            <p className="mt-1 text-xs font-semibold text-destructive">
              {t("join.errorRequired")}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t("join.city")}
          </label>
          <Input
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder={t("join.cityPlaceholder")}
            maxLength={100}
            className={`h-11 ${errors.city ? "border-destructive" : ""}`}
          />
          {errors.city && (
            <p className="mt-1 text-xs font-semibold text-destructive">
              {t("join.errorRequired")}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t("join.website")}
          </label>
          <Input
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            placeholder={t("join.websitePlaceholder")}
            maxLength={255}
            className="h-11"
          />
        </div>
      </div>
    </div>
  );
}
