

## Plan: Add Sort Controls to /map Directory + Sync with Admin Dashboard

### What changes

1. **Add a sort selector to the /map vendor directory** — same options as the admin dashboard (Name, City, Newest, Oldest). Place it in the sidebar header (desktop) and collapsible panel header (mobile), next to the vendor count.

2. **Apply the same sorting logic** in `VendorMapPage.tsx` as already exists in `AdminDashboardPage.tsx`. The vendor query will also fetch `created_at` to support date sorting.

3. **Add i18n keys** for the sort labels on the map page (reuse the existing `admin.sort*` keys or add `vendorMap.sort*` equivalents).

### Files Modified

| File | Change |
|------|--------|
| `src/pages/VendorMapPage.tsx` | Add `sortBy` state, `Select` dropdown in directory header, sort vendors before rendering, fetch `created_at` |
| `src/i18n/de.json` | Add `vendorMap.sortName`, `vendorMap.sortCity`, `vendorMap.sortNewest`, `vendorMap.sortOldest` |
| `src/i18n/en.json` | Same keys in English |

### Technical Detail

- Add `created_at` to the `MapVendor` interface and Supabase query
- Add `sortBy` state defaulting to `"name"` 
- Sort the `vendors` array before rendering in both the directory list and markers
- Place a compact `Select` dropdown in the directory sidebar header

