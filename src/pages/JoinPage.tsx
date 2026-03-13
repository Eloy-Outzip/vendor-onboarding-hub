import { useState } from "react";
import { StepOne } from "@/components/onboarding/StepOne";
import { StepTwo } from "@/components/onboarding/StepTwo";
import { StepThree } from "@/components/onboarding/StepThree";
import { Confirmation } from "@/components/onboarding/Confirmation";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VendorData {
  firstName: string;
  companyName: string;
  email: string;
  website: string;
  address: string;
  city: string;
  country: string;
  rentsEquipment: boolean;
  categories: string[];
  description: string;
}

export interface ProductRow {
  brand: string;
  model: string;
  category: string;
  units: number;
}

const JoinPage = () => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [vendorData, setVendorData] = useState<VendorData>({
    firstName: "",
    companyName: "",
    email: "",
    website: "",
    address: "",
    city: "",
    country: "",
    rentsEquipment: false,
    categories: [],
    description: "",
  });
  const [products, setProducts] = useState<ProductRow[]>([
    { brand: "", model: "", category: "", units: 1 },
  ]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: vendor, error: vendorError } = await supabase
        .from("vendors")
        .insert({
          first_name: vendorData.firstName,
          name: vendorData.companyName,
          email: vendorData.email,
          website: vendorData.website || null,
          address: vendorData.address,
          city: vendorData.city,
          country: vendorData.country,
          rents_equipment: vendorData.rentsEquipment,
          categories: vendorData.categories,
          description: vendorData.description,
          status: "pending",
        })
        .select("id")
        .single();

      if (vendorError) throw vendorError;

      const validProducts = products.filter((p) => p.brand && p.model);
      if (validProducts.length > 0) {
        const { error: productsError } = await supabase
          .from("products")
          .insert(
            validProducts.map((p) => ({
              vendor_id: vendor.id,
              brand: p.brand,
              model: p.model,
              category: p.category || null,
              units: p.units,
              channel: "rental",
            }))
          );
        if (productsError) throw productsError;
      }

      setStep(4);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 4) return <Confirmation />;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
        <ProgressBar step={step} />
        {step === 1 && (
          <StepOne
            data={vendorData}
            onChange={setVendorData}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepTwo
            data={vendorData}
            onChange={setVendorData}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepThree
            products={products}
            onChange={setProducts}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
};

export default JoinPage;
