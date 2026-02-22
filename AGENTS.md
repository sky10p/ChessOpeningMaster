# AGENTS.md - Codex Instructions

## Project Overview

ChessKeep is a monorepo application for managing chess opening repertoires. It uses Lerna with Yarn workspaces and contains three packages: frontend, backend, and common.

## Tech Stack

### Frontend (`packages/frontend`)
- **Framework**: React 18 with TypeScript
- **Bundler**: Webpack 5
- **Styling**: Tailwind CSS, PostCSS, Emotion
- **Testing**: Jest + React Testing Library
- **UI Components**: Headless UI, Heroicons
- **Charts**: Recharts

### Backend (`packages/backend`)
- **Runtime**: Node.js (v20.11.1)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB 5.x
- **Testing**: Jest + Supertest + mongodb-memory-server

### Common (`packages/common`)
- **Purpose**: Shared types, utilities, and chess logic
- **Chess Library**: chess.js
- **Testing**: Jest + ts-jest

## Package Manager

**ALWAYS use `yarn` instead of `npm`.**

```bash
# Install dependencies
yarn install

# Add a package
yarn add <package>
yarn add -D <package>  # dev dependency

# Workspace-specific
yarn workspace @chess-opening-master/frontend add <package>
yarn workspace @chess-opening-master/backend add <package>
```

## Build Commands

```bash
# Build all packages
yarn build

# Build common package (dependency for others)
yarn build:common
```

## Development Commands

```bash
# Start frontend dev server (port 3002)
yarn start:front:dev

# Start backend dev server
yarn start:backend:dev

# Start both frontend and backend
yarn start:dev

# Storybook-like component development
yarn develop:components
```

## Test Commands

```bash
# Run all tests
yarn test

# Run specific package tests
yarn test:frontend
yarn test:backend
yarn test:common

# Run with coverage
yarn test:common:coverage
```

## Validation Checklist

Before submitting any changes, verify:

### 1. TypeScript Compilation
```bash
# Check frontend types without emitting
yarn front:tsc:noEmits

# Build all packages (includes type checking)
yarn build
```

### 2. Linting
```bash
yarn lint
```

### 3. Tests
```bash
yarn test
```

### 4. Runtime Verification
```bash
# Start dev servers to verify runtime
yarn start:dev
```

## Project Structure

```
packages/
├── frontend/     # React SPA
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── contexts/     # React contexts
│   │   ├── repository/   # API client layer
│   │   ├── utils/        # Utility functions
│   │   └── types/        # TypeScript types
│   └── public/           # Static assets
├── backend/      # Express API
│   └── src/
│       ├── controllers/  # Route handlers
│       ├── routes/       # Express routes
│       ├── services/     # Business logic
│       ├── models/       # MongoDB models
│       ├── db/           # Database connection
│       └── middleware/   # Express middleware
└── common/       # Shared code
    └── src/
        ├── types/        # Shared TypeScript types
        └── utils/        # Shared utilities
```

## Code Style Rules

1. **No comments in code** - Code should be self-explanatory
2. **Concise code** - Avoid unnecessary explanatory comments
3. **Use yarn** - Never use npm commands
4. **Quote directory names** in cd commands: `cd "directory name"`
5. **TypeScript strict mode** is enabled

## Design System

The frontend has a token-based design system. **Read `src/doc/Design-System.md` before touching any UI.**

### Critical rules

1. **No hard-coded Tailwind colours.** Use semantic token classes everywhere:
   - Backgrounds: `bg-page`, `bg-surface`, `bg-surface-raised`, `bg-interactive`
   - Borders: `border-border-default`, `border-border-subtle`
   - Text: `text-text-base`, `text-text-muted`, `text-text-subtle`, `text-text-on-brand`
   - Brand actions: `bg-brand`, `bg-accent`, `bg-danger`, `bg-success`, `bg-warning`

2. **No raw `<button>` elements.** Use `<Button intent="…" size="…">` or `<IconButton label="…">` from `components/ui`.

