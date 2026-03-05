# User Authentication Flow (Frontend)

This document explains how frontend authentication works, how login/register are displayed, and how authenticated state controls app navigation.

## App Bootstrap

Main entry: `packages/frontend/src/components/application/App/App.tsx`.

On mount, frontend:

1. Loads auth config with `getAuthConfig()`.
2. If auth is disabled, marks user as authenticated immediately.
3. If auth is enabled, loads session with `getAuthSession()`.
4. Sets `authEnabled`, `allowDefaultUser`, `authenticated`, and `authLoaded`.

If auth calls fail, UI falls back to auth disabled behavior.

## Route Gating

Implemented in `packages/frontend/src/components/application/Content/Content.tsx`.

- When `authEnabled && !authenticated`, only auth routes are available:
  - `/login`
  - `/register`
  - fallback redirects to `/login`
- When authenticated, main app routes are available (`/dashboard`, repertoire/study routes, etc.).

## Auth Page Shell

Implemented in `packages/frontend/src/pages/auth/AuthPageShell.tsx`.

A shared layout wrapper used by both `LoginPage` and `RegisterPage`. Renders a two-column full-screen layout:

- **Left column** (desktop only, `lg:flex`): brand aside with `asideTitle` + `asideDescription` + two feature highlight cards.
- **Right column**: centered card with a header section (`title` + `description`) and a `children` slot for the form.

Props: `title`, `description`, `asideTitle`, `asideDescription`, `children`.

## Login Page

Implemented in `packages/frontend/src/pages/auth/LoginPage.tsx`.

Capabilities:

- Standard login via username/password (with `label` + `size="lg"` inputs).
- Optional default-user login toggle when `allowDefaultUser=true`.
- Clear user-facing error mapping for network/server/auth cases.
- On success: calls `onAuthenticated()` and navigates to `/dashboard`.
- Wrapped in `<AuthPageShell>`.

## Register Page

Implemented in `packages/frontend/src/pages/auth/RegisterPage.tsx`.

Capabilities:

- Username/password/confirm validation with `size="lg"` labeled inputs.
- Password policy enforcement using shared `validatePasswordStrength` from common package; policy text rendered in a `surface-raised` info block.
- On successful registration: user is considered authenticated and routed to `/dashboard`.
- Wrapped in `<AuthPageShell>`.

## Logout

Implemented in `packages/frontend/src/components/application/AppShell/AppShell.tsx`.

- Calls backend `/auth/logout` when auth is enabled.
- Clears local authenticated state through `onLoggedOut()`.
- Navigates to `/login`.
- The logout action is located in the user menu within the `AppShell` sidebar.

## Frontend Auth API Layer

Implemented in `packages/frontend/src/repository/auth/auth.ts`.

Available methods:

- `getAuthConfig()`
- `getAuthSession()`
- `login(username, password)`
- `register(username, password)`
- `loginWithDefaultUser()`
- `logout()`

Network behavior:

- Requests use `apiFetch` with `credentials: include` so auth cookie is sent automatically.
- `AuthRequestError` normalizes auth/network/server/unknown failures for UI handling.

Backup/restore note:

- repertoire backup download uses credentialed requests in `packages/frontend/src/repository/repertoires/repertoires.tsx`
- restore requests for backup zips must also remain credentialed so the backend can bind the restore to the current authenticated user
- session tokens are not restored, so a restored user may need to sign in again

## Rules for Future Frontend Features

1. Do not bypass `App.tsx` auth bootstrap state for route decisions.
2. Keep unauthorized users inside auth-only routes when auth is enabled.
3. Use repository auth functions instead of raw `fetch` for auth endpoints.
4. Keep credentialed requests (`credentials: include`) for endpoints that rely on cookie auth.
5. If adding new auth UX states, preserve existing error typing (`AuthRequestError`).
