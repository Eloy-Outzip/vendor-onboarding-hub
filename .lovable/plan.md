

## Remove Tip Box from /join Page

Remove the Google Maps tip box (the lime-bordered info box with the lightbulb icon) from the "How it works" section.

### File: `src/pages/JoinPage.tsx`
- Delete the tip box div (the `mt-4 mx-auto max-w-lg flex items-start gap-2.5 rounded-lg border border-lime/40 bg-lime/10` container with the Lightbulb icon and tip text)
- Remove the `Lightbulb` import from lucide-react if no longer used elsewhere