3. **No raw `<input>`, `<textarea>`, `<select>`.** Use `<Input>`, `<Textarea>`, or `<Select>` from `components/ui`.

4. **Use `<Tabs>` + `<TabButton variant="…">` for all tab bars.** Never build custom tab bars with raw buttons and ternary class strings.

5. **Use `<Badge variant="…">` for all status chips / filter tags.** Never build inline `<span>` badges with raw colour classes.

6. **Class merging via `cn()`.** Import from `utils/cn.ts`. Never concatenate Tailwind classes manually in template strings.

7. **Theming.** Dark mode is active by default (`class="dark"` on `<html>`). Light mode is toggled by replacing that with `class="light"`. Never write theme-specific styles outside `index.css` token blocks.

### Component imports

```ts
import { Button, IconButton, Badge, Card, Tabs, TabButton, Input, Textarea, Select } from "../../components/ui";
import { cn } from "../../utils/cn";
```

### Documentation

- Full token reference, all component API options, layout patterns, icon rules, a11y checklist, definition of done → `src/doc/Design-System.md`

## React `useEffect` Quality Guidelines

Default policy: use local documentation as the source of truth during implementation and review.
- Primary: `src/doc/React-Effect-Data-Fetching-Guide.md`
- External React link is optional and should only be used for occasional alignment, not on every task:
  - https://react.dev/learn/you-might-not-need-an-effect#fetching-data

Rules for this codebase:
1. Do not use `useEffect` when logic can run during render (derived state, computed values) or in event handlers.
2. Prefer existing data-loading abstractions first (route/page hooks, shared hooks, repository layer orchestration) before fetching directly inside a component effect.
3. If data fetching in an effect is unavoidable, always prevent stale updates with cleanup (`ignore` flag and/or `AbortController`) and keep dependency arrays complete.
4. Avoid fetch waterfalls by loading data at higher levels when possible and fetching independent resources in parallel.
5. Model request lifecycle explicitly (`idle`/`loading`/`success`/`error`) and test each state.

For detailed patterns and examples, see:
- `src/doc/React-Effect-Data-Fetching-Guide.md`

## Database

MongoDB is used with Docker Compose:

```bash
# Start MongoDB container
docker-compose up -d

# Connection string (development)
mongodb://localhost:27017/chess_opening_master
```

## Important Files

- `lerna.json` - Lerna configuration (npm client: yarn)
- `tsconfig.base.json` - Base TypeScript configuration
- `docker-compose.yml` - MongoDB container setup
- `packages/*/jest.config.js` - Jest configurations per package
- `packages/frontend/src/pages/games/*` - My Games (Games Intelligence) page, tabs, hooks, and UI filters
- `packages/frontend/src/repository/games/games.ts` - Frontend Games API client and query contract
- `packages/backend/src/routes/games.ts` - Games API route surface
- `packages/backend/src/controllers/gamesController.ts` - Games API input parsing and user scoping
- `packages/backend/src/services/games/*` - Import orchestration, stats aggregation, training plan, auto-sync, security

## Documentation

