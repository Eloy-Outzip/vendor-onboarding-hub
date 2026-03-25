

## Fix Multiple Issues: Categories, Website Links, Map Directory, Postal Code, Profile Completion, Tab Switching

### 1. Fix Categories Display on ServicesPage (Screenshot Bug)

The ServicesPage displays raw category keys (`catSnowTouring`) instead of translated labels. Line 98 shows `{cat}` — needs `{t("join." + cat)}` instead.

Also, the ProfilePage (line 60) queries a non-existent `categories` table. It should read `vendors.categories` (the array column) instead.

**Files:** `src/pages/ServicesPage.tsx`, `src/pages/ProfilePage.tsx`

### 2. Fix Website Link on ProfilePage

Line 146 in ProfilePage renders `<a href={form.website}>` but if the value is `example.com` (no protocol), the browser treats it as a relative URL → `app.outzip.de/example.com`. Fix: prepend `https://` if the URL doesn't start with `http://` or `https://`.

Apply the same fix on VendorMapPage popup (line 102) and VendorProfilePage contact section (line 208).

**Files:** `src/pages/ProfilePage.tsx`, `src/pages/VendorMapPage.tsx`, `src/pages/VendorProfilePage.tsx`

### 3. Add Shop Directory Sidebar on /map Page

Add a scrollable sidebar on the left of the map listing all vendors (name, city, categories). Clicking a vendor flies the map to their pin and opens the popup. On mobile, show the list below the search bar as a collapsible panel.

**File:** `src/pages/VendorMapPage.tsx`

### 4. Add Postal Code Field

**Migration:** Add `postal_code text` column to `vendors` table.

**Files to update:**
- `src/pages/ProfilePage.tsx` — add postal_code field to form
- `src/pages/VendorProfilePage.tsx` — add to Vendor interface, edit form, display
- `src/pages/AdminCreateVendorPage.tsx` — add to creation form
- `src/pages/JoinPage.tsx` — optionally add to registration (or skip for simplicity)
- `src/i18n/en.json` + `src/i18n/de.json` — add `profile.postalCode` / `vendorProfile.postalCode` keys ("PLZ" / "Postal code")

### 5. Mark Phone as Optional in UI

Phone is already nullable in DB. Add "(optional)" label text next to Phone labels in ProfilePage and JoinPage forms.

### 6. Fix Profile Completeness Logic + Add Services Submit

**Current problem:** ProfilePage checks a non-existent `categories` table for step 2. It should check `vendors.categories` array instead.

**New completeness logic (ProfilePage):**
- Step 1 (33%): Profile details saved (name, email, city filled)
- Step 2 (+33%): `vendors.categories` has at least one entry
- Step 3 (+34%): Products submitted

**ServicesPage:** This page currently lets vendors add free-text services via an input. But the actual categories are the checkbox-based ones from JoinPage. Redesign ServicesPage to show the same checkbox grid as JoinPage/VendorProfilePage, plus a "Save" button that updates `vendors.categories` and navigates back to profile.

### 7. Add "View My Profile" Button

When profile is 100% complete (or anytime), add a "View profile" link on ProfilePage that navigates to `/vendors/{vendorId}` — the public-facing vendor profile page.

**File:** `src/pages/ProfilePage.tsx`

### 8. Fix Tab Switching "Loading" Flash

In `AuthContext.tsx`, the `onAuthStateChange` handler sets `loading = true` on every event including `TOKEN_REFRESHED` (fired when returning to tab). Fix: only set `loading = true` for events that actually change the user (`SIGNED_IN`, `SIGNED_OUT`, `INITIAL_SESSION`). For `TOKEN_REFRESHED`, just update the session/user without flashing loading.

**File:** `src/contexts/AuthContext.tsx`

### 9. Prevent Duplicate Data

In ProfilePage `handleSave`, after successful save, update the local `vendor` state so re-saves don't create inconsistencies. The current code already does `setVendor(...)` on VendorProfilePage but ProfilePage doesn't update `vendor` state after save — fix that.

### Translation Keys to Add

**en.json / de.json:**
- `profile.postalCode`: "Postal code" / "PLZ"
- `profile.viewProfile`: "View my profile →" / "Mein Profil ansehen →"
- `profile.phoneOptional`: "(optional)" / "(optional)"
- `services.save`: "Save" / "Speichern"
- `vendorMap.directory`: "Shops" / "Shops"

### Files Summary

| Action | File |
|--------|------|
| Migration | Add `postal_code` column to `vendors` |
| Edit | `src/contexts/AuthContext.tsx` — skip loading on TOKEN_REFRESHED |
| Edit | `src/pages/ServicesPage.tsx` — checkbox grid, translate categories, save button |
| Edit | `src/pages/ProfilePage.tsx` — fix categories check, add postal_code, website URL fix, view profile button, phone optional label |
| Edit | `src/pages/VendorProfilePage.tsx` — postal_code field, website URL fix |
| Edit | `src/pages/VendorMapPage.tsx` — vendor directory sidebar, website URL fix, translate categories |
| Edit | `src/pages/AdminCreateVendorPage.tsx` — postal_code field |
| Edit | `src/i18n/en.json` — new keys |
| Edit | `src/i18n/de.json` — new keys |

