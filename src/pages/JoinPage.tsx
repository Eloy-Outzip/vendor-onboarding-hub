import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const JoinPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    if (!loading && user) navigate("/profile", { replace: true });
  }, [user, loading, navigate]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.companyName.trim() || !form.email.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email.");
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Insert vendor
      const { data: vendor, error: vendorError } = await supabase
        .from("vendors")
        .insert({
          first_name: form.fullName,
          name: form.companyName,
          email: form.email,
          phone: form.phone || null,
          website: form.website || null,
          address: form.address || null,
          city: form.city || null,
          country: form.country || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (vendorError) throw vendorError;

      // Step 2: Sign up with auto-generated password
      const password = crypto.randomUUID() + "-" + crypto.randomUUID();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
        },
      });

      if (authError) {
        toast.error(
          "Account creation failed. Please contact support or try again with a different email."
        );
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        toast.error(
          "Account creation failed. Please contact support or try again with a different email."
        );
        return;
      }

      // Step 3: Insert profile
      const { error: profileError } = await supabase
        .from("profiles" as any)
        .insert({ id: userId, email: form.email, vendor_id: vendor.id } as any);

      if (profileError) {
        toast.error(
          "Account creation failed. Please contact support or try again with a different email."
        );
        return;
      }

      navigate("/welcome");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-xl px-4 py-12 sm:py-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Put your shop on the map
          </h1>
          <p className="mt-2 text-muted-foreground">
            Customers are looking for gear near them. Be found.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name *</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="John Doe"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name *</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                placeholder="Alpine Rentals"
                maxLength={100}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="john@alpinerentals.com"
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+33 6 12 34 56 78"
                maxLength={30}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://alpinerentals.com"
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Street address</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="123 Mountain Road"
              maxLength={255}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Chamonix"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                placeholder="France"
                maxLength={100}
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
            {submitting ? "Submitting…" : "Join now →"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default JoinPage;
