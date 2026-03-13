import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface VendorRow {
  id: string;
  first_name: string;
  name: string;
  email: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  status: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendor, setVendor] = useState<VendorRow | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Get profile → vendor_id
      const { data: profile } = await supabase
        .from("profiles" as any)
        .select("vendor_id")
        .eq("id", user.id)
        .single();

      const vid = (profile as any)?.vendor_id;
      if (!vid) {
        setLoading(false);
        return;
      }
      setVendorId(vid);

      // Load vendor, categories, products in parallel
      const [vendorRes, catsRes, prodsRes] = await Promise.all([
        supabase.from("vendors").select("*").eq("id", vid).single(),
        supabase.from("categories" as any).select("id, name").eq("vendor_id", vid),
        supabase.from("products").select("id").eq("vendor_id", vid),
      ]);

      if (vendorRes.data) {
        const v = vendorRes.data as unknown as VendorRow;
        setVendor(v);
        setForm({
          first_name: v.first_name || "",
          name: v.name || "",
          email: v.email || "",
          phone: v.phone || "",
          website: v.website || "",
          address: v.address || "",
          city: v.city || "",
          country: v.country || "",
        });
      }
      setCategories(((catsRes.data as any) || []) as { id: string; name: string }[]);
      setProducts(prodsRes.data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!vendorId) return;
    setSaving(true);
    const { error } = await supabase
      .from("vendors")
      .update({
        first_name: form.first_name,
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        website: form.website || null,
        address: form.address || null,
        city: form.city || null,
        country: form.country || null,
      })
      .eq("id", vendorId);

    if (error) toast.error(error.message);
    else toast.success("Saved!");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        No vendor profile found.
      </div>
    );
  }

  const step2Done = categories.length > 0;
  const step3Done = ["products_submitted", "active"].includes(vendor.status);
  const progress = 33 + (step2Done ? 33 : 0) + (step3Done ? 34 : 0);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20 space-y-10">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Profile completion</span>
            <span className="text-sm font-medium text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Section A: Vendor details */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Your details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Company name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Street address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </section>

        {/* Section B: Services */}
        <section className="rounded-lg border p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Services</h2>
          {step2Done ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Check className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Services added:</span>
              {categories.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full border px-3 py-0.5 text-xs font-medium text-foreground"
                >
                  {c.name}
                </span>
              ))}
              <Button variant="link" size="sm" asChild>
                <Link to="/services">Edit →</Link>
              </Button>
            </div>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/services">Tell customers what you offer →</Link>
            </Button>
          )}
        </section>

        {/* Section C: Products */}
        <section className="rounded-lg border p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Products</h2>
          {step3Done ? (
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                Products submitted ({products.length} items)
              </span>
            </div>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/products-upload">List your products →</Link>
            </Button>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
