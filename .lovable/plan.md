

## Plan: Fix Admin Redirect Priority

### Problem
In `RootRedirect` (App.tsx line 33) and `LoginPage.tsx`, `hasProfile` is checked **before** `isAdmin`. When your account has both a `vendor_id` and `is_super_admin = true`, `hasProfile` evaluates to `true` first, so you always get sent to `/profile` — the `isAdmin` check on the next line is never reached.

### Fix
Swap the order: check `isAdmin` before `hasProfile` in two places.

**1. `src/App.tsx` — RootRedirect**
Change the redirect priority so admins go to `/admin/dashboard` even if they also have a vendor profile:
```typescript
if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
if (hasProfile) return <Navigate to="/profile" replace />;
```

**2. `src/pages/LoginPage.tsx` — useEffect redirect**
Same swap: check `isAdmin` first:
```typescript
if (!loading && isAdmin) navigate("/admin/dashboard", { replace: true });
else if (!loading && hasProfile) navigate("/profile", { replace: true });
```

No database or schema changes needed. Two lines swapped in two files.

