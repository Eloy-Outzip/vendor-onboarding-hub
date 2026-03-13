

## Problem

The `/profile`, `/services`, and `/products-upload` pages have full content, but they are behind `ProtectedRoute` which redirects to `/join` when there is no active session. The `/join` page only handles new signups -- there is no way for a returning vendor to log in. Once a vendor confirms their email and their session expires, they are permanently locked out.

## Solution

Add a **magic link login** section to the `/join` page so returning vendors can authenticate and access the protected pages.

## Changes

### 1. Update `src/pages/JoinPage.tsx`

Add a "Returning vendor?" section below the signup form:

- Email input + "Send login link" button
- Calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: origin + '/profile' } })`
- On success: show message "Check your email for a login link"
- On error: show toast with error
- Visually separated from the signup form with a divider and "Already registered?" label

### 2. No other changes needed

- `AuthContext` already picks up sessions from `onAuthStateChange`, so when a user clicks the magic link and lands on `/profile`, authentication is handled automatically
- All three protected pages (`ProfilePage`, `ServicesPage`, `ProductsUploadPage`) already have complete UI and logic
- Routing and `ProtectedRoute` work correctly

