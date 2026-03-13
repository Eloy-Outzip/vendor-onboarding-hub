import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { VendorData } from "@/pages/JoinPage";
import { toast } from "sonner";

interface StepOneProps {
  data: VendorData;
  onChange: (data: VendorData) => void;
  onNext: () => void;
}

export const StepOne = ({ data, onChange, onNext }: StepOneProps) => {
  const update = (field: keyof VendorData, value: string) =>
    onChange({ ...data, [field]: value });

  const handleNext = () => {
    if (!data.firstName.trim() || !data.companyName.trim() || !data.email.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      toast.error("Please enter a valid email.");
      return;
    }
    if (!data.city.trim() || !data.country.trim()) {
      toast.error("Please enter your city and country.");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Put your shop on the map
        </h1>
        <p className="mt-2 text-muted-foreground">
          Customers are looking for gear near them. Be found.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name *</Label>
            <Input
              id="firstName"
              value={data.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              placeholder="John"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company name *</Label>
            <Input
              id="companyName"
              value={data.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              placeholder="Alpine Rentals"
              maxLength={100}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="john@alpinerentals.com"
            maxLength={255}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (optional)</Label>
          <Input
            id="website"
            value={data.website}
            onChange={(e) => update("website", e.target.value)}
            placeholder="https://alpinerentals.com"
            maxLength={255}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Street address</Label>
          <Input
            id="address"
            value={data.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="123 Mountain Road"
            maxLength={255}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Chamonix"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={data.country}
              onChange={(e) => update("country", e.target.value)}
              placeholder="France"
              maxLength={100}
            />
          </div>
        </div>
      </div>

      <Button onClick={handleNext} size="lg" className="w-full sm:w-auto">
        Next →
      </Button>
    </div>
  );
};
