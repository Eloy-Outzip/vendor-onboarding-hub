

## Fix Category Storage in Vendors Table

### Problem
Categories are currently stored using **translated display labels** (e.g., "Zelte" in German, "Tents" in English). If a user registers in English, categories are saved as "Tents", but if in German, as "Zelte". This makes data inconsistent.

All other fields (shopName, city, website, email) are already correctly saved to the vendors table.

### Solution
Store category **keys** (e.g., `"catTents"`, `"catSleepingBags"`) instead of translated labels. This ensures consistent data regardless of language.

### File: `src/pages/JoinPage.tsx`

1. Change `toggleCategory` to use the category **key** instead of the translated label
2. Update the checkbox `checked` to compare against keys
3. Update the insert to send keys as the categories array

This is a small change — roughly 3 lines modified in the toggle/checkbox logic.

### No database changes needed
The `vendors.categories` column is already a text array and will accept keys just as well as labels.

