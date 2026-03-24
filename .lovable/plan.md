

## Update Email Site Name

Replace `"gear-signup"` with `"Outzip Rental Platform"` in two Edge Function files, then redeploy.

### Changes

**`supabase/functions/auth-email-hook/index.ts`** (line 49)
- Change `SITE_NAME = "gear-signup"` → `SITE_NAME = "Outzip Rental Platform"`

**`supabase/functions/notify-login/index.ts`** (line 9)
- Change `SITE_NAME = 'gear-signup'` → `SITE_NAME = 'Outzip Rental Platform'`

### Deployment
Redeploy both Edge Functions: `auth-email-hook` and `notify-login`.

