

## Fix: Infinite "Loading" After Clicking Confirmation Email Link

### Root Cause

In `AuthContext.tsx`, the `onAuthStateChange` handler sets `loading = true` (line 105) before calling `checkProfile`. If anything goes wrong during that async check — an uncaught exception, a network timeout, or a race condition between `init()` and `onAuthStateChange` both setting `loading` — there is no safety net. `loading` stays `true` forever, and the page shows "Laden..." indefinitely.

Additionally, the invite flow fires `onAuthStateChange` with a session, and `init()` may also pick up the session from `getSession()`, creating a race where both concurrently set `loading = true` and call `checkProfile`.

### Fix: `src/contexts/AuthContext.tsx`

1. **Wrap `checkProfile` calls in try/catch** in both `init()` and `onAuthStateChange` — if anything throws, default to `loading = false` so the app doesn't freeze.

2. **Add a loading timeout safety net** — if `loading` remains `true` for more than 10 seconds, force it to `false`. This prevents infinite loading from any edge case.

3. **Deduplicate concurrent profile checks** — use a simple flag to skip the `onAuthStateChange` profile check if `init()` is already running one for the same user, preventing the race condition.

4. **Handle invite token type explicitly** — after `checkProfile` succeeds, if the user has a valid profile, redirect them regardless of the auth event type (`SIGNED_IN`, `INITIAL_SESSION`, or invite/recovery flows).

### Changes Summary

| Action | File |
|--------|------|
| Edit | `src/contexts/AuthContext.tsx` — add try/catch, loading timeout, deduplicate checks |

