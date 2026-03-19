

## Fix: Wire /services Page to vendors.categories Column

### Problem
`ServicesPage.tsx` reads/writes to a `categories` table that was deleted. The `as any` casts suppress TypeScript errors, but all inserts/deletes silently fail. No service data is being saved.

### Solution
Rewrite `ServicesPage.tsx` to read and write the `categories` text array on the `vendors` table instead.

### Changes (single file: `src/pages/ServicesPage.tsx`)

1. **Load**: Fetch the vendor's `categories` array from the `vendors` table using the user's `vendor_id` from their profile
2. **Add category**: Update the vendor row by appending to the `categories` array
3. **Remove category**: Update the vendor row by filtering out the removed category
4. **State**: Replace the `Category[]` state with a simple `string[]` since categories are now just strings, not separate rows with IDs

### Technical approach
```typescript
// Load
const { data: vendor } = await supabase
  .from("vendors").select("categories").eq("id", vid).single();
setCategories(vendor?.categories || []);

// Add
await supabase.from("vendors")
  .update({ categories: [...categories, name] })
  .eq("id", vendorId);

// Remove
await supabase.from("vendors")
  .update({ categories: categories.filter(c => c !== name) })
  .eq("id", vendorId);
```

No database migration needed — the `vendors.categories` column already exists.

