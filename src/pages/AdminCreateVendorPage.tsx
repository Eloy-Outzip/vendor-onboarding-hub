import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const CATEGORY_KEYS = [
  { key: "catTents", emoji: "⛺" },
  { key: "catSleepingBags", emoji: "🌙" },
  { key: "catBackpacks", emoji: "🎒" },
  { key: "catBikes", emoji: "🚲" },
  { key: "catWinter", emoji: "⛷️" },
  { key: "catOther", emoji: "📦" },
];

const AdminCreateVendorPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
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
    description: "",
    marketplace_url: "",
    logo_url: "",
    lat: "",
    lng: "",
    status: "pending",
    categories: [] as string[],
  });

  const toggleCategory = (key: string) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(key)
        ? f.categories.filter((c) => c !== key)
        : [...f.categories, key],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.first_name) {
      toast.error(t("join.errorRequired"));
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.from("vendors").insert({
      first_name: form.first_name,
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      website: form.website || null,
      address: form.address || null,
      city: form.city || null,
      country: form.country || null,
      description: form.description || null,
      marketplace_url: form.marketplace_url || null,
      logo_url: form.logo_url || null,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      status: form.status,
      categories: form.categories.length > 0 ? form.categories : null,
    }).select("id").single();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("admin.vendorCreated"));
      navigate(`/vendors/${data.id}`);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />
      <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
        <h1 className="text-2xl font-bold text-foreground">{t("admin.createVendor")}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("join.fullName")} *</Label>
            <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t("join.companyName")} *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("join.email")} *</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t("join.phone")}</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("join.website")}</Label>
            <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t("vendorProfile.marketplaceUrl")}</Label>
            <Input value={form.marketplace_url} onChange={(e) => setForm({ ...form, marketplace_url: e.target.value })} placeholder="https://..." />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("vendorProfile.description")}</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
        </div>

        <div className="space-y-2">
          <Label>{t("join.address")}</Label>
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t("join.city")}</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t("join.country")}</Label>
            <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Lat</Label>
            <Input type="number" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Lng</Label>
            <Input type="number" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("vendorProfile.logoUrl")}</Label>
          <LogoUpload currentUrl={form.logo_url} onUpload={(url) => setForm({ ...form, logo_url: url })} />
        </div>

        <div className="space-y-2">
          <Label>{t("join.categoriesLabel")}</Label>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORY_KEYS.map(({ key, emoji }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 hover:bg-accent/50 transition-colors">
                <Checkbox checked={form.categories.includes(key)} onCheckedChange={() => toggleCategory(key)} />
                <span>{emoji} {t(`join.${key}`)}</span>
              </label>
            ))}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={saving} className="w-full">
          {saving ? t("common.saving") : t("admin.createVendor")}
        </Button>
      </div>
    </div>
  );
};

export default AdminCreateVendorPage;
