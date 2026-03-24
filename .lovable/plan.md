

## Add Categories Display + Admin Vendor Creation

### 1. Fix Categories Display on Vendor Profile Page

Currently, categories are stored as keys (e.g., `"catTents"`) but displayed raw. Need to translate them using the same `t()` function with `join.catTents` etc.

**File: `src/pages/VendorProfilePage.tsx`**
- In the categories section, replace `{c}` with `{t("join." + c)}` to show translated labels
- Add category editing in edit mode: show the same checkbox list from JoinPage (reuse `CATEGORY_KEYS`) so categories can be toggled
- Include `categories` in the `handleSave` update payload
- Show categories section even when empty in edit mode (so they can be added)

### 2. Add "Create Vendor" Page for Super Admins

**Create: `src/pages/AdminCreateVendorPage.tsx`**
- Protected page accessible only to super admins
- Form with all vendor fields: first_name, name, email, phone, website, address, city, country, categories (checkboxes), marketplace_url, logo_url, lat, lng, status (dropdown: pending/active), description
- On submit: insert into `vendors` table
- After creation, navigate to `/vendors/:newId`

**File: `src/App.tsx`**
- Add route `/admin/create-vendor` wrapped in `ProtectedRoute`

**File: `src/pages/ProfilePage.tsx`**
- Add a "Create Vendor" button in the super admin section (next to the embed snippet)

### 3. Database: Update RLS for Super Admin Updates

Currently the vendors UPDATE policy only allows owners. Super admins need to update any vendor.

**Migration**: Add a new UPDATE policy for super admins:
```sql
CREATE POLICY "Super admins can update any vendor"
ON public.vendors FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true));
```

### 4. Translation Keys

Add to `en.json` and `de.json`:
```
"admin": {
  "createVendor": "Create Vendor",
  "vendorCreated": "Vendor created successfully"
}
```

### Files Summary

| Action | File |
|--------|------|
| Edit | `src/pages/VendorProfilePage.tsx` — translate category keys, add category editing |
| Create | `src/pages/AdminCreateVendorPage.tsx` — full vendor creation form |
| Edit | `src/App.tsx` — add admin route |
| Edit | `src/pages/ProfilePage.tsx` — add "Create Vendor" button for admins |
| Migration | Super admin UPDATE policy on vendors |
| Edit | `src/i18n/en.json`, `src/i18n/de.json` — admin keys |

