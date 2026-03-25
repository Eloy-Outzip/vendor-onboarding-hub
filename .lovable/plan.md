

## Plan: Grant Super Admin to eloy@outzip.de

### Current State
- **kai@outzip.de** — already `is_super_admin = true` ✓
- **eloy@outzip.de** — currently `is_super_admin = false`, needs update

### Change
Run a single data update on the `profiles` table:
```sql
UPDATE profiles SET is_super_admin = true WHERE id = '19a1449d-74c6-4c9f-a856-6d243626864e';
```

No code or schema changes needed.

