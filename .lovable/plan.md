

## Add Logo Upload for Vendor Shops

### What
Replace the text-based `logo_url` input with a proper file upload using cloud storage. Logos are uploaded to a storage bucket and the resulting public URL is saved to `vendors.logo_url`.

### Storage Setup (Migration)

1. Create a public `vendor-logos` storage bucket
2. Add RLS policies:
   - **SELECT**: Anyone can read (public logos)
   - **INSERT**: Authenticated users can upload
   - **UPDATE/DELETE**: Authenticated users can manage their own uploads

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('vendor-logos', 'vendor-logos', true);

CREATE POLICY "Anyone can view vendor logos" ON storage.objects FOR SELECT USING (bucket_id = 'vendor-logos');
CREATE POLICY "Authenticated users can upload logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vendor-logos');
CREATE POLICY "Authenticated users can update logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'vendor-logos');
CREATE POLICY "Authenticated users can delete logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vendor-logos');
```

### Logo Upload Component

**Create: `src/components/LogoUpload.tsx`**

A reusable component that:
- Shows current logo preview (or placeholder)
- File input accepting `image/png, image/jpeg, image/webp` only
- Max file size: 2MB (client-side validation)
- On upload: uploads to `vendor-logos/{vendorId}.{ext}` via Supabase Storage SDK
- Returns the public URL to parent via `onUpload(url)` callback
- Shows loading spinner during upload
- Displays size/format error messages via toast

### Integration Points

**`src/pages/AdminCreateVendorPage.tsx`**
- Replace the `logo_url` text input (line 168-171) with `<LogoUpload>` component
- After upload completes, set `form.logo_url` to the returned public URL

**`src/pages/VendorProfilePage.tsx`**
- In edit mode, replace the `logo_url` text input (line 239-240) with `<LogoUpload>`
- Pass current `form.logo_url` as initial preview
- On upload, update `form.logo_url`

### Files Summary

| Action | File |
|--------|------|
| Migration | Create `vendor-logos` bucket + RLS policies |
| Create | `src/components/LogoUpload.tsx` |
| Edit | `src/pages/AdminCreateVendorPage.tsx` — swap text input for upload |
| Edit | `src/pages/VendorProfilePage.tsx` — swap text input for upload in edit mode |

