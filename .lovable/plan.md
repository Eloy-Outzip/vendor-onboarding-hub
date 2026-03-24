

## Fix: Confirmation Email Not Sent After Registration

### Root Cause
The `register-vendor` Edge Function creates auth users via `admin.createUser` and then calls `admin.generateLink({ type: "signup" })`. The `generateLink` API only generates and returns the link — it does **not** send an email or trigger the auth-email-hook. So the user is created but never receives a confirmation email.

### Fix Strategy
After `generateLink` returns the confirmation URL, manually render the signup email template and enqueue it via the existing email queue infrastructure (same approach as `auth-email-hook`).

### File: `supabase/functions/register-vendor/index.ts`

After the `generateLink` call (line 164-170):
1. Extract the confirmation URL from the `generateLink` response (`data.properties.action_link`)
2. Import and render the signup email template from `_shared/email-templates/signup.tsx`
3. Enqueue the rendered email to the `auth_emails` pgmq queue via `supabase.rpc('enqueue_email', ...)`
4. Log it to `email_send_log` as `pending`

This reuses the same branded email templates and queue infrastructure already in place.

**Also apply the same fix for the "repaired" path** (Case C, around line 118) — currently repaired accounts also don't receive a confirmation email. Generate a link + send email for those too.

### Dependencies
The function will need React + react-email imports (same as auth-email-hook) to render the template. Since this adds complexity, an alternative simpler approach:

**Simpler alternative**: Instead of rendering templates in `register-vendor`, use `admin.inviteUserByEmail()` which **does** trigger the auth-email-hook (with action_type `invite`). This requires:
- Replacing `admin.createUser` + `admin.generateLink` with `admin.inviteUserByEmail`
- The invite template already exists and works
- No rendering code needed in `register-vendor`

### Recommended approach: Use `inviteUserByEmail`

Replace lines 143-170 (Case A) with:
```typescript
const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
  normalizedEmail,
  {
    data: { locale: locale || "de" },
    redirectTo: `${origin}/login`,
  }
);
```

This triggers the auth-email-hook → renders the invite email → enqueues it → email is sent.

For Case C (repaired accounts, line 118), also generate and send an invite/magic-link so the user can log in.

### Files

| Action | File |
|--------|------|
| Edit | `supabase/functions/register-vendor/index.ts` — use `inviteUserByEmail` instead of `createUser` + `generateLink` |
| Redeploy | `register-vendor` Edge Function |

### Also: Re-send for existing registration
After the fix is deployed, we can manually re-trigger the invite for `eloy@outzip.de` so you receive the email without re-registering.

