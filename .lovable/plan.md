

## Fix: Keep Session Alive Within Browser Session

### Problem
The Supabase client already persists sessions in `localStorage`. However, the `AuthContext` profile-check logic is too aggressive:
1. In `init()`: if `checkProfile()` returns `null` (network error), it sets `hasProfile = false` → redirect to `/join`
2. In `onAuthStateChange` with `INITIAL_SESSION`: if profile check returns `false`, it signs the user out entirely

Both cause valid logged-in users to lose their session on page reload or navigation.

### Fix (single file: `src/contexts/AuthContext.tsx`)

1. **In `init()`**: When `checkProfile()` returns `null` (error/unknown), treat it as "probably valid" (`hasProfile = true`) instead of `false`. This prevents transient network issues from locking users out. The worst case is a brief moment where an orphan sees a protected page before the next successful check corrects it.

2. **In `onAuthStateChange`**: Same treatment — if profile check returns `null`, assume `true` and let the user through rather than signing them out.

3. **Add a retry mechanism**: If `checkProfile` fails, retry once after a short delay before giving up.

### Technical Detail

```text
checkProfile returns:
  true  → confirmed profile exists → hasProfile = true
  false → confirmed no profile    → hasProfile = false (orphan handling)
  null  → error/unknown           → hasProfile = true (benefit of doubt)
```

### Files to modify
- `src/contexts/AuthContext.tsx` — adjust null handling in both `init()` and `onAuthStateChange`

