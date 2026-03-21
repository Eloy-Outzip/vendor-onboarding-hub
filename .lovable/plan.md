

## Make Trust Pills a Single-Line Banner

### Change
Convert the trust pills from wrapped badge chips with emojis into a single horizontal line of text items separated by dots, styled as a slim banner strip.

### File: `src/pages/JoinPage.tsx`

Replace the current trust pills section (flex-wrap badges with emojis) with a single-line banner:

```text
Kostenloser Eintrag  ·  Kein Newsletter  ·  Kein Vertrag  ·  Du entscheidest
```

- Remove emoji spans
- Use a slim horizontal bar with `justify-center` and `gap` or `·` separators
- Light background (cream), smaller text, no border/pill styling — just clean inline text
- Ensure it stays one line on desktop (at 984px it fits easily)

