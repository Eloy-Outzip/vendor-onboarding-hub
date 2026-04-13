

## Plan: Map Pins, Admin Dashboard Sorting, User Roles, and Auth Fix

### 1. Orange Map Pins (Branded)

Replace the default blue Leaflet markers with custom SVG markers using the brand orange color (`--primary: 24 91% 48%` = `hsl(24, 91%, 48%)`).

**Files:** `src/pages/VendorMapPage.tsx`, `src/pages/VendorProfilePage.tsx`

Create a custom `L.divIcon` with an inline SVG pin in orange, replacing the default `L.Icon.Default.mergeOptions(...)` approach. Both the main map and vendor profile mini-map will use the same branded pin.

---

### 2. Admin Dashboard — Sortable Vendor Directory

Add a sort selector dropdown to the Admin Dashboard table allowing sorting by: Name (A–Z), City, Status, Created date (newest/oldest).

**File:** `src/pages/AdminDashboardPage.tsx`

Add a `sortBy` state with options, and a `Select` dropdown next to the search input. Sort the `filtered` array before rendering.

**i18n:** Add sort-related keys to `de.json` and `en.json`.

---

### 3. User Roles & Access Setup

Current DB state:
- `eloy@outzip.de` → profile has `is_super_admin=true` AND `vendor_id` pointing to "Outzip Outdoorverleih"
- `orders@outzip.de` → **no profile exists yet**, but is the email on the "Outzip Outdoorverleih" vendor record already

**Changes needed:**

a) **Database migration:** Update the "Outzip Outdoorverleih" vendor record email from `eloy@outzip.de` to `orders@outzip.de` (it already matches — checking again, some vendors already use `orders@outzip.de`). Actually, we need to update the vendor `bce5643c-60b3-462f-bfa9-9c8f9b73d87e` email to `orders@outzip.de`.

b) **Database insert:** When `orders@outzip.de` logs in via magic link, a profile must exist linking them to the Outzip vendor. We need to:
- Remove `vendor_id` from eloy's profile (so eloy is admin-only)
- Create a profile for `orders@outzip.de` with `vendor_id = bce5643c-...` when they sign in

However, since profiles are created during registration (via `register-vendor` edge function), and `orders@outzip.de` has no auth account yet, the cleanest approach is:
- Use a DB update to set `eloy@outzip.de`'s profile `vendor_id = NULL` (admin-only)
- Use the `register-vendor` flow or admin invite for `orders@outzip.de` to create the auth account + profile linked to the Outzip vendor

**Simpler approach:** Use DB updates to:
1. Set eloy's profile `vendor_id = NULL` (pure admin)
2. Update vendor `bce5643c` email to `orders@outzip.de`
3. The user will need to invite/register `orders@outzip.de` as a new account linked to that vendor

c) **Admin navigation:** Currently admins are locked to `/admin/dashboard`. Make the `AppHeader` component show navigation links for admins (Dashboard, Create Vendor, Map, Profile) so they can navigate the full app.

**Files:** `src/components/AppHeader.tsx` — add admin nav links

d) **ProtectedRoute:** Already allows admins through (line 22: `if (!hasProfile && !isAdmin)`). No change needed.

e) **ProfilePage:** Currently shows "No vendor profile found" for admin-only users (no vendor_id). Add a conditional: if admin without vendor, show admin dashboard links instead of the vendor form.

---

### 4. Fix Authentication Triggering Constantly

**Root cause:** The `onAuthStateChange` handler in `AuthContext.tsx` sets `setLoading(true)` on line 150 for every `SIGNED_IN` event, including the `INITIAL_SESSION` event that fires on page load alongside the `init()` function. This creates a race condition: `init()` finishes → sets loading=false → `onAuthStateChange` fires `INITIAL_SESSION` → sets loading=true → runs profile check again → causes re-render cycle.

**Fix in `AuthContext.tsx`:**
- Add `INITIAL_SESSION` to the early-return alongside `TOKEN_REFRESHED` when `init()` has already handled it (use a `initializedRef` flag)
- After `init()` completes, set `initializedRef.current = true`
- In `onAuthStateChange`, if `initializedRef.current` and event is `INITIAL_SESSION`, just update session/user without re-checking profile or toggling loading

---

### Summary of File Changes

| File | Change |
|------|--------|
| `src/pages/VendorMapPage.tsx` | Custom orange SVG marker icon |
| `src/pages/VendorProfilePage.tsx` | Same orange marker for mini-map |
| `src/pages/AdminDashboardPage.tsx` | Add sort selector for vendor table |
| `src/components/AppHeader.tsx` | Add admin navigation links |
| `src/pages/ProfilePage.tsx` | Handle admin-only users (no vendor) |
| `src/contexts/AuthContext.tsx` | Fix double init race condition with `initializedRef` |
| `src/i18n/de.json` | Sort labels, admin nav keys |
| `src/i18n/en.json` | Sort labels, admin nav keys |

### Database Changes (via migration/insert tools)

1. Update eloy's profile: set `vendor_id = NULL`
2. Update vendor `bce5643c` email to `orders@outzip.de`
3. User will need to register/invite `orders@outzip.de` as a new account to create auth + profile for that vendor

