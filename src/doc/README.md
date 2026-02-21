# Documentation Index

This directory contains comprehensive documentation for the ChessKeep project, specifically designed to help AI agents understand the architecture and troubleshoot issues.

## Documentation Files

### 📄 [Project Summary](summary.md)
**Shareable high-level overview for product, pages, and flow**
- Product purpose and core capabilities
- Frontend page map and route overview
- Main user flows (repertoire, path, games)
- Architecture and backend domain organization

### 🏗️ [RepertoireContext Architecture Guide](RepertoireContext-Architecture.md)
**Essential for understanding the core system**
- Directory structure after refactoring
- Key functions and their purposes
- Integration points and dependencies
- Migration notes from single-file to modular structure

### 🔄 [Variant Selection Logic](Variant-Selection-Logic.md) 
**Critical for understanding chess opening management**
- Core algorithm for variant switching
- Compatibility checking using LAN notation
- Automatic variant creation scenarios
- Debugging tips for variant-related issues

### 🧪 [Testing Strategy](Testing-Strategy.md)
**Must-read for test development and debugging**
- Test file organization and patterns
- Chess.js mock requirements (especially LAN properties)
- Common test scenarios for variant logic
- Mock data creation patterns

### ⚛️ [React Effect & Data Fetching Guide](React-Effect-Data-Fetching-Guide.md)
**Required reading before introducing new `useEffect` logic**
- When to avoid `useEffect` entirely
- Safe data-fetching effect patterns
- Dependency and cleanup requirements
- Testing checklist for async effects

### 🔐 [User Auth Backend](User-Auth-Backend.md)
**Required for backend features that read or write user data**
- Auth endpoint behavior and lifecycle
- Token and cookie model
- Request user scoping rules for controllers
- Migration and default-user compatibility behavior

### 🧭 [User Auth Frontend](User-Auth-Frontend.md)
**Required for frontend features that depend on authentication state**
- App bootstrap auth/session flow
- Login/register/default-user UX behavior
- Route gating and logout behavior
- API repository usage and credential handling

### 📘 [PathPage and Next Lesson Logic](PathPage-Next-Lesson-Logic.md)
**Required for changes to `/path`, `usePaths`, or path-selection backend logic**
- `/path` page behavior and action flow
- `GET /paths` category and no-category behavior
- Deterministic due-first selection and category rules
- Weighted new-variant selection details and fallback order

### 🧠 [Spaced Repetition Upgrade Plan](Spaced-Repetition-Upgrade-Plan.md)
**Required for migration from legacy `errors + lastDate` scheduling to rating-based SRS**
- No same-day repeat rules
- `Again/Hard/Good/Easy` rating workflow and auto-suggestion
- Path planning/analytics API and UI design
- Phased rollout and acceptance criteria

### ♟️ [Game Imports and Training Plan Guide](Game-Imports-Guide.md)
**Required for `/games` page behavior (My Games / Games Intelligence)**
- 4-tab UI model (`Insights`, `Training`, `Sync`, `Data`)
- Shared filters and startup auto-sync behavior
- Provider sync, manual PGN import, force-sync-all, and deletion flows
- How user-visible messages map to backend operations

### 🧱 [Game Import Service Architecture](Game-Import-Service-Architecture.md)
**Required for backend changes under `services/games` or `/games` routes/controllers**
- Service/module boundaries and dependency direction
- Import/rematch/plan orchestration flow
- Auto-sync cadence and security/token encryption constraints
- User scoping and indexing expectations for game data

### 🧭 [Training Queue Guide](Training-Queue-Guide.md)
**Required for Training tab logic and queue interpretation**
- End-to-end data flow from imports/stats/plan to UI
- Actionable queue vs signal lines semantics
- Mapping-needed handling and `pathHint` behavior
- Practical workflow after sync/import/rematch/plan updates

### 🔧 [Troubleshooting Guide](Troubleshooting-Guide.md)
**First stop when encountering issues**
- Common TypeScript compilation errors
- Runtime variant selection problems
- Test failure diagnosis and solutions
- Build and development environment issues

### [Dashboard Spaced Repetition Insights](Dashboard-Spaced-Repetition-Insights.md)
**Required for Dashboard `Path Insights` tab and charts that consume path/spaced-repetition insights**
- Dashboard insights architecture and data flow
- Mapping Dashboard filters to path-insight filters
- Due-load, rating, opening-forecast, and next-variant chart behavior
- Testing expectations for mocked insights data

## Quick Start for Agents

### Understanding the Codebase
1. Start with [AGENTS.md](../AGENTS.md) for project overview
2. Read [RepertoireContext Architecture](RepertoireContext-Architecture.md) for core system understanding
3. Review [Variant Selection Logic](Variant-Selection-Logic.md) for chess-specific behavior
4. Read [User Auth Backend](User-Auth-Backend.md) and [User Auth Frontend](User-Auth-Frontend.md) before changing user-related logic
5. Read [PathPage and Next Lesson Logic](PathPage-Next-Lesson-Logic.md) before changing `/path` or next-lesson selection
6. Read [Spaced Repetition Upgrade Plan](Spaced-Repetition-Upgrade-Plan.md) before changing training scheduling model
7. Read [Game Imports and Training Plan Guide](Game-Imports-Guide.md) before changing `/games` page UX or filters
8. Read [Game Import Service Architecture](Game-Import-Service-Architecture.md) before changing `/games` backend services
9. Read [Training Queue Guide](Training-Queue-Guide.md) before changing Games training prioritization

### Debugging Issues
1. Check [Troubleshooting Guide](Troubleshooting-Guide.md) for common problems
2. Review [Testing Strategy](Testing-Strategy.md) for test-related issues
3. Use debug patterns documented in each guide

### Making Changes
1. Understand the variant selection algorithm before modifying navigation
2. Update Chess.js mocks when adding new test moves
3. Always test variant compatibility when changing move logic
4. Follow the established directory structure for context organization
5. Follow [React Effect & Data Fetching Guide](React-Effect-Data-Fetching-Guide.md) before adding new data-fetching effects
6. Validate selection behavior with [PathPage and Next Lesson Logic](PathPage-Next-Lesson-Logic.md) before changing path rules
7. Follow [Spaced Repetition Upgrade Plan](Spaced-Repetition-Upgrade-Plan.md) for scheduler/rating migrations
8. Read [Dashboard Spaced Repetition Insights](Dashboard-Spaced-Repetition-Insights.md) before changing Dashboard SRS/path charts
9. Validate Games tab behavior against [Game Imports and Training Plan Guide](Game-Imports-Guide.md)
10. Validate backend orchestration assumptions against [Game Import Service Architecture](Game-Import-Service-Architecture.md)

## Key Technical Concepts

### LAN (Logical Algebraic Notation)
- Format: "e2e4", "g1f3", etc.
- Used for move path compatibility checking
- Required in Chess.js mock move objects
- Critical for variant selection algorithm

### Variant Compatibility
- Variants must match move paths exactly using LAN notation
- System automatically switches when incompatible
- New variants created when no compatible variant exists

### Navigation Flow
- All navigation methods call `updateVariants(targetNode)`
- Uses `buildMovePath()` from common package for path generation
- Triggers auto-save and state synchronization

## Architecture Highlights

### Modular Structure
The RepertoireContext was refactored into a clean directory structure with proper separation of concerns.

### Comprehensive Testing
49 tests specifically cover variant selection logic, with 340+ total tests across all packages.

### Robust Error Handling
Extensive troubleshooting documentation covers common issues and their solutions.

---

*This documentation is maintained to help AI agents quickly understand and work with the ChessKeep codebase. Update these files when making architectural changes.*


