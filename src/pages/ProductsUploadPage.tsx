import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";
import * as XLSX from "xlsx";

interface ProductRow {
  brand: string;
  model: string;
  category: string;
  units: number;
}

const emptyRow = (): ProductRow => ({ brand: "", model: "", category: "", units: 1 });

const ProductsUploadPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState("");
  const [rows, setRows] = useState<ProductRow[]>([emptyRow()]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
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
      const { data: vendor } = await supabase
        .from("vendors")
        .select("name")
        .eq("id", vid)
        .single();
      setVendorName(vendor?.name || "");
      setLoading(false);
    };
    load();
  }, [user]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const updateRow = (i: number, field: keyof ProductRow, value: string | number) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  };

  const addRow = () => {
    if (rows.length >= 30) return;
    setRows([...rows, emptyRow()]);
  };

  const removeRow = (i: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, idx) => idx !== i));
  };

  const parseFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

        if (json.length === 0) {
          toast.error("The file appears to be empty.");
          return;
        }

        // Normalize headers to lowercase
        const parsed: ProductRow[] = json.map((row) => {
          const normalized: Record<string, any> = {};
          Object.keys(row).forEach((k) => {
            normalized[k.toLowerCase().trim()] = row[k];
          });
          return {
            brand: String(normalized.brand || "").trim(),
            model: String(normalized.model || "").trim(),
            category: String(normalized.category || "").trim(),
            units: parseInt(normalized.units) || 1,
          };
        }).filter((r) => r.brand || r.model || r.category);

        if (parsed.length === 0) {
          toast.error("No valid rows found. Expected columns: brand, model, category, units.");
          return;
        }

        const available = 30 - rows.length;
        const toAdd = parsed.slice(0, available);
        // Replace the initial empty row if it's untouched
        const currentIsEmpty = rows.length === 1 && !rows[0].brand && !rows[0].model && !rows[0].category;
        setRows(currentIsEmpty ? toAdd : [...rows, ...toAdd]);

        toast.success(`Imported ${toAdd.length} product${toAdd.length > 1 ? "s" : ""}.`);
        if (parsed.length > available) {
          toast.info(`${parsed.length - available} rows were skipped (30 max).`);
        }
      } catch {
        toast.error("Could not parse the file. Please check the format.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, [rows]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
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
    if (valid.length === 0) {
      toast.error("Add at least one product with brand, model, and category.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Insert products
      const { error: prodError } = await supabase.from("products").insert(
        valid.map((r) => ({
          vendor_id: vendorId,
          brand: r.brand.trim(),
          model: r.model.trim(),
          category: r.category.trim(),
          units: r.units,
          channel: "rental",
          status: "pending",
        }))
      );
      if (prodError) throw prodError;

      // 2. CSV webhook (best-effort)
      try {
        const webhookUrl = import.meta.env.VITE_PRODUCT_WEBHOOK_URL;
        if (webhookUrl) {
          const csvHeader = "vendor_id,vendor_name,brand,model,category,units";
          const csvRows = valid
            .map(
              (r) =>
                `${vendorId},${csvEscape(vendorName)},${csvEscape(r.brand)},${csvEscape(r.model)},${csvEscape(r.category)},${r.units}`
            )
            .join("\n");
          const csv = csvHeader + "\n" + csvRows;
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "text/csv" },
            body: csv,
          });
        }
      } catch {
        console.warn("Webhook POST failed — continuing.");
      }

      // 3. Update vendor status
      await supabase
        .from("vendors")
        .update({ status: "products_submitted" })
        .eq("id", vendorId);

      toast.success("Products submitted!");
      navigate("/profile");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!vendorId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        No vendor profile found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-20 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            List your products
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add up to 30 products. Customers who book in advance will find you first.
          </p>
        </div>

        {/* File upload drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          }`}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground">Upload Excel or CSV file</p>
          <p className="text-xs text-muted-foreground mt-1">
            Drag & drop or click to browse — columns: brand, model, category, units
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground uppercase">or enter manually</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-3">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_80px_40px] gap-2 text-xs font-medium text-muted-foreground uppercase">
            <span>Brand *</span>
            <span>Model *</span>
            <span>Category *</span>
            <span>Units</span>
            <span />
          </div>

          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_80px_40px] gap-2">
              <Input
                placeholder="Brand"
                value={row.brand}
                onChange={(e) => updateRow(i, "brand", e.target.value)}
              />
              <Input
                placeholder="Model"
                value={row.model}
                onChange={(e) => updateRow(i, "model", e.target.value)}
              />
              <Input
                placeholder="Category"
                value={row.category}
                onChange={(e) => updateRow(i, "category", e.target.value)}
              />
              <Input
                type="number"
                min={1}
                value={row.units}
                onChange={(e) => updateRow(i, "units", parseInt(e.target.value) || 1)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRow(i)}
                disabled={rows.length === 1}
                className="text-muted-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {rows.length < 30 && (
          <Button variant="outline" onClick={addRow} className="gap-1">
            <Plus className="h-4 w-4" /> Add row
          </Button>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/profile")} size="lg">
            ← Back
          </Button>
          <Button onClick={handleSubmit} size="lg" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit →"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const csvEscape = (s: string) => {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export default ProductsUploadPage;
