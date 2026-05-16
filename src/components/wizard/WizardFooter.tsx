import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WizardFooterProps {
  step: number;
  isLast: boolean;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function WizardFooter({
  step,
  isLast,
  submitting,
  onBack,
  onNext,
}: WizardFooterProps) {
  const { t } = useLanguage();

  return (
    <div className="sticky bottom-0 bg-cream border-t border-border px-5 py-4 flex gap-2.5">
      {step > 0 && (
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          className="gap-1.5"
          type="button"
        >
          <ArrowLeft size={16} />
          {t("join.back")}
        </Button>
      )}
      <Button
        size="lg"
        className="flex-1 gap-1.5"
        onClick={onNext}
        disabled={submitting}
        type="button"
      >
        {submitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            {isLast ? t("join.submitMagicLink") : t("join.continue")}
            <ArrowRight size={16} />
          </>
        )}
      </Button>
    </div>
  );
}
