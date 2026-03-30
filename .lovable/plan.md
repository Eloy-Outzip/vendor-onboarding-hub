

## Plan: Update Iframe Embed URL to Custom Domain

### Change

**File: `src/pages/ProfilePage.tsx`** — Update the iframe snippet URL from `https://outzip-signup.lovable.app/map/embed` to `https://app.outzip.de/map/embed`.

```typescript
// Before
const snippet = `<iframe src="https://outzip-signup.lovable.app/map/embed" width="100%" height="500" frameborder="0"></iframe>`;

// After
const snippet = `<iframe src="https://app.outzip.de/map/embed" width="100%" height="500" frameborder="0"></iframe>`;
```

Single line change, no other files affected.

