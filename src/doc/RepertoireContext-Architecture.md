# RepertoireContext Architecture Guide

## Overview

The RepertoireContext is the core state management system for chess opening repertoires in the Chess Opening Master application. It has been refactored from a single large file into a modular directory structure for better maintainability.

## Directory Structure

```
packages/frontend/src/contexts/RepertoireContext/
├── index.ts              # Clean exports for external usage
├── types.ts              # TypeScript type definitions
├── utils.ts              # Utility functions (currently minimal)
└── RepertoireContext.tsx # Main context implementation
```

### Key Files

#### `index.ts`
Provides clean exports for the refactored context:
```typescript
export { RepertoireContextProvider, useRepertoireContext } from './RepertoireContext';
export type { RepertoireContextType } from './types';
```

#### `RepertoireContext.tsx`
Contains the main context provider implementation with:
- State management for chess repertoires and variants
- Move navigation logic (executeMove, prev, next, goToMove)
- Variant selection algorithm
- Auto-save functionality
- PGN generation

#### `types.ts`
Defines TypeScript interfaces and types used throughout the context.

## Core Functionality

### Variant Selection Algorithm

The variant selection follows a specific priority system:

1. **Keep Current Variant**: If the current tree is compatible with the selected variant, keep it
2. **Switch to Compatible**: If incompatible, find the first compatible variant
3. **Create New**: If no compatible variant exists, create a new one

### Key Functions

#### `isVariantCompatibleWithPath(variant: Variant, movePath: string[])`
Determines if a variant is compatible with a given move path using LAN notation.

#### `findBestVariantForNode(variants: Variant[], targetNode?: MoveVariantNode)`
Finds the most appropriate variant for a given position using the `buildMovePath` function.

#### `updateVariants(targetNode?: MoveVariantNode)`
Updates variant selection when navigating to different positions.

## Integration Points

### Dependencies
- `@chess-opening-master/common` for MoveVariantNode and utility functions
- `chess.js` for move validation and chess logic
- React hooks for state management

### Usage Pattern
```typescript
// In component
const {
  variants,
  selectedVariant,
  currentMoveNode,
  executeMove,
  addMove,
  prev,
  next
} = useRepertoireContext();
```

## Navigation Flow

All navigation methods (`executeMove`, `prev`, `next`, `goToMove`) follow this pattern:
1. Update position state
2. Call `updateVariants()` with target node
3. Trigger auto-save if enabled

## Important Notes

- Always use the directory exports from `index.ts`
- The `buildMovePath` function from common package is crucial for variant matching
- LAN (Logical Algebraic Notation) is used for move path compatibility checking
- Variant selection happens automatically during navigation

## Migration Notes

When refactoring from single file:
1. Maintain all existing functionality
2. Preserve original variant selection logic
3. Ensure proper exports in index.ts
4. Update all import statements in consuming components