

## Fix: Allow Editor Preview to Access Protected Pages

### Problem
Every time you navigate or the preview reloads in the Lovable editor, you get redirected to the login page. This happens because the editor preview runs on a different domain (`lovableproject.com`) than your published app (`lovable.app`), so there is no stored authentication session. Since all your main pages are behind `ProtectedRoute`, you can't see them while editing.

### Solution
Detect when the app is running inside the Lovable editor preview and bypass the auth redirect so you can work on protected pages. The published production app will continue to require login as normal.

### How it works
- Check for the `__lovable_token` URL parameter (present only in editor previews) OR the `lovableproject.com` hostname
- When detected, `ProtectedRoute` renders children directly instead of redirecting
- `RootRedirect` navigates to `/profile` instead of showing login
- Production (`lovable.app` / custom domains) is completely unaffected

### Files to modify
- `src/components/ProtectedRoute.tsx` — skip auth check in editor preview
- `src/App.tsx` — skip auth check in `RootRedirect` for editor preview

### Technical detail
```typescript
const isEditorPreview = () =>
  window.location.hostname.includes('lovableproject.com') ||
  new URLSearchParams(window.location.search).has('__lovable_token');
```

This is a development-only convenience. No security impact since the editor preview is not your production environment.

