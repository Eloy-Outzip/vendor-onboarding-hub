

## Fix: Redirect issues + Add proper Login page

### Problem 1: Why you see /join instead of /profile
Your published site browser likely has an active session for one of the 3 **orphan accounts** (test@outzim.de, orders@outzip.de, test@ouf.com) — auth users with no profile record. The app correctly detects these as orphans and signs them out, landing you on /join. Your actual account (eloy@outzip.de) does have a valid profile, but you need to log in with that specific account.

### Problem 2: No login page
Currently the app has no dedicated login page — returning vendors must scroll to the bottom of /join to find the magic link section. This is confusing.

### Plan

**New page structure:**

```text
/           → Landing page (login form for returning vendors)
/join       → New vendor signup form (unchanged)
/welcome    → Post-signup confirmation (unchanged)
/profile    → Protected dashboard (unchanged)
/services   → Protected (unchanged)
/products   → Protected (unchanged)
```

**Changes:**

1. **Create `src/pages/LoginPage.tsx`** — New landing/login page:
   - Clean UI with app branding
   - Magic link email input (moved from bottom of JoinPage)
   - "New vendor? Join here" link to /join
   - This becomes the default route at `/`

2. **Update `src/pages/JoinPage.tsx`**:
   - Remove the "Returning vendor" magic link section at the bottom
   - Add a "Already have an account? Log in" link back to `/`

3. **Update `src/App.tsx`**:
   - Route `/` → `LoginPage` (if not logged in) or redirect to `/profile` (if logged in with profile)
   - Update `RootRedirect` logic accordingly

4. **Update `src/i18n/en.json` and `src/i18n/de.json`**:
   - Add translation keys for the login page

5. **Clean up orphan accounts** (optional but recommended):
   - The 3 orphan auth users (test@outzim.de, orders@outzip.de, test@ouf.com) could be removed to prevent confusion

### Files to create/modify
- **Create**: `src/pages/LoginPage.tsx`
- **Modify**: `src/App.tsx`, `src/pages/JoinPage.tsx`, `src/i18n/en.json`, `src/i18n/de.json`

