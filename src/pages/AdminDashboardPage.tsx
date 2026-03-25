import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ExternalLink, MapPin, Search } from "lucide-react";

interface Vendor {
  id: string;
  first_name: string;
  name: string;
  email: string;
  city: string | null;
  status: string;
  categories: string[] | null;
  lat: number | null;
  lng: number | null;
  slug: string | null;
  created_at: string;
}

const statusVariant = (status: string) => {
  switch (status) {
    case "active": return "default";
    case "products_submitted": return "secondary";
    default: return "outline";
  }
};

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin((data as any)?.is_super_admin === true);
      });
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchVendors = async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("id, first_name, name, email, city, status, categories, lat, lng, slug, created_at")
        .order("created_at", { ascending: false });
      if (error) {
        console.error(error);
        toast.error(error.message);
      } else {
        setVendors((data as unknown as Vendor[]) || []);
      }
      setLoading(false);
    };
    fetchVendors();
  }, [isAdmin]);

  const updateStatus = async (vendorId: string, newStatus: string) => {
    const { error } = await supabase
      .from("vendors")
      .update({ status: newStatus } as any)
      .eq("id", vendorId);
    if (error) {
      toast.error(error.message);
    } else {
      setVendors((prev) =>
        prev.map((v) => (v.id === vendorId ? { ...v, status: newStatus } : v))
      );
      toast.success(`Status → ${newStatus}`);
    }
  };

  if (isAdmin === false) return <Navigate to="/profile" replace />;
  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      (v.city || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />
      <div className="mx-auto max-w-6xl px-4 py-12 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground">
            {t("admin.vendorDashboard")}
          </h1>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t("admin.searchVendors")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("profile.companyName")}</TableHead>
                <TableHead>{t("profile.city")}</TableHead>
                <TableHead>{t("profile.email")}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><MapPin className="h-4 w-4" /></TableHead>
                <TableHead>{t("admin.created")}</TableHead>
                <TableHead className="text-right">{t("admin.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.city || "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{v.email}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(v.status)}>
                      {t(`admin.status_${v.status}`) || v.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {v.lat && v.lng ? (
                      <span className="text-xs text-primary">✓</span>
                    ) : (
                      <span className="text-xs text-destructive">✗</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(v.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {v.status !== "active" ? (
                      <Button size="sm" onClick={() => updateStatus(v.id, "active")}>
                        {t("admin.activate")}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(v.id, "pending")}
                      >
                        {t("admin.deactivate")}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`/vendors/${v.slug || v.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No vendors found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
