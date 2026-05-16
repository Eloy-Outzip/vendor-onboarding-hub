import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SuccessPanelProps {
  email: string;
  shopName: string;
}

export function SuccessPanel({ email, shopName }: SuccessPanelProps) {
  const { t } = useLanguage();

  return (
    <div
      className="bg-card border border-border rounded-2xl p-8 text-center"
      style={{ boxShadow: "0 2px 8px rgba(15,42,56,0.06)" }}
    >
      {/* Check circle */}
      <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-lime flex items-center justify-center">
        <Check size={30} className="text-navy" strokeWidth={2.5} />
      </div>

      {/* Title */}
      <h2
        className="text-[28px] font-bold leading-[1.05] tracking-[-0.015em] text-navy mb-2"
        style={{ fontFamily: '"Bauhaus Apex Display", system-ui, sans-serif' }}
      >
        {t("join.successTitle").replace("{shopname}", shopName)}
      </h2>

      <p className="text-sm text-navy/60 mb-5">{t("join.successSubtitle")}</p>

      {/* Email row */}
      <div className="flex items-center justify-center gap-2 bg-muted rounded-xl px-4 py-3 mb-6">
        <span className="text-sm text-navy/60">{t("join.successEmailSentTo")}</span>
        <span className="text-sm font-semibold text-navy">{email}</span>
      </div>

      {/* What happens next */}
      <div className="text-left">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-navy/50 mb-3">
          {t("join.successNextTitle")}
        </p>
        <div className="space-y-2.5">
          {[
            t("join.successNext1"),
            t("join.successNext2"),
            t("join.successNext3"),
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-navy text-cream text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-navy/70 leading-snug">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
