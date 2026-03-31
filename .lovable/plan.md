## Plan: Fix 5 Issues in Outzip Platform

### 1. Add Missing Categories (Camping Ausrüstung + Wassersport)

Add two new category keys `catCamping` and `catWaterSports` to:

- **4 files** with `CATEGORY_KEYS` arrays: `JoinPage.tsx`, `VendorProfilePage.tsx`, `ServicesPage.tsx`, `AdminCreateVendorPage.tsx`
- **2 i18n files**: `de.json` (add `"catCamping": "Camping Ausrüstung"`, `"catWaterSports": "Wassersport"`) and `en.json` (add `"catCamping": "Camping gear"`, `"catWaterSports": "Water sports"`)

Change the emoji from "catDachzelte" to: emoji "🚗"

New entries:

```typescript
{ key: "catCamping", emoji: "🏕️" },
{ key: "catWaterSports", emoji: "🚣" },
```

---

### 2. Hide "Bearbeiten" Button from Public Users

In `VendorProfilePage.tsx`, the edit button already checks `canEdit` (line 184), and `canEdit` is only set when `user` exists (line 103). This means unauthenticated users already cannot see it. However, the `canEdit` logic runs inside `if (user)`, so it defaults to `false` for public visitors — this is already correct.

I'll verify and ensure robustness by also gating the button on `!!user` explicitly:

```typescript
{user && canEdit && !editing && ( ... )}
```

---

### 3. Remove Logo Header on /map, Keep Only Language Selector

In `VendorMapPage.tsx`, replace `<AppHeader />` with just the `<LanguageSwitcher>` component positioned absolutely over the map. Remove the background color — the language switcher floats over the map with a subtle backdrop.

---

### 4. Fix Auth Session Persistence / Reload Loop

Review the current `AuthContext.tsx` — it already:

- Initializes once via `useEffect([], [])`
- Uses `persistSession: true` in the Supabase client
- Handles `TOKEN_REFRESHED` without triggering loading state
- Has safety timeout

The current implementation looks solid. I'll check `LoginPage.tsx` for any `window.location` reloads or router remounts that could cause loops, and ensure no hard reloads happen — only React state updates.

---

### 5. Add "Back to Map" Button on Vendor Profile Pages

In `VendorProfilePage.tsx`, add a "← Zurück zur Karte" button at the top of the page content, positioned top-right, linking to `/map`.

Add i18n keys:

- `de.json`: `"vendorProfile.backToMap": "← Zurück zur Karte"`
- `en.json`: `"vendorProfile.backToMap": "← Back to map"`

### Files Modified

- `src/pages/VendorProfilePage.tsx` — categories, edit button guard, back-to-map button
- `src/pages/VendorMapPage.tsx` — remove header, add floating language switcher
- `src/pages/JoinPage.tsx` — add categories
- `src/pages/ServicesPage.tsx` — add categories
- `src/pages/AdminCreateVendorPage.tsx` — add categories
- `src/i18n/de.json` — new category + back-to-map keys
- `src/i18n/en.json` — new category + back-to-map keys
- `src/pages/LoginPage.tsx` — verify no hard reloads (fix if found)
- `src/contexts/AuthContext.tsx` — verify no reload triggers (fix if found)