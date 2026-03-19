import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Plus, Trash2, Upload, ChevronDown, ChevronRight } from "lucide-react";
import { isEditorPreview } from "@/lib/isEditorPreview";
import * as XLSX from "xlsx";

interface VariantRow { type: string; value: string; units: number; }
interface ProductRow { brand: string; model: string; category: string; units: number; variants: VariantRow[]; expanded: boolean; }

const emptyVariant = (): VariantRow => ({ type: "", value: "", units: 1 });
const emptyRow = (): ProductRow => ({ brand: "", model: "", category: "", units: 1, variants: [], expanded: false });

const ProductsUploadPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState("");
  const [rows, setRows] = useState<ProductRow[]>([emptyRow()]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      if (isEditorPreview()) { setVendorId("preview"); setVendorName("Preview Vendor"); setLoading(false); }
      return;
    }
    const load = async () => {
      const { data: profile } = await supabase
        .from("profiles" as any).select("vendor_id").eq("id", user.id).single();
      const vid = (profile as any)?.vendor_id;
      if (!vid) { setLoading(false); return; }
      setVendorId(vid);
      const { data: vendor } = await supabase.from("vendors").select("name").eq("id", vid).single();
      setVendorName(vendor?.name || "");
      setLoading(false);
    };
    load();
  }, [user]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const updateRow = (i: number, field: keyof ProductRow, value: any) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  };

  const addRow = () => { if (rows.length >= 30) return; setRows([...rows, emptyRow()]); };
  const removeRow = (i: number) => { if (rows.length === 1) return; setRows(rows.filter((_, idx) => idx !== i)); };

  const addVariant = (i: number) => {
    setRows((prev) => prev.map((r, idx) =>
      idx === i ? { ...r, variants: [...r.variants, emptyVariant()], expanded: true } : r
    ));
  };

  const updateVariant = (rowIdx: number, varIdx: number, field: keyof VariantRow, value: any) => {
    setRows((prev) => prev.map((r, ri) =>
      ri === rowIdx ? { ...r, variants: r.variants.map((v, vi) => vi === varIdx ? { ...v, [field]: value } : v) } : r
    ));
  };

  const removeVariant = (rowIdx: number, varIdx: number) => {
    setRows((prev) => prev.map((r, ri) =>
      ri === rowIdx ? { ...r, variants: r.variants.filter((_, vi) => vi !== varIdx) } : r
    ));
  };

  const toggleExpanded = (i: number) => {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, expanded: !r.expanded } : r));
  };

  const parseFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

        if (json.length === 0) { toast.error(t("products.fileEmpty")); return; }

        // Group rows: if variant_type column exists, group by brand+model+category
        const hasVariants = json.some((row) => {
          const keys = Object.keys(row).map(k => k.toLowerCase().trim());
          return keys.includes("variant_type");
        });

        const parsed: ProductRow[] = [];

        if (hasVariants) {
          const grouped = new Map<string, ProductRow>();
          json.forEach((row) => {
            const n: Record<string, any> = {};
            Object.keys(row).forEach((k) => { n[k.toLowerCase().trim()] = row[k]; });
            const key = `${n.brand || ""}|${n.model || ""}|${n.category || ""}`;
            if (!grouped.has(key)) {
              grouped.set(key, {
                brand: String(n.brand || "").trim(),
                model: String(n.model || "").trim(),
                category: String(n.category || "").trim(),
                units: parseInt(n.units) || 1,
                variants: [],
                expanded: false,
              });
            }
            const vType = String(n.variant_type || "").trim();
            const vValue = String(n.variant_value || "").trim();
            if (vType || vValue) {
              grouped.get(key)!.variants.push({
                type: vType,
                value: vValue,
                units: parseInt(n.variant_units) || parseInt(n.units) || 1,
              });
            }
          });
          grouped.forEach((v) => { if (v.brand || v.model || v.category) parsed.push(v); });
        } else {
          json.forEach((row) => {
            const n: Record<string, any> = {};
            Object.keys(row).forEach((k) => { n[k.toLowerCase().trim()] = row[k]; });
            const r: ProductRow = {
              brand: String(n.brand || "").trim(),
              model: String(n.model || "").trim(),
              category: String(n.category || "").trim(),
              units: parseInt(n.units) || 1,
              variants: [],
              expanded: false,
            };
            if (r.brand || r.model || r.category) parsed.push(r);
          });
        }

        if (parsed.length === 0) { toast.error(t("products.fileNoRows")); return; }

        const available = 30 - rows.length;
        const toAdd = parsed.slice(0, available);
        const currentIsEmpty = rows.length === 1 && !rows[0].brand && !rows[0].model && !rows[0].category;
        setRows(currentIsEmpty ? toAdd : [...rows, ...toAdd]);

        toast.success(t("products.imported", { count: toAdd.length }));
        if (parsed.length > available) {
          toast.info(t("products.skipped", { count: parsed.length - available }));
        }
      } catch {
        toast.error(t("products.fileParseError"));
      }
    };
    reader.readAsArrayBuffer(file);
  }, [rows, t]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
    e.target.value = "";
  }, [parseFile]);

  const handleSubmit = async () => {
    if (!vendorId) return;
    const valid = rows.filter((r) => r.brand.trim() && r.model.trim() && r.category.trim());
    if (valid.length === 0) { toast.error(t("products.errorMinOne")); return; }

    setSubmitting(true);
    try {
      // Insert products and get back IDs
      const { data: insertedProducts, error: prodError } = await supabase.from("products").insert(
        valid.map((r) => ({
          vendor_id: vendorId, brand: r.brand.trim(), model: r.model.trim(),
          category: r.category.trim(), units: r.variants.length > 0 ? null : r.units,
          channel: "rental", status: "pending",
        }))
      ).select("id");
      if (prodError) throw prodError;

      // Insert variants
      if (insertedProducts) {
        const variantInserts: { product_id: string; variant_type: string; variant_value: string; units: number }[] = [];
        valid.forEach((r, i) => {
          r.variants.forEach((v) => {
            if (v.type.trim() || v.value.trim()) {
              variantInserts.push({
                product_id: insertedProducts[i].id,
                variant_type: v.type.trim(),
                variant_value: v.value.trim(),
                units: v.units,
              });
            }
          });
        });
        if (variantInserts.length > 0) {
          const { error: varError } = await supabase.from("product_variants" as any).insert(variantInserts);
          if (varError) throw varError;
        }
      }

      // Webhook
      try {
        const webhookUrl = import.meta.env.VITE_PRODUCT_WEBHOOK_URL;
        if (webhookUrl) {
          const csvHeader = "vendor_id,vendor_name,brand,model,category,units,variant_type,variant_value,variant_units";
          const csvRows = valid.flatMap((r) => {
            if (r.variants.length === 0) {
              return [`${vendorId},${csvEscape(vendorName)},${csvEscape(r.brand)},${csvEscape(r.model)},${csvEscape(r.category)},${r.units},,,`];
            }
            return r.variants.map((v) =>
              `${vendorId},${csvEscape(vendorName)},${csvEscape(r.brand)},${csvEscape(r.model)},${csvEscape(r.category)},,${csvEscape(v.type)},${csvEscape(v.value)},${v.units}`
            );
          }).join("\n");
          await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "text/csv" }, body: csvHeader + "\n" + csvRows });
        }
      } catch { console.warn("Webhook POST failed — continuing."); }

      await supabase.from("vendors").update({ status: "products_submitted" }).eq("id", vendorId);
      toast.success(t("products.submitted"));
      navigate("/profile");
    } catch (err: any) {
      toast.error(err.message || t("products.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t("common.loading")}</div>;
  if (!vendorId) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t("common.noVendor")}</div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("products.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("products.subtitle")}</p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}`}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground">{t("products.uploadTitle")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("products.uploadHint")}</p>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground uppercase">{t("products.orManually")}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-3">
          <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_80px_40px] gap-2 text-xs font-medium text-muted-foreground uppercase">
            <span>{t("products.brand")}</span>
            <span>{t("products.model")}</span>
            <span>{t("products.category")}</span>
            <span>{t("products.units")}</span>
            <span />
          </div>

          {rows.map((row, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_80px_40px] gap-2">
                <Input placeholder={t("products.brandPlaceholder")} value={row.brand} onChange={(e) => updateRow(i, "brand", e.target.value)} />
                <Input placeholder={t("products.modelPlaceholder")} value={row.model} onChange={(e) => updateRow(i, "model", e.target.value)} />
                <Input placeholder={t("products.categoryPlaceholder")} value={row.category} onChange={(e) => updateRow(i, "category", e.target.value)} />
                <Input
                  type="number" min={1} value={row.variants.length > 0 ? "" : row.units}
                  onChange={(e) => updateRow(i, "units", parseInt(e.target.value) || 1)}
                  disabled={row.variants.length > 0}
                  placeholder={row.variants.length > 0 ? "—" : "1"}
                />
                <Button variant="ghost" size="icon" onClick={() => removeRow(i)} disabled={rows.length === 1} className="text-muted-foreground">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Variants section */}
              {row.variants.length > 0 && (
                <button
                  onClick={() => toggleExpanded(i)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {row.expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  {row.variants.length} variant{row.variants.length > 1 ? "s" : ""}
                </button>
              )}

              {(row.expanded || row.variants.length === 0 ? true : false) && row.variants.length > 0 && (
                <div className="ml-4 space-y-2 border-l-2 border-muted pl-4">
                  {row.variants.map((v, vi) => (
                    <div key={vi} className="grid grid-cols-[1fr_1fr_80px_32px] gap-2">
                      <Input
                        placeholder={t("products.variantTypePlaceholder")}
                        value={v.type}
                        onChange={(e) => updateVariant(i, vi, "type", e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Input
                        placeholder={t("products.variantValuePlaceholder")}
                        value={v.value}
                        onChange={(e) => updateVariant(i, vi, "value", e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Input
                        type="number" min={1} value={v.units}
                        onChange={(e) => updateVariant(i, vi, "units", parseInt(e.target.value) || 1)}
                        className="h-8 text-sm"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeVariant(i, vi)} className="h-8 w-8 text-muted-foreground">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="ghost" size="sm" onClick={() => addVariant(i)} className="text-xs text-muted-foreground h-7 px-2">
                <Plus className="h-3 w-3 mr-1" /> {t("products.addVariant")}
              </Button>
            </div>
          ))}
        </div>

        {rows.length < 30 && (
          <Button variant="outline" onClick={addRow} className="gap-1">
            <Plus className="h-4 w-4" /> {t("products.addRow")}
          </Button>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/profile")} size="lg">{t("common.back")}</Button>
          <Button onClick={handleSubmit} size="lg" disabled={submitting}>
            {submitting ? t("common.submitting") : t("products.submit")}
          </Button>
        </div>
      </div>
    </div>
  );
};

const csvEscape = (s: string) => {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

export default ProductsUploadPage;
