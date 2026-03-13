import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

interface Category { id: string; name: string; }

const ServicesPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase
        .from("profiles" as any).select("vendor_id").eq("id", user.id).single();
      const vid = (profile as any)?.vendor_id;
      if (!vid) { setLoading(false); return; }
      setVendorId(vid);
      const { data } = await supabase
        .from("categories" as any).select("id, name").eq("vendor_id", vid);
      setCategories(((data as any) || []) as Category[]);
      setLoading(false);
    };
    load();
  }, [user]);

  const addCategory = async () => {
    const name = newName.trim();
    if (!name || !vendorId) return;
    const { data, error } = await supabase
      .from("categories" as any)
      .insert({ vendor_id: vendorId, name, slug: slugify(name) } as any)
      .select("id, name").single();
    if (error) { toast.error(error.message); return; }
    setCategories([...categories, data as any]);
    setNewName("");
  };

  const removeCategory = async (id: string) => {
    const { error } = await supabase.from("categories" as any).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setCategories(categories.filter((c) => c.id !== id));
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
            <span key={cat.id} className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm font-medium">
              {cat.name}
              <button onClick={() => removeCategory(cat.id)} className="text-muted-foreground hover:text-destructive">
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
