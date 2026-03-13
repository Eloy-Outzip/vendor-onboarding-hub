

## Fix: Blank page on /profile redirect

### Root cause

Two issues combine to produce the blank page:

1. **AuthContext race condition**: `onAuthStateChange` is set up before `getSession` is called. Per Supabase best practices, `getSession` should run first to establish the initial state, and `onAuthStateChange` should only handle subsequent changes. With a stale/expired token, the auth listener may fire with a session object that's actually invalid.

2. **ProfilePage silent failure**: If queries fail (due to invalid session or missing profile), `loading` stays `true` forever — the `load()` function has no error handling, so the page shows "Loading..." indefinitely (which appears blank).

### Changes

**1. `src/contexts/AuthContext.tsx`** — Fix initialization order:
- Call `getSession()` first to set initial state
- Set up `onAuthStateChange` to handle only subsequent changes
- Handle errors from `getSession` (clear session, set loading=false)

**2. `src/pages/ProfilePage.tsx`** — Add error handling:
- Wrap the `load()` function in try/catch
- Always set `loading = false` in a finally block
- If profile query fails or returns no vendor, show a meaningful fallback instead of hanging

**3. `src/components/ProtectedRoute.tsx`** — Add sign-out fallback:
- If user exists but session is expired/invalid, sign out and redirect to /join

These three changes ensure:
- Expired/stale sessions are detected and cleared
- ProfilePage never hangs in a loading state
- Users always see either content or a redirect, never a blank page

