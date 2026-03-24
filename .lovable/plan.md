

## Vendor Profile Pages + Embeddable Vendor Map

### Overview
Add public vendor profile pages, an interactive vendor map, and an embeddable map variant. This requires database schema changes, new pages, and routing updates.

### 1. Database Migration

Add columns to `vendors` table:
```sql
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS lat numeric,
  ADD COLUMN IF NOT EXISTS lng numeric,
  ADD COLUMN IF NOT EXISTS marketplace_url text,
  ADD COLUMN IF NOT EXISTS logo_url text;
```

Note: `description` and `categories` already exist on the vendors table. No `is_super_admin` column exists on profiles — we'll add it:
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_super_admin boolean NOT NULL DEFAULT false;
```

Add RLS policy for public read of active vendors (map needs unauthenticated access):
```sql
-- Already have "Vendors readable by anyone" SELECT policy, so no change needed there.
```

The existing SELECT policy on vendors (`USING: true`) already allows public reads, which is what we need for the map and public profiles.

### 2. New Pages

**`src/pages/VendorProfilePage.tsx`** — Public page at `/vendors/:id`
- Fetches vendor by ID from `vendors` table
- Shows: name, logo (or fallback), description, category chips, city/address, contact info (email, phone, website)
- "Visit Shop" button linking to `marketplace_url` (if set)
- Small embedded map with single pin (Leaflet + OpenStreetMap) if lat/lng exist
- Edit mode: if logged-in user's `vendor_id` matches OR `profiles.is_super_admin = true`, show edit button toggling inline editing of all fields
- Edit saves via `supabase.from("vendors").update(...)` 

**`src/pages/VendorMapPage.tsx`** — Interactive map at `/map`
- Uses Leaflet + OpenStreetMap (free, no API key needed)
- Fetches all vendors where `status = 'active' AND lat IS NOT NULL AND lng IS NOT NULL`
- Each pin popup: shop name, category tags, "View Profile" link, "Visit Shop" external link
- Search bar: text input for city name, uses Nominatim (free geocoding) to get coordinates and re-center map
- "Use my location" button using browser geolocation API
- Default view: centered on Germany

**`src/pages/VendorMapEmbedPage.tsx`** — Clean map at `/map/embed`
- Same map as above but no header, no footer, no navigation — just the map filling the viewport
- Designed to be used inside an iframe

### 3. Routing Updates — `src/App.tsx`

Add three new public routes (no `ProtectedRoute` wrapper):
```
/vendors/:id  → VendorProfilePage
/map          → VendorMapPage
/map/embed    → VendorMapEmbedPage
```

### 4. Admin Embed Snippet — `src/pages/ProfilePage.tsx`

Add a section to the existing profile page (visible only to super admins) showing a copyable iframe snippet:
```html
<iframe src="https://outzip-signup.lovable.app/map/embed" width="100%" height="500" frameborder="0"></iframe>
```
With a "Copy" button.

### 5. Dependencies

Install `leaflet` and `react-leaflet` for the map:
- `leaflet` — map rendering
- `react-leaflet` — React bindings
- `@types/leaflet` — TypeScript types

### 6. Translation Keys

Add keys to `en.json` and `de.json` for:
- Vendor profile labels (description, categories, visit shop, edit, save)
- Map page (search placeholder, use my location, view profile)
- Embed snippet section

### 7. Files Summary

| Action | File |
|--------|------|
| Migration | Add `lat`, `lng`, `marketplace_url`, `logo_url` to vendors; `is_super_admin` to profiles |
| Create | `src/pages/VendorProfilePage.tsx` |
| Create | `src/pages/VendorMapPage.tsx` |
| Create | `src/pages/VendorMapEmbedPage.tsx` |
| Edit | `src/App.tsx` — add 3 routes |
| Edit | `src/pages/ProfilePage.tsx` — add embed snippet for super admins |
| Edit | `src/i18n/en.json` — new keys |
| Edit | `src/i18n/de.json` — new keys |
| Install | `leaflet`, `react-leaflet`, `@types/leaflet` |

### Security Notes
- Super admin check uses a server-side column on profiles, queried at runtime — not localStorage
- Vendor edit RLS already scoped via profiles.vendor_id match
- Map only shows active vendors with coordinates
- Public profile pages are read-only for unauthenticated users

