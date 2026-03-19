import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { isEditorPreview } from "@/lib/isEditorPreview";

const ServicesPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      if (isEditorPreview()) {
        setVendorId("preview");
        setCategories(["Sample Service"]);
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
      const vid = profile?.vendor_id;
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

  const addCategory = async () => {
    const name = newName.trim();
    if (!name || !vendorId) return;
    if (categories.includes(name)) {
      toast.error("Category already exists");
      return;
    }
    const updated = [...categories, name];
    if (vendorId !== "preview") {
      const { error } = await supabase
        .from("vendors")
        .update({ categories: updated })
        .eq("id", vendorId);
      if (error) { toast.error(error.message); return; }
    }
    setCategories(updated);
    setNewName("");
  };

  const removeCategory = async (name: string) => {
    const updated = categories.filter((c) => c !== name);
    if (vendorId && vendorId !== "preview") {
      const { error } = await supabase
        .from("vendors")
        .update({ categories: updated })
        .eq("id", vendorId);
      if (error) { toast.error(error.message); return; }
    }
    setCategories(updated);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t("common.loading")}</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-xl px-4 py-12 sm:py-20 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("services.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("services.subtitle")}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span key={cat} className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm font-medium">
              {cat}
              <button onClick={() => removeCategory(cat)} className="text-muted-foreground hover:text-destructive">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t("services.placeholder")} maxLength={100} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())} />
          <Button onClick={addCategory} size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={() => navigate("/profile")} size="lg">
          {t("services.backToProfile")}
        </Button>
      </div>
    </div>
  );
};

export default ServicesPage;
