import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AppHeader from "@/components/AppHeader";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Pencil, Save, ArrowLeft } from "lucide-react";


const CATEGORY_KEYS = [
  { key: "catClimbing", emoji: "🧗" },
  { key: "catSnowTouring", emoji: "❄️" },
  { key: "catBikeBags", emoji: "🎒" },
  { key: "catRoofTents", emoji: "🚗" },
  { key: "catTents", emoji: "🏕️" },
  { key: "catBackpacks", emoji: "🎒" },
  { key: "catSleepingBags", emoji: "🛏️" },
  { key: "catBikesEbikes", emoji: "🚲" },
  { key: "catSki", emoji: "⛷️" },
  { key: "catCamping", emoji: "🏕️" },
  { key: "catWaterSports", emoji: "🚣" },
  { key: "catOther", emoji: "📦" },
];

import { orangeIcon } from "@/components/map/orangeMarker";

const formatUrl = (url: string) => {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

interface Vendor {
  id: string;
  name: string;
  first_name: string;
  description: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  categories: string[] | null;
  lat: number | null;
  lng: number | null;
  marketplace_url: string | null;
  
  status: string;
  slug: string | null;
}

const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

const VendorProfilePage = () => {
  const { id: param } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [form, setForm] = useState<Partial<Vendor>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!param) return;
      let data: any;
      if (isUUID(param)) {
        const res = await supabase.from("vendors").select("*").eq("id", param).maybeSingle();
        data = res.data;
      } else {
        const res = await (supabase.from("vendors").select("*") as any).eq("slug", param).maybeSingle();
        data = res.data;
      }
      if (data) {
        const v = data as unknown as Vendor;
        // If accessed by UUID and slug exists, redirect to slug URL
        if (isUUID(param) && v.slug) {
          navigate(`/vendors/${v.slug}`, { replace: true });
          return;
        }
        setVendor(v);
        setForm(v);
      }

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("vendor_id, is_super_admin")
          .eq("id", user.id)
          .maybeSingle();
        if (profile) {
          const p = profile as any;
          const vendorId = data ? (data as any).id : param;
          setCanEdit(p.vendor_id === vendorId || p.is_super_admin === true);
        }
      }
      setLoading(false);
    };
    load();
  }, [param, user]);

  // Auto-enter edit mode when ?edit=true is present and user can edit
  useEffect(() => {
    if (searchParams.get("edit") === "true" && canEdit) {
      setEditing(true);
    }
  }, [canEdit, searchParams]);

  const handleSave = async () => {
    if (!vendor?.id) return;
    setSaving(true);
    const { error } = await supabase.from("vendors").update({
      name: form.name,
      description: form.description || null,
      address: form.address || null,
      city: form.city || null,
      country: form.country || null,
      marketplace_url: form.marketplace_url || null,
      
      lat: form.lat ?? null,
      lng: form.lng ?? null,
      categories: form.categories || null,
    } as any).eq("id", vendor.id);
    if (error) toast.error(error.message);
    else {
      toast.success(t("common.save"));
      setVendor({ ...vendor!, ...form } as Vendor);
      setEditing(false);
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t("common.loading")}</div>;
  if (!vendor) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Vendor not found</div>;

  const seoDescription = vendor.description || [
    ...(vendor.categories || []).map((c) => t(`join.${c}`)),
    vendor.city,
  ].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet>
        <title>{vendor.name} — Outzip</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={vendor.name} />
        <meta property="og:description" content={seoDescription} />
      </Helmet>
      <AppHeader />
      <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
        {/* Back to map + edit */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/map")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {t("vendorProfile.backToMap")}
          </Button>
          {user && canEdit && !editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4 mr-1" /> {t("vendorProfile.edit")}
            </Button>
          )}
        </div>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {vendor.name.charAt(0)}
            </div>
            <div>
              {editing ? (
                <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="text-xl font-bold" />
              ) : (
                <h1 className="text-2xl font-bold text-foreground">{vendor.name}</h1>
              )}
              {vendor.city && <p className="text-muted-foreground">{vendor.city}{vendor.country ? `, ${vendor.country}` : ""}</p>}
            </div>
          </div>
        </div>

        {/* Description */}
        <section className="space-y-2">
          <Label className="text-sm font-semibold">{t("vendorProfile.description")}</Label>
          {editing ? (
            <Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          ) : (
            <p className="text-sm text-muted-foreground">{vendor.description || "—"}</p>
          )}
        </section>

        {/* Categories */}
        {editing ? (
          <section className="space-y-2">
            <Label className="text-sm font-semibold">{t("vendorProfile.categories")}</Label>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORY_KEYS.map(({ key, emoji }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 hover:bg-accent/50 transition-colors">
                  <Checkbox
                    checked={(form.categories || []).includes(key)}
                    onCheckedChange={() => {
                      const cats = form.categories || [];
                      setForm({
                        ...form,
                        categories: cats.includes(key) ? cats.filter((c) => c !== key) : [...cats, key],
                      });
                    }}
                  />
                  <span>{emoji} {t(`join.${key}`)}</span>
                </label>
              ))}
            </div>
          </section>
        ) : vendor.categories && vendor.categories.length > 0 ? (
          <section className="space-y-2">
            <Label className="text-sm font-semibold">{t("vendorProfile.categories")}</Label>
            <div className="flex flex-wrap gap-2">
              {vendor.categories.map((c) => (
                <span key={c} className="rounded-full border px-3 py-0.5 text-xs font-medium text-foreground">
                  {t(`join.${c}`)}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {/* Contact */}
        <section className="rounded-lg border p-4 space-y-2">
          <Label className="text-sm font-semibold">{t("vendorProfile.contact")}</Label>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>{vendor.email}</p>
            {vendor.phone && <p>{vendor.phone}</p>}
            {vendor.website && (
              <a href={formatUrl(vendor.website)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{vendor.website}</a>
            )}
          </div>
        </section>

        {/* Marketplace link */}
        {editing ? (
          <section className="space-y-2">
            <Label className="text-sm font-semibold">{t("vendorProfile.marketplaceUrl")}</Label>
            <Input value={form.marketplace_url || ""} onChange={(e) => setForm({ ...form, marketplace_url: e.target.value })} placeholder="https://..." />
          </section>
        ) : vendor.marketplace_url ? (
          <Button asChild variant="outline" className="w-full">
            <a href={vendor.marketplace_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> {t("vendorProfile.visitShop")}
            </a>
          </Button>
        ) : null}

        {/* Edit fields */}
        {editing && (
          <section className="space-y-4 rounded-lg border p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{t("vendorProfile.address")}</Label>
                <Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>{t("vendorProfile.city")}</Label>
                <Input value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>{t("vendorProfile.postalCode")}</Label>
                <Input value={(form as any).postal_code || ""} onChange={(e) => setForm({ ...form, postal_code: e.target.value } as any)} />
              </div>
              <div className="space-y-1">
                <Label>{t("vendorProfile.country")}</Label>
                <Input value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>{t("vendorProfile.coordinates")}</Label>
                <Input
                  placeholder="52.45935, 13.40671"
                  value={form.lat != null && form.lng != null ? `${form.lat}, ${form.lng}` : ""}
                  onChange={(e) => {
                    const parts = e.target.value.split(",").map((s) => s.trim());
                    if (parts.length === 2 && parts[0] && parts[1]) {
                      setForm({ ...form, lat: parseFloat(parts[0]) || null, lng: parseFloat(parts[1]) || null });
                    } else if (!e.target.value.trim()) {
                      setForm({ ...form, lat: null, lng: null });
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">{t("vendorProfile.coordinatesHint")}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-1" /> {saving ? t("common.saving") : t("common.save")}
              </Button>
              <Button variant="outline" onClick={() => { setEditing(false); setForm(vendor); }}>
                {t("vendorProfile.cancel")}
              </Button>
            </div>
          </section>
        )}

        {/* Mini map */}
        {vendor.lat && vendor.lng && (
          <section className="rounded-lg overflow-hidden border" style={{ height: 200 }}>
            <MapContainer center={[vendor.lat, vendor.lng]} zoom={13} className="w-full h-full" scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[vendor.lat, vendor.lng]} />
            </MapContainer>
          </section>
        )}
      </div>
    </div>
  );
};

export default VendorProfilePage;
