

## Plan: Fix Registration, Update Copy, Update Categories, Add Website Link

### 1. Fix Registration Bug

The registration flow on `/join` has a potential issue: when email auto-confirm is disabled, `supabase.auth.signUp` may return `session: null` and `user` with no active session. This means the profile INSERT runs with the anon key — which works due to RLS `WITH CHECK: true`, but the `onAuthStateChange` listener may fire with a `SIGNED_IN` event before the profile is created, causing race conditions.

**Fix in `src/pages/JoinPage.tsx`:**
- Add better error handling: log the actual error from each step (vendor insert, signup, profile insert) to toast so the user sees what failed
- Handle the case where `authData.user` exists but `authData.session` is null (email confirmation required) — this is actually the expected flow, so the success screen should still show
- Ensure `skipProfileCheck` is properly managed in all error paths (currently some paths don't reset it in `finally`)
- Move `skipProfileCheck.current = false` into the `finally` block to prevent it staying stuck

### 2. Update Landing Page Subtitle

**File: `src/i18n/de.json`**
- Change `landing.heroSubtitle` to: `"Wir kartieren alle Outdoor-Verleiher in Deutschland. Kostenlos & ohne Vertrag."`

**File: `src/i18n/en.json`**
- Change `landing.heroSubtitle` to: `"We're mapping all outdoor rental shops in Germany. Free & no contract."`

### 3. Update Categories

Replace the current 6 categories with the 4 new ones across all files that define `CATEGORY_KEYS`:

New categories:
- `catClimbing` → "Kletterausrüstung" / "Climbing gear" 🧗
- `catSnowTouring` → "Schnee-Touren Ausrüstung" / "Snow touring gear" ❄️
- `catBikeBags` → "Fahrradtaschen" / "Bike bags" 🎒
- `catRoofTents` → "Dachzelte" / "Roof tents" ⛺

**Files to update:**
- `src/pages/JoinPage.tsx` — CATEGORY_KEYS array
- `src/pages/VendorProfilePage.tsx` — CATEGORY_KEYS array
- `src/pages/AdminCreateVendorPage.tsx` — CATEGORY_KEYS array (if it has one)
- `src/i18n/de.json` — replace `join.catTents`, `catSleepingBags`, etc. with new keys
- `src/i18n/en.json` — same

### 4. Add Website Link to Profile Page and Map Pin

**File: `src/pages/ProfilePage.tsx`**
- The website field already exists in the form. Add a clickable link display (like on VendorProfilePage) so the vendor can see/click their website URL.

**File: `src/pages/VendorMapPage.tsx`**
- Add `website` to the vendor query SELECT
- Show website link in the map pin popup (between category tags and the View Profile/Visit Shop links)

**File: `src/pages/VendorProfilePage.tsx`**
- Website link is already shown in the contact section — no change needed.

### Files Summary

| Action | File |
|--------|------|
| Edit | `src/pages/JoinPage.tsx` — fix registration error handling, update categories |
| Edit | `src/pages/VendorProfilePage.tsx` — update categories |
| Edit | `src/pages/AdminCreateVendorPage.tsx` — update categories |
| Edit | `src/pages/VendorMapPage.tsx` — add website to query + popup |
| Edit | `src/pages/ProfilePage.tsx` — add clickable website link |
| Edit | `src/i18n/de.json` — subtitle, new category keys |
| Edit | `src/i18n/en.json` — subtitle, new category keys |

