interface ProgressBarProps {
  step: number;
}

export const ProgressBar = ({ step }: ProgressBarProps) => {
  const labels = ["Get visible", "Your offer", "Your products"];

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-2">
        {labels.map((label, i) => (
          <div
            key={i}
            className={`text-sm font-medium ${
              i + 1 <= step ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-right">
        Step {step} of 3
      </p>
    </div>
  );
};
