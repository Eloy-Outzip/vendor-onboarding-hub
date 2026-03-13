

## Fix: Smart root redirect based on auth state

The root `/` currently does a hard `<Navigate to="/join">`, but JoinPage then redirects authenticated users to `/profile` — causing a visible flash/error.

### Solution

Create a small `RootRedirect` component that checks auth state and redirects accordingly:
- **Loading** → show nothing (or spinner)
- **Authenticated** → redirect to `/profile`
- **Not authenticated** → redirect to `/join`

### Changes

**1. `src/App.tsx`** — Replace `<Navigate to="/join" replace />` with `<RootRedirect />`:

```tsx
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? "/profile" : "/join"} replace />;
};
```

Update route: `<Route path="/" element={<RootRedirect />} />`

Remove unused `Index` import.

Single file change, ~10 lines added.

