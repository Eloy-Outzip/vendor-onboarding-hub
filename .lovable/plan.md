
Goal: enforce a clean app-entry rule:
- Not logged in → /join
- Logged in with a valid vendor profile → /profile
- Logged in but no vendor profile (orphan account) → treat as not logged in and send to /join

What I found
- Root redirect and /join redirect currently depend on `user` only.
- Returning magic-link login currently allows auto user creation (default behavior), which can create authenticated users without a profile/vendor mapping.
- Backend data confirms this state: auth users exist, but `public.profiles` and `public.vendors` are empty, so redirecting authenticated users to `/profile` leads to “No vendor profile found.”

Implementation plan
1) Centralize app-auth state in `AuthContext`
- Extend context with a profile-linked auth flag (e.g. `isAppUser` / `hasVendorProfile`) plus loading state.
- On initial session load and auth state changes:
  - if no session/user → unauthenticated
  - if session exists → query `profiles` for `id = user.id` and require a non-null `vendor_id`
  - if profile/vendor link is missing → sign out and reset to unauthenticated state
- Keep one source of truth so all routes behave consistently.

2) Fix route entry logic in `App.tsx`
- `RootRedirect` should navigate to `/profile` only when auth is ready and user is profile-linked.
- Otherwise navigate to `/join`.
- Keep a loading guard while auth/profile check is in progress.

3) Fix `/join` redirect behavior
- In `JoinPage`, redirect to `/profile` only for profile-linked users (not just `user !== null`).
- This prevents bounce-to-profile for orphan sessions.

4) Harden returning magic-link flow
- In `JoinPage` `signInWithOtp`, set `shouldCreateUser: false` for “returning vendor” login.
- This prevents creation of new auth-only users from the returning-login section.
- Add clear localized error message for “account not found” (EN/DE) and keep user on `/join`.

5) Add defensive fallback on protected access
- In `ProtectedRoute`, require both auth session and profile-linked state.
- If not satisfied, redirect to `/join` (and sign out if needed), avoiding blank/no-vendor dead ends.

Technical details
- Files to update:
  - `src/contexts/AuthContext.tsx`
  - `src/App.tsx`
  - `src/pages/JoinPage.tsx`
  - `src/components/ProtectedRoute.tsx`
  - `src/i18n/en.json`, `src/i18n/de.json` (new message key for non-existing returning account)
- No DB migration required for this fix.
- This follows best practice: app authorization should be based on valid app identity linkage (auth user + domain profile), not auth token presence alone.

Validation checklist
- Logged out, open `/` → lands on `/join`.
- Logged in with valid profile/vendor, open `/` → lands on `/profile`.
- Returning magic-link with unknown email → no account created, stay on `/join` with helpful error.
- Existing orphan session (auth user without profile) → auto-signed out and returned to `/join`.
