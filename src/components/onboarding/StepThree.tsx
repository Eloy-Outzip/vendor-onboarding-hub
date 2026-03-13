import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Trash2 } from "lucide-react";
import type { ProductRow } from "@/pages/JoinPage";
import { toast } from "sonner";

interface StepThreeProps {
  products: ProductRow[];
  onChange: (products: ProductRow[]) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}

export const StepThree = ({
  products,
  onChange,
  onSubmit,
  onBack,
  submitting,
}: StepThreeProps) => {
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);

  const updateProduct = (
    index: number,
    field: keyof ProductRow,
    value: string | number
  ) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addRow = () => {
    if (products.length >= 30) {
      toast.error("Maximum 30 products allowed.");
      return;
    }
    onChange([...products, { brand: "", model: "", category: "", units: 1 }]);
  };

  const removeRow = (index: number) => {
    if (products.length <= 1) return;
    onChange(products.filter((_, i) => i !== index));
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text
        .split("\n")
        .map((l) => l.split(",").map((c) => c.trim().replace(/^"|"$/g, "")))
        .filter((l) => l.some((c) => c));

      if (lines.length < 2) {
        toast.error("CSV must have a header row and at least one data row.");
        return;
      }

      const header = lines[0].map((h) => h.toLowerCase());
      const brandIdx = header.indexOf("brand");
      const modelIdx = header.indexOf("model");
      const catIdx = header.indexOf("category");
      const unitsIdx = header.indexOf("units");

      if (brandIdx === -1 || modelIdx === -1) {
        toast.error("CSV must have 'brand' and 'model' columns.");
        return;
      }

      const rows = lines.slice(1).map((cols) => ({
        brand: cols[brandIdx] || "",
        model: cols[modelIdx] || "",
        category: cols[catIdx] || "",
        units: parseInt(cols[unitsIdx] || "1", 10) || 1,
      }));

      onChange(rows.slice(0, 30));
      setCsvPreview(lines.slice(0, 6));
      toast.success(`${rows.length} products imported.`);
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    const validProducts = products.filter((p) => p.brand && p.model);
    if (validProducts.length === 0) {
      toast.error("Please add at least one product with brand and model.");
      return;
    }
    onSubmit();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          List your products
        </h1>
        <p className="mt-2 text-muted-foreground">
          80% of customers book in advance. Be ready.
        </p>
      </div>

      <Tabs defaultValue="manual">
        <TabsList className="w-full">
          <TabsTrigger value="manual" className="flex-1">
            Manual entry
          </TabsTrigger>
          <TabsTrigger value="import" className="flex-1">
            Import CSV
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-4 space-y-3">
          <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_80px_40px] gap-2 text-xs font-medium text-muted-foreground px-1">
            <span>Brand *</span>
            <span>Model *</span>
            <span>Category</span>
            <span>Units</span>
            <span />
          </div>
          {products.map((p, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_80px_40px] gap-2 items-center"
            >
              <Input
                placeholder="Brand"
                value={p.brand}
                onChange={(e) => updateProduct(i, "brand", e.target.value)}
                maxLength={100}
              />
              <Input
                placeholder="Model"
                value={p.model}
                onChange={(e) => updateProduct(i, "model", e.target.value)}
                maxLength={100}
              />
              <Input
                placeholder="Category"
                value={p.category}
                onChange={(e) => updateProduct(i, "category", e.target.value)}
                maxLength={100}
              />
              <Input
                type="number"
                min={1}
                max={999}
                value={p.units}
                onChange={(e) =>
                  updateProduct(i, "units", parseInt(e.target.value) || 1)
                }
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                disabled={products.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addRow}
            disabled={products.length >= 30}
          >
            <Plus className="h-4 w-4 mr-1" /> Add row
          </Button>
          <p className="text-xs text-muted-foreground">
            {products.length}/30 rows
          </p>
        </TabsContent>

        <TabsContent value="import" className="mt-4 space-y-4">
          <div className="rounded-lg border-2 border-dashed p-8 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <Label
              htmlFor="csv-upload"
              className="cursor-pointer text-primary font-medium hover:underline"
            >
              Choose a .csv file
            </Label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVUpload}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Required columns: brand, model, category, units
            </p>
          </div>

          {csvPreview.length > 0 && (
            <div className="overflow-x-auto">
              <p className="text-sm font-medium mb-2">Preview (first 5 rows)</p>
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-muted">
                    {csvPreview[0].map((h, i) => (
                      <th key={i} className="text-left p-2 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.slice(1, 6).map((row, i) => (
                    <tr key={i} className="border-t">
                      {row.map((cell, j) => (
                        <td key={j} className="p-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} size="lg">
          ← Back
        </Button>
        <Button onClick={handleSubmit} size="lg" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit →"}
        </Button>
      </div>
    </div>
  );
};
