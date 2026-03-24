
## Registration bug: root cause and fix plan

### What’s actually broken
I do know what the issue is.

The failure is not the form UI itself — it’s the onboarding sequence on `/join`:

- Auth logs show `user_repeated_signup` for `orders@outzip.de`
- The database already contains several `vendors` rows for that email
- There is no matching `profiles` row for that auth user

That means the current flow is creating the vendor first, then calling `auth.signUp()`, and when the email already exists the auth system returns a duplicate-signup response instead of a normal new user. The code then tries to create a profile anyway, fails, and shows the generic “Kontoerstellung fehlgeschlagen” toast. Each retry creates another orphan `vendors` row.

### Implementation plan

### 1. Move `/join` registration logic out of the page and into a backend function
Create a backend registration function (for example `register-vendor`) and have `JoinPage` call that instead of directly chaining:
- insert vendor
- sign up auth user
- insert profile

Why:
- the client cannot safely detect duplicate signups
- the backend can check auth users and repair broken onboarding states cleanly

### 2. Make registration idempotent by email
In the backend function:

- Normalize the email
- Check whether an auth user already exists for that email
- Check whether a profile already exists for that auth user
- Check whether a pending vendor row already exists for that email

Then handle these cases explicitly:

#### Case A — brand new email
- create auth user
- create vendor
- create profile linked to vendor
- return success

#### Case B — auth user exists and profile already exists
- do not create another vendor
- return a typed response like `account_exists`
- frontend shows a clear message: “This email already has an account. Please use the login link.”

#### Case C — auth user exists but profile is missing
This is the broken state the user is hitting now.

- reuse the existing auth user
- reuse the newest pending vendor for that email, or create/update exactly one vendor row
- create the missing profile
- return success instead of failing

This repairs previously broken registrations.

### 3. Stop creating duplicate vendor rows
Update the flow so vendor creation only happens after the auth state is understood.

If a vendor row already exists for the same email in a pending/unlinked state:
- update/reuse it instead of inserting a new one

This prevents the repeated orphan rows already visible in the database.

### 4. Improve the `/join` error handling
Update `src/pages/JoinPage.tsx` to handle typed backend responses instead of always showing the generic account error.

Planned UX:
- `success` → show current success card
- `account_exists` → show helpful message + link user to `/login`
- `validation_error` → show specific field-level or toast error
- unexpected failure → fallback generic error

Also keep `skipProfileCheck` only for the actual success path and avoid relying on it for duplicate-email handling.

### 5. Add a small login recovery path
If the backend returns `account_exists`, optionally navigate to:
```text
/login?email=orders@outzip.de
```
and prefill the login field there.

That gives existing vendors a clean next step instead of a dead end.

### 6. Clean up current broken data
There are already multiple pending vendor rows for the same email. After the code fix:
- keep one canonical pending vendor row per affected email
- remove or ignore the extras

This is a one-time cleanup step so the repaired account points to a single vendor record.

## Files likely involved
- `src/pages/JoinPage.tsx`
- `src/pages/LoginPage.tsx` (optional email prefill)
- `src/contexts/AuthContext.tsx` (only if minor recovery handling is needed)
- `supabase/functions/register-vendor/index.ts` (new)
- `src/i18n/de.json`
- `src/i18n/en.json`

## Result after the fix
A vendor will be able to submit `/join` successfully even if:
- the email is brand new
- the email already has a completed account
- the email got stuck earlier in a half-created auth/no-profile state

Most importantly, retrying registration will no longer create duplicate vendor rows and no longer end in the current generic failure toast.

## QA to run after implementation
1. Register with a brand new email → success
2. Register again with the same fully linked email → clear “use login” message
3. Register with a previously broken email (existing auth user, no profile) → profile gets repaired and succeeds
4. Confirm no extra vendor rows are created on repeated attempts
5. Test `/login` afterwards to confirm the recovered vendor can access `/profile`
