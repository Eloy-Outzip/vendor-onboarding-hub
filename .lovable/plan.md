

## Fix: Pages Stuck on "Loading" in Editor Preview

### Problem
In the editor preview, `user` is `null` (no real auth session). The `ProtectedRoute` correctly bypasses auth, but the pages themselves (`ProductsUploadPage`, `ServicesPage`, `ProfilePage`) all have `useEffect` blocks that bail early with `if (!user) return;` — never calling `setLoading(false)`. This leaves the page stuck on "Loading…" forever.

### Solution
Add the same `isEditorPreview()` check inside each page's data-loading `useEffect`. When in editor preview with no user, skip the data fetch and set `loading = false` immediately so the page renders with empty/mock state.

### Files to modify

**`src/pages/ProductsUploadPage.tsx`** — In the `useEffect`, handle the case where `!user` in editor preview by setting `loading = false` and a dummy `vendorId`:
```typescript
useEffect(() => {
  if (!user) {
    if (isEditorPreview()) {
      setVendorId("preview");
      setVendorName("Preview Vendor");
      setLoading(false);
    }
    return;
  }
  // ...existing load logic
}, [user]);
```

**`src/pages/ProfilePage.tsx`** and **`src/pages/ServicesPage.tsx`** — Same pattern: when `!user` and `isEditorPreview()`, set `loading = false` with placeholder data so the UI renders.

### Helper
Extract the shared `isEditorPreview()` into a small utility (e.g. `src/lib/isEditorPreview.ts`) so all files use the same function instead of duplicating it.

### Files
- Create: `src/lib/isEditorPreview.ts`
- Modify: `src/pages/ProductsUploadPage.tsx`, `src/pages/ProfilePage.tsx`, `src/pages/ServicesPage.tsx`
- Optionally update `src/components/ProtectedRoute.tsx` and `src/App.tsx` to import from the shared utility

