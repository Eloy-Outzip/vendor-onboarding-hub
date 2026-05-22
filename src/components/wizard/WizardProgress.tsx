import { useLanguage } from "@/contexts/LanguageContext";

interface WizardProgressProps {
  step: number;
  total: number;
}

export function WizardProgress({ step, total }: WizardProgressProps) {
  const { t } = useLanguage();
  const labels = [
    t("join.stepLabel1"),
    t("join.stepLabel2"),
    t("join.stepLabel3"),
    t("join.stepLabel4"),
  ];

  return (
    <div className="bg-card border-b border-border px-5 py-3 flex items-center gap-2.5">
      <span className="text-xs font-bold uppercase tracking-wider text-navy/60 shrink-0">
        <span className="text-primary">{step + 1}</span>
        {" / "}
        {total}
        {" · "}
        {labels[step]}
      </span>
      <div className="flex flex-1 gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>
    </div>
  );
}
