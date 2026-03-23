

## Transform the Root `/` Page into a Landing Page

### Problem
The root page (`/`) shows the bare "Welcome back" login form for non-authenticated users. It should be a proper landing page that introduces Outzip and funnels visitors to either sign up (`/join`) or log in.

### Solution
Replace the `LoginPage` component shown at `/` with a new landing page that reuses the same visual language as `/join` — navy hero, map banner, steps section — but focused on the customer value proposition with two clear CTAs: "Join now" and "Log in".

### Changes

**1. Create `src/pages/LandingPage.tsx`**
A new page combining:
- Navy hero with the Outzip logo header + language switcher (same as /join)
- Headline: "Outdoor Rental Map" / tagline about getting found by customers
- Map banner strip (reused from /join style)
- 3-step "How it works" section (reused from /join)
- Two CTA buttons: primary "Join now" → `/join`, secondary "Log in" → `/login`
- Footer (same as /join)

**2. Update `src/App.tsx`**
- Change `RootRedirect` to render `LandingPage` instead of `LoginPage` for unauthenticated users without profile
- Keep existing redirect logic for authenticated users (→ `/profile` or `/join`)

**3. Create `/login` route**
- Add a new route `/login` that renders the existing `LoginPage` component
- The login page stays as-is (simple email + magic link form)

**4. Add translation keys to `en.json` and `de.json`**
```
"landing": {
  "heroTitle": "Get visible to outdoor customers in your region",
  "heroSubtitle": "We're mapping all outdoor rental shops in Germany. Free listing, no contract.",
  "ctaJoin": "Join now",
  "ctaLogin": "Already registered? Log in"
}
```

### Flow after changes
```text
/ (Landing)  ──→  /join   (Sign up form)
             ──→  /login  (Magic link login)
/profile, /services, /products  (Protected, same as before)
```

