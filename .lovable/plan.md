

## Fix: Products Section Incorrectly Marked as Done

### Problem
The products completion check uses `vendor.status` only:
```tsx
const step3Done = ["products_submitted", "active"].includes(vendor.status);
```
This means any vendor with status `"active"` shows products as done, even if they have zero products. In the editor preview, the hardcoded vendor has `status: "active"`, so it always appears complete.

### Solution
Change the check to require **both** the correct status **and** at least one product:

```tsx
const step3Done = ["products_submitted", "active"].includes(vendor.status) && products.length > 0;
```

Also update the preview mock to use `status: "pending"` so the editor preview shows realistic incomplete state.

### File: `src/pages/ProfilePage.tsx`
- Line ~104: Update `step3Done` logic
- Line ~47: Change preview mock status from `"active"` to `"pending"`

