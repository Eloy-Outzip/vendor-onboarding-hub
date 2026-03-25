

## Plan: SEO-Friendly Vendor URLs + Meta Tags

### 1. Add `slug` column to vendors table

**Migration:** Add a unique `slug` text column to `vendors`. Populate existing rows with a slugified version of their name (lowercase, hyphens, no special chars). Add a unique index.

```sql
ALTER TABLE public.vendors ADD COLUMN slug text;
UPDATE public.vendors SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) WHERE slug IS NULL;
CREATE UNIQUE INDEX vendors_slug_unique ON public.vendors (slug);
```

### 2. Update routing to use slug

**`src/App.tsx`:** Add a new route `/vendors/:slug` (keep `/vendors/:id` as fallback for UUID-based URLs that redirect to slug URL).

### 3. Update VendorProfilePage to resolve by slug

**`src/pages/VendorProfilePage.tsx`:**
- Detect whether the param is a UUID or a slug
- If UUID: query by `id`, then redirect to `/vendors/{slug}`
- If slug: query by `slug`
- Add `<Helmet>` (react-helmet-async) for SEO meta tags: title, description, og:title, og:description with vendor name, categories, and city

### 4. Update all internal links to use slug

**Files:**
- `src/pages/ProfilePage.tsx` — link to `/vendors/${vendorSlug}`
- `src/pages/AdminCreateVendorPage.tsx` — navigate to slug after creation
- `src/pages/VendorMapPage.tsx` — vendor links in sidebar and popups

### 5. Auto-generate slug on registration

**`supabase/functions/register-vendor/index.ts`:** Generate slug from vendor name during creation. Handle collisions by appending a number suffix (e.g. `outzip-2`).

### 6. Add SEO meta tags with react-helmet-async

Install `react-helmet-async`. On VendorProfilePage, render:
```html
<title>{vendor.name} — Outzip</title>
<meta name="description" content="{vendor.description || categories joined}" />
<meta property="og:title" content="{vendor.name}" />
<meta property="og:description" content="Categories: ..." />
```

### Files Summary

| Action | File |
|--------|------|
| Migration | Add `slug` column + unique index + backfill |
| Install | `react-helmet-async` |
| Edit | `src/App.tsx` — add slug route |
| Edit | `src/pages/VendorProfilePage.tsx` — resolve by slug, add meta tags |
| Edit | `src/pages/ProfilePage.tsx` — use slug in link |
| Edit | `src/pages/VendorMapPage.tsx` — use slug in links |
| Edit | `src/pages/AdminCreateVendorPage.tsx` — navigate to slug |
| Edit | `supabase/functions/register-vendor/index.ts` — generate slug |
| Edit | `src/main.tsx` — add HelmetProvider wrapper |

