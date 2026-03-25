

## Plan: Super Admin for Kai, Edit Button on Dashboard, Activation Email

### 1. Grant super admin to kai@outzip.de

Run a SQL update to set `is_super_admin = true` on the profiles row where `email = 'kai@outzip.de'`.

### 2. Add Edit button to Admin Dashboard

In `AdminDashboardPage.tsx`, add a `Pencil` icon button next to the existing `ExternalLink` button in each vendor row. This button links to `/vendors/{slug || id}` — the same vendor profile page but signals edit intent. Since the profile page already supports inline editing for super admins (via the `canEdit` check), linking directly there is sufficient. We can add an `?edit=true` query param so the profile page auto-opens in edit mode.

**Files:** `src/pages/AdminDashboardPage.tsx` (add Pencil button), `src/pages/VendorProfilePage.tsx` (read `?edit=true` query param to auto-enter edit mode)

### 3. Send automated email when vendor is activated

This requires transactional email infrastructure. The project already has auth email infrastructure (auth-email-hook, process-email-queue) but does NOT have transactional email scaffolding (no `send-transactional-email` function, no `transactional-email-templates` folder).

**Steps:**
1. Check email domain status
2. Set up email infrastructure (if needed) and scaffold transactional email support
3. Create an "activation" email template in `_shared/transactional-email-templates/`
4. Deploy the edge functions
5. Update `updateStatus` in `AdminDashboardPage.tsx` to invoke `send-transactional-email` when setting status to `active`

**Template content:** A branded email telling the vendor their profile is now live on the Outzip map, with a link to their profile.

### Files Summary

| Action | File |
|--------|------|
| Data update | Set `is_super_admin = true` for kai@outzip.de |
| Edit | `src/pages/AdminDashboardPage.tsx` — add edit (Pencil) button, send activation email on status change |
| Edit | `src/pages/VendorProfilePage.tsx` — auto-enter edit mode from `?edit=true` |
| Create | Transactional email template for vendor activation |
| Deploy | Edge functions (send-transactional-email, handle-email-unsubscribe, handle-email-suppression) |
| Create | Unsubscribe page |
| Edit | `src/i18n/en.json` + `de.json` — add edit/activation keys |

