

## Redesign /join Page — Outzip Partner Landing Page

### Overview
Transform the current plain registration form into a branded, conversion-optimized landing page with the Outzip identity: navy hero, trust pills, category checkboxes, and a success state.

### Design System Updates

**`src/index.css`** — Add custom CSS variables for the new brand colors:
- Navy: `#0F2A38` (background hero)
- Orange: `#F56A00` (already primary)
- Lime: `#E2E71B` (accents, success state)
- Cream: `#F4F2EC` (page background)

**`tailwind.config.ts`** — Add named colors: `navy`, `lime`, `cream` for easy use in Tailwind classes.

### Page Structure (`src/pages/JoinPage.tsx`)

Complete redesign with these sections:

1. **Top bar** — Outzip logo/text left, "Outdoor-Verleih Karte · 2025" right. Simple, minimal.

2. **Hero section** — Full-width navy background. Large headline + subline. Below: a stylized SVG map strip with location pins, one pulsing lime pin with "Du könntest hier sein" label. CSS animation for the pulse.

3. **Trust pills row** — 4 horizontal pills: 🗺️ Kostenloser Eintrag · ✉️ Kein Newsletter · 🔒 Kein Vertrag · 🙋 Du entscheidest

4. **Registration form card** — White card on cream background. Simplified fields:
   - Shopname (maps to `companyName`/`name`)
   - Stadt (maps to `city`)
   - Website (optional)
   - E-Mail
   - Checkbox grid (2 columns): ⛺ Zelte / 🌙 Schlafsäcke / 🎒 Rucksäcke / 🚴 Fahrräder · E-Bikes / 🏔️ Winter · Ski / 📦 Sonstiges
   - Selected checkboxes get saved to `vendors.categories`
   - CTA button: "Jetzt auf der Karte erscheinen →" in orange

5. **Success state** — After submit, replace form with lime checkmark + "Danke, [Shopname]! Wir melden uns innerhalb von 24 Stunden."

6. **Footer** — Navy background, minimal: © 2025 Outzip · Datenschutz · Impressum

### Form Logic Changes
- Remove fields: `fullName`, `phone`, `address`, `country` from the form (simplify signup friction)
- Keep `fullName` mapped from companyName or set a sensible default for `first_name`
- Add `categories` state as `string[]` from checkbox selections
- On submit: insert vendor with selected categories, then create auth + profile as before
- Add `showSuccess` state to toggle between form and success message

### Translation Updates
**`src/i18n/en.json`** and **`src/i18n/de.json`** — Add/update keys for:
- Hero headline/subline
- Trust pill texts
- Category checkbox labels (Zelte, Schlafsäcke, Rucksäcke, Fahrräder, Winter/Ski, Sonstiges)
- Success message with `{shopname}` interpolation
- Footer links

### Files to modify
- `src/index.css` — brand color variables
- `tailwind.config.ts` — named colors
- `src/pages/JoinPage.tsx` — full redesign
- `src/i18n/en.json` — new translation keys
- `src/i18n/de.json` — new translation keys

### Mobile-first
- Single column layout on small screens
- Hero text stacked, map strip hidden or simplified on mobile
- Form card full-width with proper padding
- Under 2 scrolls on desktop

