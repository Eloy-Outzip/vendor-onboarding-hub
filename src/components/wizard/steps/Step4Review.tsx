import { useRef, useEffect } from "react";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CATEGORY_KEYS } from "@/lib/categories";
import type { WizardForm } from "@/lib/wizard-validation";

interface Step4ReviewProps {
  form: WizardForm;
  onEdit: (step: number) => void;
}

export function Step4Review({ form, onEdit }: Step4ReviewProps) {
  const { t, locale } = useLanguage();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const selectedCats = CATEGORY_KEYS.filter((c) => form.categories.includes(c.key));

  const catCountLabel =
    locale === "de"
      ? `${form.categories.length} ausgewählt`
      : `${form.categories.length} selected`;

  const summaryRows = [
    {
      label: t("join.shopName").replace(" *", ""),
      value: form.shopName,
      step: 0,
    },
    {
      label: t("join.city").replace(" *", ""),
      value: form.city,
      step: 0,
    },
    ...(form.website
      ? [{ label: t("join.website"), value: form.website, step: 0 }]
      : []),
    {
      label: t("join.categoriesLabel"),
      value: catCountLabel,
      step: 1,
    },
    {
      label: t("join.email").replace(" *", ""),
      value: form.email,
      step: 2,
    },
  ];

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary mb-2">
        {t("join.s4Eyebrow")}
      </p>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-[28px] font-bold leading-[1.05] tracking-[-0.015em] text-navy mb-2 outline-none"
        style={{ fontFamily: '"Bauhaus Apex Display", system-ui, sans-serif' }}
      >
        {t("join.s4Title")}
      </h2>
      <p className="text-sm leading-[1.45] text-navy/60 mb-6">{t("join.s4Lead")}</p>

      {/* Public profile preview card */}
      <div
        className="mb-4 bg-card border border-border rounded-[14px] overflow-hidden"
        style={{ boxShadow: "0 2px 8px rgba(15,42,56,0.06)" }}
      >
        {/* Cover band */}
        <div className="relative h-[72px] bg-gradient-to-br from-navy via-navy/85 to-primary overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="absolute top-2 right-3 bg-lime text-navy text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            {locale === "de" ? "Vorschau" : "Preview"}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          {/* Avatar overlapping cover */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center -mt-7 mb-2 border-4 border-card text-primary font-bold text-[28px] relative z-10"
            style={{
              fontFamily: '"Bauhaus Apex Display", system-ui, sans-serif',
              background: "rgba(245,106,0,0.10)",
            }}
          >
            {form.shopName[0]?.toUpperCase() || "?"}
          </div>

          <h3
            className="font-bold text-[22px] text-navy leading-tight"
            style={{ fontFamily: '"Bauhaus Apex Display", system-ui, sans-serif' }}
          >
            {form.shopName}
          </h3>

          <div className="flex items-center gap-1.5 mt-1 text-[12px] text-navy/60">
            <MapPin size={12} className="shrink-0" />
            <span>{form.city}</span>
            {form.website && (
              <>
                <span>·</span>
                <span className="text-primary truncate max-w-[150px]">{form.website}</span>
              </>
            )}
          </div>

          {selectedCats.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {selectedCats.map(({ key, emoji }) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted text-navy/70 px-2 py-0.5 rounded-full"
                >
                  {emoji} {t(`join.${key}`)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editable summary list */}
      <div
        className="bg-card border border-border rounded-xl overflow-hidden"
        style={{ boxShadow: "0 2px 8px rgba(15,42,56,0.06)" }}
      >
        {summaryRows.map((row, i) => (
          <div key={row.label + i}>
            {i > 0 && <div className="h-px bg-border mx-3.5" />}
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-navy/60 uppercase tracking-wide">
                  {row.label}
                </p>
                <p className="text-[13px] font-semibold text-navy mt-0.5 truncate">{row.value}</p>
              </div>
              <button
                type="button"
                onClick={() => onEdit(row.step)}
                className="text-[12px] font-semibold text-primary shrink-0 ml-3"
              >
                {t("join.s4Edit")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
