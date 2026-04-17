

## Plan: Fix Marketplace URL & Auth Loop Issues

### Issue 1 — Marketplace URL Adds `app.outzip.de/...` Prefix

**Root cause:** When a vendor pastes `outzip.de/shop` (no `https://`), the value is stored as-is. When rendered with `<a href={vendor.marketplace_url}>`, the browser treats it as a *relative* path and prepends the current page origin (`https://app.outzip.de/`), producing the broken `app.outzip.de/outzip.de/shop` link.

The same `formatUrl()` helper already used for `website` fields must be applied to `marketplace_url` everywhere it's rendered as an `href`.

**Fixes:**
- `src/pages/VendorProfilePage.tsx` — wrap `vendor.marketplace_url` in `formatUrl()` on the "Visit Shop" button (line 259).
- `src/pages/VendorMapPage.tsx` — add a `formatUrl` helper and wrap `v.marketplace_url` in the directory list (line 167) and any popup/marker references.
- `src/pages/LandingPage.tsx`, `src/pages/AdminDashboardPage.tsx` — verify and apply `formatUrl()` if `marketplace_url` is rendered as an href anywhere.
- One-time DB cleanup migration: for any existing vendor row where `marketplace_url` is non-null and lacks `http://` / `https://`, prepend `https://`.

The input field stays unchanged — users paste freely, and we only normalize at render time + once in storage.

---

### Issue 2 — Auth Stuck in Loading on Refocus / Navigation

**Root cause (two bugs in `src/contexts/AuthContext.tsx`):**

1. **`INITIAL_SESSION` race**: The SDK fires `INITIAL_SESSION` *before* `init()`'s `await getSession()` resolves. At that moment `initializedRef.current === false` and `checkingRef.current === true`, so the handler hits the early `return` at line 151 — **never setting `loading=false`**. The page hangs until the 10s safety timeout or a manual reload.

2. **Tab refocus loop**: When the browser tab regains focus, Supabase re-emits auth events (`SIGNED_IN` or `INITIAL_SESSION`). The current handler calls `setLoading(true)` and re-runs `checkProfile()`, which blanks the entire UI and **wipes any in-progress form state** (e.g. the new-vendor form on `/admin/create-vendor`).

**Fix in `AuthContext.tsx`:**

- Treat the FIRST `INITIAL_SESSION` event as the source of truth and let `init()` simply listen for it (or coordinate via the `initializedRef`):
  - When `INITIAL_SESSION` arrives, mark `initializedRef = true`, run profile check, then `setLoading(false)`. Make `init()` a no-op if `INITIAL_SESSION` already handled it (or remove `init()` entirely and rely on `INITIAL_SESSION` — simpler and matches Supabase's recommended pattern).
- For all subsequent events (`SIGNED_IN` after refocus, `TOKEN_REFRESHED`, `USER_UPDATED`), update `session`/`user` **without** toggling `loading` and **without** re-running `checkProfile` (profile state stays cached for the session).
- Only re-check profile when `event === "SIGNED_IN"` AND the user ID actually changed (real new login), or `event === "SIGNED_OUT"`.
- Never `await` heavy work inside the `onAuthStateChange` callback — wrap `checkProfile` in a `setTimeout(..., 0)` or fire-and-forget pattern to prevent blocking the auth event queue (per Supabase best practice).

**Result:**
- Initial load resolves once, deterministically.
- Tab refocus / navigation no longer triggers a loading screen.
- In-progress form state on `/admin/create-vendor` (and elsewhere) is preserved.

---

### Files Modified

| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Single-source-of-truth INITIAL_SESSION handling; no loading toggle on refocus; no awaits in callback |
| `src/pages/VendorProfilePage.tsx` | Apply `formatUrl()` to marketplace_url href |
| `src/pages/VendorMapPage.tsx` | Add + apply `formatUrl()` for marketplace_url and website hrefs |
| `src/pages/LandingPage.tsx` | Apply `formatUrl()` if marketplace_url rendered as href |
| `src/pages/AdminDashboardPage.tsx` | Apply `formatUrl()` if marketplace_url rendered as href |
| Database migration | Backfill: prepend `https://` to existing `vendors.marketplace_url` values missing a protocol |

