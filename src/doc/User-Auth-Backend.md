# User Authentication and User Scope (Backend)

This document explains how backend user authentication works and how user isolation is enforced across data operations.

## Core Flow

1. `packages/backend/src/app.ts` mounts `/auth` routes first.
2. `authMiddleware` is applied after `/auth` and before all feature routes.
3. Feature controllers read `req.userId` through `getRequestUserId(req)` and scope queries by user.

## Auth Endpoints

Defined in `packages/backend/src/routes/auth.ts`:

- `GET /auth/config`
  - Returns `{ enabled, allowDefaultUser, defaultUsername }`.
- `GET /auth/session`
  - Returns `{ authenticated, userId }` based on token validity.
- `POST /auth/register`
  - Creates a user and immediately signs in.
- `POST /auth/login`
  - Signs in with username/password.
- `POST /auth/default-login`
  - Signs in with default local user when enabled.
- `POST /auth/logout`
  - Revokes current token and clears cookie.

## Token and Cookie Model

- Auth tokens are random 48-byte hex strings stored in `authTokens`.
- Token TTL is controlled by `AUTH_TOKEN_TTL_SECONDS`.
- Cookie name is `chess_opening_master_auth`.
- Cookie is set as `httpOnly`, with `sameSite` and `secure` determined by environment.
- Token can also be read from `Authorization: Bearer <token>`.

Implementation: `packages/backend/src/utils/authToken.ts`.

## Environment Flags

- `ENABLE_AUTH=true` enables authentication.
- `ALLOW_DEFAULT_USER=true` allows passwordless default-user login.
- `DEFAULT_USER_USERNAME` sets default username.
- `DEFAULT_USER_PASSWORD` sets default user password for created user.
- `AUTH_TOKEN_TTL_SECONDS` sets token expiration in seconds.
- `AUTH_COOKIE_SAME_SITE` optionally sets cookie policy (`lax`, `strict`, `none`).

Implementation: `packages/backend/src/services/authService.ts`.

## Startup Migration and Backward Compatibility

On startup, backend runs:

- `ensureDatabaseIndexes(getDB())`
- `ensureDefaultUserAndMigrateData()`

`ensureDefaultUserAndMigrateData()` creates the default user if missing and migrates legacy documents by setting `userId` where absent in:

- `repertoires`
- `studies`
- `positions`
- `variantsInfo`

This keeps old data accessible under the default user while enabling multi-user isolation.

## Data Isolation Rules

All authenticated routes must use request user scope.

Current controller coverage:

- `repertoiresController.ts`
- `studiesController.ts`
- `positionsController.ts`
- `pathsController.ts`

Patterns to follow for new backend features:

1. Keep route behind `authMiddleware`.
2. Read current user with `getRequestUserId(req)`.
3. Add `{ userId }` to all read/write queries.
4. Include `userId` in new persisted documents.
5. Add indexes that include `userId` when uniqueness or frequent filtering is needed.

## Security Notes

- Passwords are never stored in plain text.
- Password hashing uses PBKDF2 with per-user salt.
- Hash comparison uses `timingSafeEqual`.
- Expired tokens are naturally removed by TTL index and also proactively cleaned on lookup misses.
