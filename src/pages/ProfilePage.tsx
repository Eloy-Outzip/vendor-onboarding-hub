import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { isEditorPreview } from "@/lib/isEditorPreview";

const formatUrl = (url: string) => {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

interface VendorRow {
  id: string;
  first_name: string;
  name: string;
  email: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  status: string;
  categories: string[] | null;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendor, setVendor] = useState<VendorRow | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "", name: "", email: "", phone: "", website: "", address: "", city: "", postal_code: "", country: "",
  });

  useEffect(() => {
    if (!user) {
      if (isEditorPreview()) {
        setVendor({ id: "preview", first_name: "Preview", name: "Preview Vendor", email: "preview@example.com", phone: null, website: null, address: null, city: null, postal_code: null, country: null, status: "pending", categories: ["catClimbing"] });
        setForm({ first_name: "Preview", name: "Preview Vendor", email: "preview@example.com", phone: "", website: "", address: "", city: "", postal_code: "", country: "" });
        setLoading(false);
      }
      return;
    }
    const load = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles" as any).select("vendor_id").eq("id", user.id).maybeSingle();
        if (profileError) { console.error("Profile fetch error:", profileError); return; }
        const vid = (profile as any)?.vendor_id;
        if (!vid) return;
        setVendorId(vid);
        const [vendorRes, prodsRes] = await Promise.all([
          supabase.from("vendors").select("*").eq("id", vid).maybeSingle(),
          supabase.from("products").select("id").eq("vendor_id", vid),
        ]);
        if (vendorRes.data) {
          const v = vendorRes.data as unknown as VendorRow;
          setVendor(v);
          setForm({
            first_name: v.first_name || "", name: v.name || "", email: v.email || "",
            phone: v.phone || "", website: v.website || "", address: v.address || "",
            city: v.city || "", postal_code: (v as any).postal_code || "", country: v.country || "",
          });
        }
        setProducts(prodsRes.data || []);
      } catch (err) {
        console.error("ProfilePage load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!vendorId) return;
    setSaving(true);
    const payload = {
      first_name: form.first_name, name: form.name, email: form.email,
      phone: form.phone || null, website: form.website || null, address: form.address || null,
      city: form.city || null, postal_code: form.postal_code || null, country: form.country || null,
    };
    const { error } = await supabase.from("vendors").update(payload as any).eq("id", vendorId);
    if (error) toast.error(error.message);
    else {
      toast.success(t("profile.saved"));
      setVendor((prev) => prev ? { ...prev, ...payload } as VendorRow : prev);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t("common.loading")}</div>;
  }

  if (!vendor) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t("common.noVendor")}</div>;
  }

  const step1Done = !!(vendor.name && vendor.email && vendor.city);
  const step2Done = (vendor.categories?.length ?? 0) > 0;
  const step3Done = ["products_submitted", "active"].includes(vendor.status) && products.length > 0;
  const progress = (step1Done ? 33 : 0) + (step2Done ? 33 : 0) + (step3Done ? 34 : 0);

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20 space-y-10">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">{t("profile.completion")}</span>
            <span className="text-sm font-medium text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">{t("profile.yourDetails")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("profile.fullName")}</Label>
              <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("profile.companyName")}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("profile.email")}</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("profile.phone")} <span className="text-muted-foreground font-normal">{t("profile.phoneOptional")}</span></Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("profile.website")}</Label>
            <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            {form.website && (
              <a href={formatUrl(form.website)} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{form.website}</a>
            )}
          </div>
          <div className="space-y-2">
            <Label>{t("profile.address")}</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t("profile.postalCode")}</Label>
              <Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("profile.city")}</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("profile.country")}</Label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </section>

        <section className="rounded-lg border p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{t("profile.services")}</h2>
          {step2Done ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Check className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">{t("profile.servicesAdded")}</span>
              {(vendor.categories || []).map((c) => (
                <span key={c} className="rounded-full border px-3 py-0.5 text-xs font-medium text-foreground">{t(`join.${c}`)}</span>
              ))}
              <Button variant="link" size="sm" asChild>
                <Link to="/services">{t("profile.editServices")}</Link>
              </Button>
            </div>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/services">{t("profile.addServices")}</Link>
            </Button>
          )}
        </section>

        <section className="rounded-lg border p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{t("profile.products")}</h2>
          {step3Done ? (
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                {t("profile.productsSubmitted")} ({products.length} {t("profile.items")})
              </span>
            </div>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/products-upload">{t("profile.addProducts")}</Link>
            </Button>
          )}
        </section>

        {/* View my profile link */}
        {vendorId && (
          <Button variant="outline" size="lg" asChild className="w-full">
            <Link to={`/vendors/${vendorId}`}>{t("profile.viewProfile")}</Link>
          </Button>
        )}

        {/* Admin section */}
        <AdminSection userId={user?.id} />
      </div>
    </div>
  );
};

const AdminSection = ({ userId }: { userId?: string }) => {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.from("profiles").select("is_super_admin").eq("id", userId).maybeSingle().then(({ data }) => {
      if ((data as any)?.is_super_admin) setIsAdmin(true);
    });
  }, [userId]);

  if (!isAdmin) return null;

  const snippet = `<iframe src="https://outzip-signup.lovable.app/map/embed" width="100%" height="500" frameborder="0"></iframe>`;

  return (
    <>
      <section className="rounded-lg border p-6 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">{t("admin.createVendor")}</h2>
        <Button variant="outline" asChild>
          <Link to="/admin/create-vendor">{t("admin.createVendor")} →</Link>
        </Button>
      </section>
      <section className="rounded-lg border p-6 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Embed Map</h2>
        <pre className="bg-muted rounded p-3 text-xs overflow-x-auto">{snippet}</pre>
        <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(snippet); toast.success("Copied!"); }}>
          Copy snippet
        </Button>
      </section>
    </>
  );
};

export default ProfilePage;
