

## Internationalization (EN / DE)

### Approach

Use a lightweight React context + JSON translation files pattern. No external i18n library needed for this scale (6 pages, ~80 strings).

### Files to create

**1. `src/i18n/en.json`** — All English strings keyed by page/section  
**2. `src/i18n/de.json`** — German translations with same keys  
**3. `src/contexts/LanguageContext.tsx`** — Context providing:
- `locale`: `"en" | "de"`
- `setLocale`: function to switch
- `t(key: string)`: lookup function with dot notation (e.g. `t("join.title")`)
- Persists choice to `localStorage`
- Defaults to browser language (`navigator.language.startsWith("de") ? "de" : "en"`)

**4. `src/components/LanguageSwitcher.tsx`** — Small EN/DE toggle button (top-right corner)

### Files to update

**5. `src/App.tsx`** — Wrap with `LanguageProvider`

**6. All 6 pages** — Replace hardcoded strings with `t()` calls:
- `JoinPage.tsx` (~25 strings: headings, labels, placeholders, buttons, magic link section)
- `WelcomePage.tsx` (~3 strings)
- `ProfilePage.tsx` (~20 strings: labels, section headings, buttons, status text)
- `ServicesPage.tsx` (~8 strings)
- `ProductsUploadPage.tsx` (~15 strings: headings, placeholders, upload zone text, buttons)
- `NotFound.tsx` (~3 strings)

**7. `src/components/ProtectedRoute.tsx`** — "Loading…" text

### Translation key structure

```json
{
  "common": { "loading": "Loading…", "back": "← Back", "save": "Save changes" },
  "join": { "title": "Put your shop on the map", "subtitle": "...", "fullName": "Full name", ... },
  "welcome": { "title": "You're on the map! 🎉", ... },
  "profile": { "completion": "Profile completion", "yourDetails": "Your details", ... },
  "services": { "title": "What do you offer?", ... },
  "products": { "title": "List your products", "uploadTitle": "Upload Excel or CSV file", ... },
  "notFound": { "title": "404", "message": "Oops! Page not found", ... }
}
```

### How the language switcher works

A small pill-shaped toggle (EN | DE) placed in a fixed top-right position on every page. Clicking switches locale instantly — all text re-renders via context. Choice persists across sessions via localStorage.

