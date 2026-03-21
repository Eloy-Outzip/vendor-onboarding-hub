

## Add "3 Steps" Section + Tip Box to /join Page

### What
Add a concise "how it works" section between the trust banner and the form, plus a tip box below the steps. Replace the trust banner with this more informative content.

### Layout (between map banner and form)

**3 steps — horizontal on desktop, stacked on mobile:**

1. **Eintragen** — Shopname, Ort, Sortiment. 2 Minuten.
2. **Wir übernehmen** — Eintrag auf der Outzip-Karte, verknüpft mit Google Maps.
3. **Kunden finden dich** — Klick auf deinen Pin → direkt zu Google Maps.

Below: one-liner note in muted text:
> Du füllst das Formular aus. Den Rest erledigen wir.

Below that: a subtle info box (light background, no barrier feel):
> 💡 Tipp: Ein Google Maps-Eintrag macht dich noch sichtbarer — falls du noch keinen hast, helfen wir dir dabei.

### Files to modify
- **`src/pages/JoinPage.tsx`** — Replace trust banner section with 3-step cards + note + tip box
- **`src/i18n/de.json`** + **`src/i18n/en.json`** — Add translation keys for steps, note, and tip

### Translation keys to add
```
"steps": {
  "title": "So funktioniert's",
  "step1Title": "Eintragen",
  "step1Desc": "Shopname, Ort und Sortiment. Dauert 2 Minuten.",
  "step2Title": "Wir übernehmen",
  "step2Desc": "Eintrag auf der Outzip-Karte, verknüpft mit deinem Google Maps-Profil.",
  "step3Title": "Kunden finden dich",
  "step3Desc": "Ein Klick auf deinen Pin führt direkt zu deinem Google Maps-Eintrag.",
  "note": "Du füllst das Formular aus. Den Rest erledigen wir.",
  "tip": "Ein Google Maps-Eintrag macht dich noch sichtbarer — falls du noch keinen hast, helfen wir dir dabei."
}
```

### Design
- Steps shown as numbered items (1, 2, 3) in a row with step number circles in navy
- Compact — no large cards, just number + title + one-line description
- Note as centered muted text below
- Tip as a subtle bordered box with lightbulb icon, not blocking