### Architecture Documentation
- [Design System](src/doc/Design-System.md) - Token reference, component catalogue, theming, layout patterns, a11y checklist, and Definition of Done for new UI
- [RepertoireContext Architecture Guide](src/doc/RepertoireContext-Architecture.md) - Detailed documentation of the main context system
- [Variant Selection Logic](src/doc/Variant-Selection-Logic.md) - Complete guide to how chess opening variants are selected and managed
- [Testing Strategy](src/doc/Testing-Strategy.md) - Comprehensive testing patterns, mock requirements, and test scenarios
- [Troubleshooting Guide](src/doc/Troubleshooting-Guide.md) - Common issues, solutions, and debugging workflows
- [React Effect & Data Fetching Guide](src/doc/React-Effect-Data-Fetching-Guide.md) - Project rules for when to avoid `useEffect` and how to fetch safely when needed
- [PathPage and Next Lesson Logic](src/doc/PathPage-Next-Lesson-Logic.md) - End-to-end `/path` behavior and backend next-lesson selection rules
- [Spaced Repetition Upgrade Plan](src/doc/Spaced-Repetition-Upgrade-Plan.md) - Rating-based scheduler migration plan with no same-day repeats and Path analytics
- [Dashboard Spaced Repetition Insights](src/doc/Dashboard-Spaced-Repetition-Insights.md) - Dashboard charts and data flow based on path plan/analytics insights
- [Game Import Service Architecture](src/doc/Game-Import-Service-Architecture.md) - Backend module boundaries and orchestration flow for My Games
- [Game Imports and Training Plan Guide](src/doc/Game-Imports-Guide.md) - My Games tabs, sync/import flows, and training usage
- [Training Queue Guide](src/doc/Training-Queue-Guide.md) - Training queue behavior and interpretation rules in My Games
- [Mobile vs Desktop Component Architecture](src/doc/Mobile-Desktop-Component-Architecture.md) - How EditRepertoirePage splits into mobile tab panels and desktop sub-panels, shared vs device-specific components

### Additional Documentation
- `src/doc/repertoire-variant-sync.md` - Existing variant synchronization documentation
- [User Auth Backend](src/doc/User-Auth-Backend.md) - Backend auth lifecycle, token model, and user-scoping rules
- [User Auth Frontend](src/doc/User-Auth-Frontend.md) - Frontend auth bootstrap, route gating, and auth UX behavior

## PathPage and Next Lesson Rules (Critical for Agents)

Before changing `PathPage`, `usePaths`, `/paths`, or `pathService`, read `src/doc/PathPage-Next-Lesson-Logic.md`.

Core rules to preserve:
- `/path` calls `GET /paths`, `GET /paths/plan`, and `GET /paths/analytics` on mount and when filters change.
- `category` query enables deterministic selection (`variantsWithErrors`, `newVariants`, `oldVariants`, `studyToReview`).
- No category query uses deterministic due-first priority in `pathService` (errors -> due -> new -> old -> study when applicable).
- Same-day repeats are blocked by `lastReviewedDayKey` checks for path selection.
- Removing a variant from path deletes its `variantsInfo` record and reloads path in the active filter.
- All path selection is user-scoped; do not bypass `getRequestUserId(req)` filtering.

## My Games (Games Intelligence) Rules (Critical for Agents)

Before changing `GamesPage`, games hooks/repository, `/games` routes, or services in `backend/src/services/games`, read:
- `src/doc/Game-Imports-Guide.md`
- `src/doc/Game-Import-Service-Architecture.md`
- `src/doc/Training-Queue-Guide.md`

Core rules to preserve:
- `/games` is a 4-tab page: `Insights`, `Training`, `Sync`, `Data`.
- Shared filters currently exposed in UI: `source`, `color`, `mapped`, `timeControlBucket`, `dateFrom`, `dateTo`, `openingQuery`.
- Backend stats supports additional query params (`ratedOnly`, `opponentRatingBand`, `tournamentGroup`) even when not exposed in current GamesPage filters.
- Games startup flow loads accounts/imports/stats/latest-plan and can run automatic due-account sync once per page load when account is overdue.
- Due-account startup sync threshold defaults to 24h (`GAMES_AUTO_SYNC_DUE_HOURS`) and skips accounts already in `running` state.
- Provider sync/manual import actions must be followed by rematch + plan regeneration flow to keep Insights/Training coherent.
- `Force sync all` triggers provider sync for linked accounts plus rematch and plan regeneration.
- Data deletion behavior is split between delete single game (`DELETE /games/imports/:gameId`) and delete filtered/all (`DELETE /games/imports`).
- Games controllers must always use `getRequestUserId(req)` and user-scoped queries/documents/indexes.
- Linked provider secrets are encrypted at rest (`GAME_PROVIDER_TOKEN_SECRET` required in production).

