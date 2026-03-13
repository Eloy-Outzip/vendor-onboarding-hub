
Diagnóstico rápido (no es conflicto de idioma/routing por idioma):
- El problema principal está en la lógica de acceso, no en `LanguageContext`.
- Hoy `ProtectedRoute` hace `if (!hasProfile) -> /join` para todos los casos.
- Eso mete en `/join` tanto a:
  1) usuarios no autenticados, como  
  2) usuarios autenticados mientras aún se resuelve el chequeo de perfil.
- Además, en backend sí existe tu cuenta completa (`eloy@outzip.de`) con `profiles.vendor_id` válido, así que no debería bloquearse por datos faltantes.

Plan de implementación:
1) Separar “autenticado” de “tiene perfil” en el guard
- En `ProtectedRoute`:
  - `loading` -> mostrar loading
  - `!user` (o `!session`) -> redirigir a `/` (login)
  - `user && !hasProfile` -> redirigir a `/join`
  - `user && hasProfile` -> permitir `/profile`, `/services`, `/products-upload`

2) Evitar redirección prematura durante eventos de auth
- En `AuthContext`, cuando llega un `onAuthStateChange` con sesión:
  - poner `loading=true` antes de consultar `profiles`
  - después setear `hasProfile` y recién entonces `loading=false`
- Esto evita que un usuario válido caiga temporalmente en `/join` por un estado intermedio.

3) Ajustar redirección raíz para que sea consistente
- En `RootRedirect` (`App.tsx`):
  - si `hasProfile` -> `/profile`
  - si no autenticado -> `LoginPage` (`/`)
  - si autenticado sin perfil -> `/join`
- Así queda exactamente el flujo que pediste: si tienes cuenta pero no sesión activa, vas a login (no a join).

4) Validación funcional end-to-end
- Probar 3 flujos:
  - Vendor existente logueado => `/profile` carga.
  - Vendor existente no logueado => `/` (login), luego magic link => `/profile`.
  - Usuario nuevo sin perfil => `/join`.

Detalles técnicos (archivos a tocar):
- `src/components/ProtectedRoute.tsx` (reglas de redirección por estado real de auth)
- `src/contexts/AuthContext.tsx` (control de `loading` durante verificación de perfil en auth events)
- `src/App.tsx` (`RootRedirect` coherente con autenticación vs onboarding)
