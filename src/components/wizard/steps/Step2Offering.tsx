import { useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CATEGORY_KEYS } from "@/lib/categories";
import type { WizardForm, WizardErrors } from "@/lib/wizard-validation";

interface Step2OfferingProps {
  form: WizardForm;
  update: <K extends keyof WizardForm>(field: K, value: WizardForm[K]) => void;
  errors: WizardErrors;
}

const QUICK_PICKS = [
  {
    labelKey: "join.s2QuickAlpine",
    keys: ["catClimbing", "catSki", "catSnowTouring"],
  },
  {
    labelKey: "join.s2QuickBike",
    keys: ["catBikesEbikes", "catBikeBags", "catCamping"],
  },
  {
    labelKey: "join.s2QuickWater",
    keys: ["catWaterSports"],
  },
] as const;

export function Step2Offering({ form, update, errors }: Step2OfferingProps) {
  const { t } = useLanguage();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const toggle = (key: string) => {
    const current = form.categories;
    const next = current.includes(key)
      ? current.filter((c) => c !== key)
      : [...current, key];
    update("categories", next);
  };

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary mb-2">
        {t("join.s2Eyebrow")}
      </p>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-[28px] font-bold leading-[1.05] tracking-[-0.015em] text-navy mb-2 outline-none"
        style={{ fontFamily: '"Bauhaus Apex Display", system-ui, sans-serif' }}
      >
        {t("join.s2Title")}
      </h2>
      <p className="text-sm leading-[1.45] text-navy/60 mb-5">{t("join.s2Lead")}</p>

      {/* Quick-pick chips */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-navy/60 mb-2">{t("join.s2QuickPick")}</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PICKS.map((qp) => (
            <button
              key={qp.labelKey}
              type="button"
              onClick={() => update("categories", [...qp.keys])}
              className="inline-flex items-center gap-1 text-xs font-semibold bg-white border border-border rounded-full h-7 px-3 hover:border-primary/50 transition-colors"
            >
              <span className="text-primary">+</span>
              {t(qp.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {errors.categories && (
        <p className="mb-3 text-xs font-semibold text-destructive">
          {t("join.errorRequired")}
        </p>
      )}

      {/* Category grid */}
      <div className="grid grid-cols-2 gap-2">
        {CATEGORY_KEYS.map(({ key, emoji }) => {
          const selected = form.categories.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-left transition-colors ${
                selected
                  ? "border-[1.5px] border-primary bg-primary/5"
                  : "border-[1.5px] border-border bg-card hover:border-primary/30"
              }`}
            >
              <div
                className={`w-4 h-4 rounded shrink-0 flex items-center justify-center ${
                  selected ? "bg-primary" : "bg-white border border-border"
                }`}
              >
                {selected && (
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
              <span className="text-[13px] font-semibold text-navy">
                {emoji} {t(`join.${key}`)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
