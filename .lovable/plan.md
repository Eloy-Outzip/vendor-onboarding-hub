

## Plan: Vendor Admin Dashboard

### Overview

Create a new `/admin/dashboard` page accessible to super admins, showing all vendors in a table with status indicators, quick actions (activate/deactivate), and direct links to editable profiles.

### 1. New page: `src/pages/AdminDashboardPage.tsx`

A table-based dashboard that:
- Fetches all vendors from the database (ordered by `created_at` desc)
- Displays columns: Name, City, Email, Status, Categories, Coordinates, Created, Actions
- Status shown as colored badges: `pending` (yellow), `products_submitted` (blue), `active` (green)
- **Activate button**: One-click to set `status = 'active'` (only shown for non-active vendors)
- **Deactivate button**: Set back to `pending`
- **Profile link**: Direct link to `/vendors/{slug}` where super admin can edit inline
- Search/filter input to quickly find vendors by name or city

### 2. Add route in `src/App.tsx`

```
/admin/dashboard → ProtectedRoute → AdminDashboardPage
```

### 3. Add link in `AdminSection` of `ProfilePage.tsx`

Add a "Vendor Dashboard" button alongside the existing "Create Vendor" link in the admin section.

### 4. Add i18n keys

Add translation keys to `en.json` and `de.json`:
- `admin.dashboard`, `admin.vendorDashboard`, `admin.activate`, `admin.deactivate`, `admin.statusPending`, `admin.statusActive`, `admin.statusProductsSubmitted`, `admin.searchVendors`

### Files Summary

| Action | File |
|--------|------|
| Create | `src/pages/AdminDashboardPage.tsx` |
| Edit | `src/App.tsx` — add route |
| Edit | `src/pages/ProfilePage.tsx` — add dashboard link in AdminSection |
| Edit | `src/i18n/en.json` — add admin dashboard keys |
| Edit | `src/i18n/de.json` — add admin dashboard keys |

