import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { VendorData } from "@/pages/JoinPage";
import { toast } from "sonner";

const CATEGORIES = ["Ski", "Bike", "Surf", "Kayak", "Climbing", "Camping", "Other"];

interface StepTwoProps {
  data: VendorData;
  onChange: (data: VendorData) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepTwo = ({ data, onChange, onNext, onBack }: StepTwoProps) => {
  const toggleCategory = (cat: string) => {
    const cats = data.categories.includes(cat)
      ? data.categories.filter((c) => c !== cat)
      : [...data.categories, cat];
    onChange({ ...data, categories: cats });
  };

  const handleNext = () => {
    if (data.categories.length === 0) {
      toast.error("Please select at least one category.");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          What do you offer?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Help customers understand your services in seconds.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <Label htmlFor="rents" className="cursor-pointer">
            Do you rent equipment?
          </Label>
          <Switch
            id="rents"
            checked={data.rentsEquipment}
            onCheckedChange={(checked) =>
              onChange({ ...data, rentsEquipment: checked })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Categories *</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                  data.categories.includes(cat)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:border-primary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Short description</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) =>
              onChange({ ...data, description: e.target.value.slice(0, 200) })
            }
            placeholder="We rent premium ski gear for all levels..."
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground text-right">
            {data.description.length}/200
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} size="lg">
          ← Back
        </Button>
        <Button onClick={handleNext} size="lg">
          Next →
        </Button>
      </div>
    </div>
  );
};
