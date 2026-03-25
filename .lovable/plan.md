

## Fix: Vendor Not Showing on Map + Remove Logo Feature

### 1. Map Pin Not Showing — Root Cause

The map query at `VendorMapPage.tsx` line 59 filters `.eq("status", "active")`. Your vendor likely has `status = 'pending'` (the default). The vendor was never activated. Two options:

**Option A (recommended):** Update your vendor's status to `active` in the database.

**Option B:** Also show `pending` vendors on the map (less likely what you want).

**Fix:** Run a data update to set the Outzip vendor status to `active`. Also, consider adding a way for vendors to self-activate or for admins to activate vendors.

### 2. Remove Logo Capability Everywhere

Delete `src/components/LogoUpload.tsx` and remove all logo references from:

**`src/pages/VendorProfilePage.tsx`:**
- Remove `import LogoUpload`
- Remove `logo_url` from Vendor interface, form state, `handleSave` update, and the logo display/upload UI sections
- Remove the logo image / initial letter avatar from the header — replace with just the vendor name

**`src/pages/AdminCreateVendorPage.tsx`:**
- Remove `import LogoUpload`
- Remove `logo_url` from form state, insert payload, and the LogoUpload form field

**`src/i18n/en.json` + `de.json`:**
- Remove `vendorProfile.logoUrl` translation key

### Files Summary

| Action | File |
|--------|------|
| Data update | Set vendor status to `active` for Outzip |
| Delete | `src/components/LogoUpload.tsx` |
| Edit | `src/pages/VendorProfilePage.tsx` — remove all logo references |
| Edit | `src/pages/AdminCreateVendorPage.tsx` — remove all logo references |
| Edit | `src/i18n/en.json` — remove logoUrl key |
| Edit | `src/i18n/de.json` — remove logoUrl key |

