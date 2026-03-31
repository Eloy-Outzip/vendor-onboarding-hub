import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { isEditorPreview } from "@/lib/isEditorPreview";
import AppHeader from "@/components/AppHeader";

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
  { key: "catOther", emoji: "📦" },
];

const ServicesPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      if (isEditorPreview()) {
        setVendorId("preview");
        setCategories(["catClimbing"]);
        setLoading(false);
      }
      return;
    }
    const load = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("vendor_id")
        .eq("id", user.id)
        .single();
      const vid = (profile as any)?.vendor_id;
      if (!vid) { setLoading(false); return; }
      setVendorId(vid);
      const { data: vendor } = await supabase
        .from("vendors")
        .select("categories")
        .eq("id", vid)
        .single();
      setCategories(vendor?.categories || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const toggleCategory = (key: string) => {
    setCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!vendorId) return;
    setSaving(true);
    if (vendorId !== "preview") {
      const { error } = await supabase
        .from("vendors")
        .update({ categories } as any)
        .eq("id", vendorId);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    toast.success(t("profile.saved"));
    setSaving(false);
    navigate("/profile");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t("common.loading")}</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />
      <div className="mx-auto max-w-xl px-4 py-12 sm:py-20 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("services.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("services.subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CATEGORY_KEYS.map(({ key, emoji }) => (
            <label
              key={key}
              className="flex items-center gap-2 cursor-pointer rounded-lg border border-border px-3 py-2.5 hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <Checkbox
                checked={categories.includes(key)}
                onCheckedChange={() => toggleCategory(key)}
              />
              <span className="text-sm">{emoji} {t(`join.${key}`)}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? t("common.saving") : t("services.save")}
          </Button>
          <Button onClick={() => navigate("/profile")} size="lg" variant="outline">
            {t("services.backToProfile")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
