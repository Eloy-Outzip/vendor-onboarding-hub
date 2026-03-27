

## Plan: Fix Tab-Switch Causing Page Reload

### Root Cause

In `AuthContext.tsx`, the `onAuthStateChange` handler runs a full profile re-check on **every** auth event, including `TOKEN_REFRESHED` (triggered when switching browser tabs). This resets `loading` state and causes all `ProtectedRoute`-wrapped pages to unmount and remount, losing form data.

### Fix

**File: `src/contexts/AuthContext.tsx`** — In the `onAuthStateChange` callback, short-circuit `TOKEN_REFRESHED` events: just update `session` and `user` refs without re-checking the profile or toggling `loading`.

```typescript
// For token refreshes (tab switch), just update session — no profile re-check
if (event === "TOKEN_REFRESHED") {
  setSession(session);
  setUser(session.user);
  return;
}
```

This single change prevents the full re-initialization cycle on tab switches, preserving component state and form data across all pages.

