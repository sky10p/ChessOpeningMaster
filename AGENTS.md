# AGENTS.md - Codex Instructions

## Project Overview

Chess Opening Master is a monorepo application for managing chess opening repertoires. It uses Lerna with Yarn workspaces and contains three packages: frontend, backend, and common.

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

## Documentation

### Architecture Documentation
- [RepertoireContext Architecture Guide](src/doc/RepertoireContext-Architecture.md) - Detailed documentation of the main context system
- [Variant Selection Logic](src/doc/Variant-Selection-Logic.md) - Complete guide to how chess opening variants are selected and managed
- [Testing Strategy](src/doc/Testing-Strategy.md) - Comprehensive testing patterns, mock requirements, and test scenarios
- [Troubleshooting Guide](src/doc/Troubleshooting-Guide.md) - Common issues, solutions, and debugging workflows

### Additional Documentation
- `src/doc/repertoire-variant-sync.md` - Existing variant synchronization documentation

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
