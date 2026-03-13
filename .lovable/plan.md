

## Fix: Auth race condition causes constant redirect to /join

### Root cause

The `AuthContext` has a destructive race condition: when `supabase.auth.signUp()` is called during the Join flow, it fires an `onAuthStateChange` event with `SIGNED_IN` **before** the profile row is inserted (step 3 of the signup sequence). The `onAuthStateChange` handler then calls `checkProfile()`, finds no profile, and immediately calls `signOut()` — destroying the session that was just created.

This means:
- New signups get signed out immediately after account creation
- The user lands on /welcome but has no session
- Clicking "Go to my profile" hits ProtectedRoute → redirects to /join
- All protected routes redirect to /join forever

### Fix

**`src/contexts/AuthContext.tsx`** — Add a skip flag for the orphan check during signup:
- Export a `skipProfileCheck` ref that JoinPage can set to `true` before calling `signUp()`
- In `onAuthStateChange`, when `skipProfileCheck` is true, accept the session without querying profiles
- JoinPage sets it back to `false` after the profile row is inserted
- Also: don't sign out on `checkProfile` query errors (treat errors as "unknown" not "orphan")

**`src/pages/JoinPage.tsx`** — Use the skip flag:
- Set `skipProfileCheck.current = true` before `signUp()`
- After profile insert succeeds, set it back to `false`
- This prevents the auth listener from destroying the session mid-signup

**`src/contexts/AuthContext.tsx`** — Additional hardening:
- Only call `signOut()` for orphan detection on `INITIAL_SESSION` event, not on every `SIGNED_IN`
- On `SIGNED_IN` without a profile, set `hasProfile = false` but do NOT sign out (the user might be mid-signup)
- On `INITIAL_SESSION` (app cold start), if no profile found → sign out orphan

### Files to change
- `src/contexts/AuthContext.tsx` — Add skip flag, differentiate event types
- `src/pages/JoinPage.tsx` — Set/unset skip flag around signup flow

