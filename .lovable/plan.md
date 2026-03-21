

## Improve /join Page — Links, Map, Logo, Language Switcher

### 1. Footer links — locale-aware hrefs

Replace the plain `<span>` texts for Privacy/Impressum with `<a>` tags pointing to the correct URLs based on `locale`:
- Privacy: `https://outzip.de/{locale}/help?header=3`
- Impressum: `https://outzip.de/{locale}/help?header=4`

Open in new tab (`target="_blank" rel="noopener"`).

**File**: `src/pages/JoinPage.tsx` (footer section, lines 285-291)

### 2. Replace map pin strip with a visual map

Remove the decorative `MapPin` icons and the line below them (lines 144-160). Replace with an embedded map image/illustration of Germany with scattered pins. Options:
- Use a static SVG map of Germany with stylized pin markers and one highlighted lime pin
- This keeps the page lightweight (no external map library)

The SVG will be an inline component showing Germany's outline with ~5 dots and one pulsing lime dot with the "Du könntest hier sein" label.

**File**: `src/pages/JoinPage.tsx` (hero section)

### 3. Logo placeholder

Replace the text "Outzip" in the header (line 130) with an `<img>` tag referencing a logo file. Since the user will provide the logo, add a placeholder path (`/outzip-logo.svg`) and ask the user to upload it.

**File**: `src/pages/JoinPage.tsx` (header)

### 4. Language switcher — avoid covering content

The switcher is `fixed top-4 right-4` which overlaps the header tag text. Fix by:
- Moving it from `fixed` to being integrated into the JoinPage header bar (right side), OR
- Adding `right-20` or similar offset so it doesn't overlap the top-bar tag text

Simplest: embed the language switcher directly in the JoinPage header instead of using the fixed-position global one. On the /join page, hide the global switcher and render EN/DE toggle inside the header bar to the right of the tag text.

**File**: `src/components/LanguageSwitcher.tsx` — remove `fixed` positioning, make it inline
**File**: `src/pages/JoinPage.tsx` — import and render `LanguageSwitcher` inside the header

### Files to modify
- `src/pages/JoinPage.tsx` — footer links, SVG map, logo, inline language switcher
- `src/components/LanguageSwitcher.tsx` — add prop to render inline (non-fixed) variant