## User Authentication and User Scope (Critical for Agents)

Before implementing any feature that reads or writes domain data, follow these rules.

### Backend rules
- `/auth` endpoints are public and mounted before `authMiddleware`.
- All domain routes are behind `authMiddleware`; user identity is attached to `req.userId`.
- Controllers must read user via `getRequestUserId(req)` and scope all DB operations by `userId`.
- New persisted documents must include `userId`.
- If a new query is frequently filtered or uniquely constrained per user, include `userId` in indexes.
- Keep compatibility with startup migration behavior (`ensureDefaultUserAndMigrateData`) for legacy data.

### Frontend rules
- Auth bootstrap state is owned by `App.tsx` (`getAuthConfig` + `getAuthSession`).
- When auth is enabled and session is not authenticated, only auth routes should be reachable.
- Use repository layer (`src/repository/auth/auth.ts`) for auth requests instead of raw `fetch`.
- Preserve cookie-auth behavior by keeping credentialed requests.
- Keep error handling aligned with `AuthRequestError` types (`authentication`, `network`, `server`, `unknown`).

### Default-user mode
- Controlled by backend flags (`ENABLE_AUTH`, `ALLOW_DEFAULT_USER`).
- Frontend login page can switch to passwordless default-user login only when backend allows it.
- Do not assume default-user mode in new features; always support normal authenticated users first.

## Recent Major Changes (Important for Agents)

### RepertoireContext Refactoring
The RepertoireContext was refactored from a single large file into a modular directory structure:

```
packages/frontend/src/contexts/RepertoireContext/
├── index.ts              # Clean exports
├── types.ts              # Type definitions  
├── utils.ts              # Utility functions
└── RepertoireContext.tsx # Main implementation
```

**Critical**: Always import from the directory (`contexts/RepertoireContext`) not individual files.

### Variant Selection Logic
Implements sophisticated chess opening variant selection with these principles:
- Keep selected variant when compatible with current position
- Switch to first compatible variant when incompatible
- Create new variants automatically when adding incompatible moves
- Uses LAN (Logical Algebraic Notation) for move path matching

### Testing Requirements
- Chess.js mocks MUST include `lan` property in move objects
- Use async/await properly with React Testing Library
- 49 tests currently covering variant selection logic comprehensively
- All tests passing across 340+ total tests in project

### Key Technical Insights
- `buildMovePath()` from common package is critical for variant matching
- `isVariantCompatibleWithPath()` function uses LAN notation comparison
- All navigation methods must call `updateVariants(targetNode)` 
- The Chess.js mock requires SAN-to-LAN mapping for proper testing

## Pre-commit Verification

Run this sequence before any commit:

```bash
# 1. Build common first (other packages depend on it)
yarn build:common

# 2. Build all packages
yarn build

# 3. Run all tests
yarn test

# 4. Check linting
yarn lint

# 5. Verify frontend types
yarn front:tsc:noEmits
```

## Common Issues

### Build Order
Always build `common` package first since `frontend` and `backend` depend on it:
```bash
yarn build:common && yarn build
```

### MongoDB Connection
Ensure MongoDB is running before starting backend:
```bash
docker-compose up -d
yarn start:backend:dev
```

### Node Version
Use Node.js v20.11.1 (specified in volta config).

## Testing Strategy

- **Unit tests**: Located in `__tests__` directories or `*.spec.ts` files
- **Backend integration tests**: Use `mongodb-memory-server` for isolated DB testing
- **Frontend tests**: Use React Testing Library with jsdom environment

## Environment Variables

Backend uses dotenv. Required variables:
- `MONGO_URI` - MongoDB connection string
- `NODE_ENV` - development/production
- `GAME_PROVIDER_TOKEN_SECRET` - Required in production to encrypt linked provider tokens
- `GAMES_AUTO_SYNC_DUE_HOURS` - Optional startup/scheduler due threshold for automatic sync checks (defaults to 24)
