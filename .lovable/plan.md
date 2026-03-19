

## Enhance Product Upload with Variants + Merge Categories

### Current State
- `products` table has: brand, model, category (text), units, vendor_id
- `categories` table exists separately with: name, slug, vendor_id — but category is already a text field on products
- No variant support

### Plan

**1. Database Migration**

- Create `product_variants` table:
  - `id` (uuid, PK)
  - `product_id` (uuid, FK → products.id, ON DELETE CASCADE)
  - `variant_type` (text) — e.g. "Color", "Size", "Shape"
  - `variant_value` (text) — e.g. "Red", "Large", "Round"
  - `units` (integer, default 1)
  - `created_at` (timestamptz)
- RLS: same pattern as products (public insert + select)
- Drop `categories` table (category is already stored as text on products; the separate table is redundant)

**2. Update `ProductsUploadPage.tsx`**

- Expand `ProductRow` interface to include an array of variants:
  ```text
  { brand, model, category, units, variants: [{ type, value, units }] }
  ```
- Each product row gets an expandable "Add variant" button
- When variants exist, units are per-variant; when no variants, units are at product level
- On submit: insert products first, then bulk-insert variants referencing the returned product IDs
- File import: support optional columns `variant_type`, `variant_value`, `variant_units`

**3. Update webhook CSV**

- Add variant columns to the CSV payload: `variant_type`, `variant_value`, `variant_units`
- Each variant becomes its own CSV row (product fields repeated)

**4. Update translations (en.json + de.json)**

- Add keys: `products.variantType`, `products.variantValue`, `products.variantUnits`, `products.addVariant`, `products.removeVariant`, placeholders

### UI Layout (per product row)

```text
┌──────────┬──────────┬──────────┬───────┬───┐
│ Brand    │ Model    │ Category │ Units │ 🗑 │
├──────────┴──────────┴──────────┴───────┴───┤
│  + Add variant                              │
│  ┌────────────┬────────────┬───────┬───┐   │
│  │ Type: Color│ Value: Red │ Qty:5 │ 🗑 │   │
│  └────────────┴────────────┴───────┴───┘   │
└─────────────────────────────────────────────┘
```

When variants are present, the product-level Units field becomes disabled/hidden (units tracked per variant).

### Files to create/modify
- **Migration**: Create `product_variants` table, drop `categories` table
- **Modify**: `src/pages/ProductsUploadPage.tsx`
- **Modify**: `src/i18n/en.json`, `src/i18n/de.json`

