# Documentation Index

This directory contains architecture and implementation guides for ChessKeep.

## Documentation Files

### [Project Summary](summary.md)
- Product purpose and main flows
- Frontend route map
- Backend domain overview

### [RepertoireContext Architecture Guide](RepertoireContext-Architecture.md)
- Core context structure and responsibilities
- Integration points and data flow

### [Variant Selection Logic](Variant-Selection-Logic.md)
- Variant compatibility and switching behavior
- LAN-based path matching rules

### [Testing Strategy](Testing-Strategy.md)
- Testing patterns and mock requirements
- Common frontend/backend scenarios

### [React Effect & Data Fetching Guide](React-Effect-Data-Fetching-Guide.md)
- When to avoid `useEffect`
- Safe data-fetching effect patterns

### [User Auth Backend](User-Auth-Backend.md)
- Auth lifecycle and request user scoping
- Token/session behavior and migration compatibility

### [User Auth Frontend](User-Auth-Frontend.md)
- Auth bootstrap, route gating, login/register flow

### [PathPage and Next Lesson Logic](PathPage-Next-Lesson-Logic.md)
- `/path` endpoint usage and deterministic selection rules
- Category/no-category behavior and no same-day repeats

### [Train Error Reinforcement Mode](Train-Error-Reinforcement-Mode.md)
- Variant results -> reinforcement -> full-run confirm flow
- Monotonic same-day daily snapshot rule
- Mistake-SRS lifecycle and replay behavior

### [Train Section Architecture](Train-Section-Architecture.md)
- `/train` and opening detail routes
- Train API contracts and data flow
- Mastery formulas and due definitions

### [Spaced Repetition Upgrade Plan](Spaced-Repetition-Upgrade-Plan.md)
- Rating-based scheduler model and migration details

### [Game Imports and Training Plan Guide](Game-Imports-Guide.md)
- `/games` UX model and sync/import workflows

### [Game Import Service Architecture](Game-Import-Service-Architecture.md)
- Backend orchestration modules and dependencies

### [Training Queue Guide](Training-Queue-Guide.md)
- Queue semantics and interpretation rules for games training

### [Troubleshooting Guide](Troubleshooting-Guide.md)
- Common build/runtime/test issues and fixes

### [Dashboard Spaced Repetition Insights](Dashboard-Spaced-Repetition-Insights.md)
- Dashboard path/scheduler analytics data flow

## Quick Start for Agents

### Understanding the Codebase
1. Start with [AGENTS.md](../AGENTS.md).
2. Read [RepertoireContext Architecture Guide](RepertoireContext-Architecture.md).
3. Read [Variant Selection Logic](Variant-Selection-Logic.md).
4. Read [User Auth Backend](User-Auth-Backend.md) and [User Auth Frontend](User-Auth-Frontend.md).
5. Read [PathPage and Next Lesson Logic](PathPage-Next-Lesson-Logic.md) before changing `/path`.
6. Read [Train Error Reinforcement Mode](Train-Error-Reinforcement-Mode.md) before changing train reinforcement behavior.
7. Read [Train Section Architecture](Train-Section-Architecture.md) before changing `/train` routes or APIs.
8. Read [Spaced Repetition Upgrade Plan](Spaced-Repetition-Upgrade-Plan.md) for scheduler model changes.
9. Read [Game Imports and Training Plan Guide](Game-Imports-Guide.md) for `/games` UX changes.
10. Read [Game Import Service Architecture](Game-Import-Service-Architecture.md) for `/games` backend changes.
11. Read [Training Queue Guide](Training-Queue-Guide.md) for games training prioritization.

### Debugging Issues
1. Check [Troubleshooting Guide](Troubleshooting-Guide.md).
2. Review [Testing Strategy](Testing-Strategy.md).

### Making Changes
1. Preserve variant compatibility and navigation invariants.
2. Update Chess.js mocks when adding move-dependent tests.
3. Follow [React Effect & Data Fetching Guide](React-Effect-Data-Fetching-Guide.md) for effect usage.
4. Validate `/path` logic against [PathPage and Next Lesson Logic](PathPage-Next-Lesson-Logic.md).
5. Validate train reinforcement behavior with [Train Error Reinforcement Mode](Train-Error-Reinforcement-Mode.md).
6. Validate `/train` contracts with [Train Section Architecture](Train-Section-Architecture.md).
7. Validate scheduler/rating changes with [Spaced Repetition Upgrade Plan](Spaced-Repetition-Upgrade-Plan.md).
8. Validate games UX and backend assumptions with [Game Imports and Training Plan Guide](Game-Imports-Guide.md) and [Game Import Service Architecture](Game-Import-Service-Architecture.md).

## Key Technical Concepts

### LAN (Logical Algebraic Notation)
- Format: `e2e4`, `g1f3`
- Required for move path compatibility logic

### Variant Compatibility
- Variants match by exact LAN path
- Incompatible edits trigger variant switching/creation behavior

### Navigation Flow
- Navigation helpers update variants and board context together
- Move-path reconstruction is central for deterministic selection

---

Update these docs whenever route behavior, data contracts, or architecture changes.
