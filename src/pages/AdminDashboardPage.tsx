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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ExternalLink, MapPin, Pencil, Search } from "lucide-react";
import { isEditorPreview } from "@/lib/isEditorPreview";

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

const MOCK_VENDORS: Vendor[] = [
  { id: "1", first_name: "Preview", name: "Alpine Rentals", email: "info@alpine.de", city: "Munich", status: "active", categories: ["catClimbing"], lat: 48.13, lng: 11.58, slug: "alpine-rentals", created_at: new Date().toISOString() },
  { id: "2", first_name: "Test", name: "Mountain Gear", email: "test@mountain.de", city: "Berlin", status: "pending", categories: ["catTents"], lat: null, lng: null, slug: "mountain-gear", created_at: new Date().toISOString() },
];

const statusVariant = (status: string) => {
  switch (status) {
    case "active": return "default";
    case "products_submitted": return "secondary";
    default: return "outline";
  }
};

const AdminDashboardPage = () => {
  const { user, isAdmin: isAdminFromCtx } = useAuth();
  const { t } = useLanguage();
  const isAdmin = isEditorPreview() ? true : isAdminFromCtx;
  const [vendors, setVendors] = useState<Vendor[]>(isEditorPreview() ? MOCK_VENDORS : []);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [mapSortOrder, setMapSortOrder] = useState("name");
  const [loading, setLoading] = useState(!isEditorPreview());

  useEffect(() => {
    if (!isAdmin) return;
    const fetchData = async () => {
      const [vendorsRes, settingsRes] = await Promise.all([
        supabase
          .from("vendors")
          .select("id, first_name, name, email, city, status, categories, lat, lng, slug, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("site_settings")
          .select("map_sort_order")
          .eq("id", 1)
          .single(),
      ]);
      if (vendorsRes.error) {
        console.error(vendorsRes.error);
        toast.error(vendorsRes.error.message);
      } else {
        setVendors((vendorsRes.data as unknown as Vendor[]) || []);
      }
      if (settingsRes.data?.map_sort_order) {
        setMapSortOrder(settingsRes.data.map_sort_order);
      }
      setLoading(false);
    };
    fetchData();
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

      // Send activation email when vendor is set to active
      if (newStatus === "active") {
        const vendor = vendors.find((v) => v.id === vendorId);
        if (vendor) {
          supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "vendor-activation",
              recipientEmail: vendor.email,
              idempotencyKey: `vendor-activation-${vendorId}-${Date.now()}`,
              templateData: {
                vendorName: vendor.name,
                profileUrl: `${window.location.origin}/vendors/${vendor.slug || vendorId}`,
              },
            },
          }).catch((err) => console.error("Activation email error:", err));
        }
      }
    }
  };

  const handleMapSortChange = async (value: string) => {
    setMapSortOrder(value);
    const { error } = await supabase
      .from("site_settings")
      .update({ map_sort_order: value } as any)
      .eq("id", 1);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Map sort order updated");
    }
  };

  if (!isAdmin) return <Navigate to="/profile" replace />;
  if (loading) {
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

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "name": return a.name.localeCompare(b.name);
      case "city": return (a.city || "").localeCompare(b.city || "");
      case "status": return a.status.localeCompare(b.status);
      case "oldest": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "newest":
      default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />
      <div className="mx-auto max-w-6xl px-4 py-12 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground">
            {t("admin.vendorDashboard")}
          </h1>
          <div className="flex items-center gap-3 w-full max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={t("admin.searchVendors")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("admin.sortNewest")}</SelectItem>
                <SelectItem value="oldest">{t("admin.sortOldest")}</SelectItem>
                <SelectItem value="name">{t("admin.sortName")}</SelectItem>
                <SelectItem value="city">{t("admin.sortCity")}</SelectItem>
                <SelectItem value="status">{t("admin.sortStatus")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Map sort order control */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground font-medium">{t("admin.mapSortOrder")}:</span>
          <Select value={mapSortOrder} onValueChange={handleMapSortChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t("admin.sortName")}</SelectItem>
              <SelectItem value="city">{t("admin.sortCity")}</SelectItem>
              <SelectItem value="newest">{t("admin.sortNewest")}</SelectItem>
              <SelectItem value="oldest">{t("admin.sortOldest")}</SelectItem>
            </SelectContent>
          </Select>
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
              {sorted.map((v) => (
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
                      <Link to={`/vendors/${v.slug || v.id}?edit=true`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
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
