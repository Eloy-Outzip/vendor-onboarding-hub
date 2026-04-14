## Plan: Remove Sort Controls from /map, Keep on Admin Dashboard Only

### Changes

`**src/pages/VendorMapPage.tsx**`

- Remove the `sortBy` state, the `sortSelect` component, and the `Select` import
- Remove the sort dropdown from both the mobile directory toggle and the desktop sidebar header
- Use a fixed default sort order (alphabetical by name) for the vendor directory list

`**src/i18n/de.json` and `src/i18n/en.json**`

- Remove the `vendorMap.sortName`, `vendorMap.sortCity`, `vendorMap.sortNewest`, `vendorMap.sortOldest` keys (no longer needed)

The Admin Dashboard at `/admin/dashboard` already has its own sort selector and will remain unchanged.  
  
Replicate the sorting at /admin/dashboard in the same order applied to /map 