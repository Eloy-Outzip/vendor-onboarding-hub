import { MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CATEGORY_KEYS } from "@/lib/categories";
import type { WizardForm } from "@/lib/wizard-validation";

interface WizardPreviewCardProps {
  form: WizardForm;
}

export function WizardPreviewCard({ form }: WizardPreviewCardProps) {
  const { t } = useLanguage();

  const displayName = form.shopName || t("join.previewEmptyName");
  const displayCity = form.city || t("join.previewEmptyCity");

  const selectedCats = CATEGORY_KEYS.filter((c) =>
    form.categories.includes(c.key)
  );
  const visibleCats = selectedCats.slice(0, 6);
  const extraCount = selectedCats.length - visibleCats.length;

  return (
    <div
      className="mt-5 bg-card border border-border rounded-xl p-3.5"
      style={{ boxShadow: "0 2px 8px rgba(15,42,56,0.06)" }}
    >
      {/* Eyebrow divider */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-navy/50">
          {t("join.previewEyebrow")}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Preview body */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-primary font-bold text-lg"
          style={{ background: "rgba(245,106,0,0.08)" }}
        >
          {displayName[0]?.toUpperCase() || "?"}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-navy text-sm truncate">{displayName}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-navy/50 shrink-0" />
            <span className="text-xs text-navy/50 truncate">{displayCity}</span>
          </div>
        </div>
      </div>

      {/* Category pills */}
      {selectedCats.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {visibleCats.map(({ key, emoji }) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted text-navy/70 px-2 py-0.5 rounded-full"
            >
              {emoji} {t(`join.${key}`)}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="text-[11px] font-medium text-navy/50 px-2 py-0.5 rounded-full bg-muted">
              +{extraCount}
            </span>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-navy/40">{t("join.previewNoCats")}</p>
      )}
    </div>
  );
}
