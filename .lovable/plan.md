

## Question 1: Exporting data to your own Supabase

Lovable Cloud uses the same technology as Supabase under the hood. You have several options to migrate data to your central platform later:

1. **Database dump/restore** — Export a full SQL dump from Lovable Cloud and restore it into your own Supabase or Postgres instance.
2. **API sync** — Build a backend function that reads from the Lovable Cloud tables and writes to your external database on a schedule or on-demand.
3. **CSV export** — Query tables via the API and export as CSV, then import into your platform.
4. **Direct connection** — Use the database connection string (available in your backend settings) to connect with any Postgres client (pgAdmin, DBeaver, etc.) and copy data directly.

The simplest approach: use the database connection string with `pg_dump` to get a full export anytime you want.

---

## Question 2: Excel file upload for products

Add an Excel/CSV file upload option to the `/products-upload` page so vendors can bulk-import products from a spreadsheet.

### Approach

Use the **SheetJS (xlsx)** library to parse Excel files client-side — no backend changes needed.

### Changes

**1. Install `xlsx` package**

Add `xlsx` as a dependency for client-side Excel parsing.

**2. Update `src/pages/ProductsUploadPage.tsx`**

- Add a file input (`accept=".xlsx,.xls,.csv"`) with an upload icon button
- On file select, parse the file using `xlsx.read()` → extract the first sheet → convert to JSON
- Map columns (expect headers: `brand`, `model`, `category`, `units`) to `ProductRow[]`
- Append parsed rows to the existing `rows` state (capped at 30)
- Show a toast with how many rows were imported
- Show validation errors if headers don't match expected format
- Visually: add an "Or upload a file" section with a dashed-border drop zone between the header text and the manual rows

### UI Layout

```text
┌─────────────────────────────────────┐
│ List your products                  │
│ Add up to 30 products...            │
│                                     │
│ ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐  │
│ │  📄 Upload Excel or CSV file   │  │
│ │  Drag & drop or click to browse│  │
│ └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘  │
│                                     │
│ ── or enter manually ──            │
│                                     │
│ Brand | Model | Category | Units    │
│ ...rows...                          │
└─────────────────────────────────────┘
```

