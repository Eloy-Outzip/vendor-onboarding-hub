

## Plan: Admin-Only Access Without Vendor Profile

### Problem
The auth system treats users without a `vendor_id` as orphans and signs them out. This means admins must also be vendors to access the app. We need to decouple admin access from vendor profiles.

### Changes

**1. Update AuthContext to recognize admins** (`src/contexts/AuthContext.tsx`)
- Modify `checkProfile()` to also fetch `is_super_admin` alongside `vendor_id`
- Add `isAdmin` to the context state
- Users with `is_super_admin = true` should NOT be signed out as orphans, even if they lack a `vendor_id`
- Expose `isAdmin` in the context type

**2. Update ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
- Allow access if user `hasProfile` OR `isAdmin`
- Admins without a vendor profile skip the `/join` redirect

**3. Update RootRedirect in App.tsx** (`src/App.tsx`)
- Admins without a vendor profile redirect to `/admin/dashboard` instead of `/join`

**4. Update LoginPage** (`src/pages/LoginPage.tsx`)
- After login, admins without a profile redirect to `/admin/dashboard` instead of `/profile`

**5. Update AdminDashboardPage** (`src/pages/AdminDashboardPage.tsx`)
- Remove the `is_super_admin` re-check from the page (already known from context)
- Use `isAdmin` from AuthContext directly

**6. Update ProfilePage admin section** (`src/pages/ProfilePage.tsx`)
- Use `isAdmin` from context instead of re-querying

**7. Database: Remove kai's vendor record**
- Delete the vendor row linked to kai@outzip.de
- Clear `vendor_id` on kai's profile (keep `is_super_admin = true`)

### Data Flow After Changes

```text
Login → AuthContext fetches profile (vendor_id + is_super_admin)
  ├─ has vendor_id → hasProfile=true, redirect to /profile
  ├─ is_super_admin (no vendor) → isAdmin=true, redirect to /admin/dashboard
  └─ neither → orphan, sign out
```

### Files Modified
| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Add `isAdmin` state, fetch `is_super_admin`, skip orphan signout for admins |
| `src/components/ProtectedRoute.tsx` | Allow admins without vendor profile |
| `src/App.tsx` | Admin-aware root redirect |
| `src/pages/LoginPage.tsx` | Admin-aware post-login redirect |
| `src/pages/AdminDashboardPage.tsx` | Use `isAdmin` from context |
| `src/pages/ProfilePage.tsx` | Use `isAdmin` from context |
| Database | Clear kai's vendor_id, delete orphaned vendor row |

