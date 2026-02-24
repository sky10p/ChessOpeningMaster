# Testing Strategy Documentation

## Overview

The ChessKeep project uses a comprehensive testing strategy with Jest and React Testing Library. This document outlines testing patterns, mock requirements, and specific considerations for the chess domain.

## Test Structure

### Frontend Tests Location
```
packages/frontend/src/contexts/__tests__/
├── RepertoireContext.test.tsx           # Core functionality tests
├── RepertoireContext.variants.test.tsx  # Variant-specific tests
└── RepertoireContext.utils.test.ts      # Utility function tests
```

### Test Categories

#### 1. Core Functionality Tests (`RepertoireContext.test.tsx`)
- Basic context provider functionality
- State management
- Navigation methods
- Auto-save behavior

#### 2. Variant Selection Tests (`RepertoireContext.variants.test.tsx`)
- Variant compatibility logic
- Automatic variant switching
- New variant creation
- Complex navigation scenarios

#### 3. Utility Tests (`RepertoireContext.utils.test.ts`)
- Path compatibility functions
- Edge cases and error handling
- Performance considerations

## Mock Requirements

### Chess.js Mock (`src/__mocks__/chess.js.ts`)

**Critical**: The Chess.js mock must provide complete move objects with LAN notation.

```typescript
// Required mock structure
return { 
  san: move,           // Standard Algebraic Notation
  lan: lanNotation,    // Logical Algebraic Notation (e.g., "e2e4")
  from: "e2",          // Source square
  to: "e4",            // Target square
  piece: 'p',          // Piece type
  color: 'w'           // Color
};
```

#### SAN to LAN Mapping
The mock includes mappings for common test moves:
```typescript
const sanToLan: { [key: string]: string } = {
  'e4': 'e2e4',
  'e5': 'e7e5',
  'Nf3': 'g1f3',
  'Nc6': 'b8c6',
  'Bb5': 'f1b5',
  // ... more mappings
};
```

### Mock Move Creation Helpers

```typescript
const createMove = (san: string, previousSans: string[] = []) => {
  // Creates proper Chess.js move object
};

const createMoveVariantNode = (san: string, previousSans: string[] = []) => {
  // Creates MoveVariantNode with proper move data
};

const createVariant = (moves: { san: string }[], name: string) => {
  // Creates complete variant for testing
};
```

## Key Testing Patterns

### 1. Provider Wrapper Pattern
```typescript
const Provider = createRepertoireProvider("white", initialMoves);
const { result } = renderHook(() => useRepertoireContext(), {
  wrapper: Provider,
});
```

### 2. Async State Updates
```typescript
await waitFor(() => {
  expect(mockGetPositionComment).toHaveBeenCalled();
});

await act(async () => {
  result.current.addMove(move);
});
```

### 3. Navigation Testing
```typescript
// Navigate to specific position
const e4Node = requireMoveNode(
  findRootChildByVariantName(root, "Apertura Española")
);

await act(async () => {
  result.current.goToMove(e4Node);
});
```

## Specific Test Scenarios

### Variant Creation Tests

1. **New variant when incompatible with existing**
   - Setup: Repertoire with e4 and d4 variants
   - Action: Add Nf3 (incompatible with both)
   - Verify: New variant created, selectedVariant updated

2. **Empty repertoire first move**
   - Setup: Empty repertoire
   - Action: Add first move
   - Verify: First variant created

3. **Branching from existing line**
   - Setup: e4-e5 line exists
   - Action: Add e6 instead of e5 after e4
   - Verify: New variant branch created

### Compatibility Testing

1. **Exact path match**
   - Variant: ["e4", "e5", "Nf3"]
   - Path: ["e2e4", "e7e5", "g1f3"]
   - Expected: true

2. **Partial match (variant longer)**
   - Variant: ["e4", "e5", "Nf3", "Nc6"]
   - Path: ["e2e4", "e7e5"]
   - Expected: true

3. **Incompatible path**
   - Variant: ["e4", "e5"]
   - Path: ["d2d4"]
   - Expected: false

### Train Focus / Mistakes Flow

1. **Continuous replay to mistakes**
   - Line: `e4 e5 Cf3 Cc6 Ab5` (`Cf3/Cc6/Ab5` SAN equivalent `Nf3/Nc6/Bb5`)
   - Mistakes at `Cf3` and `Ab5`
   - Expected replay:
     - auto-play `e4`, `e5`
     - user must play `Cf3`
     - auto-play `Cc6`
     - user must play `Ab5`

2. **No false first-step failure**
   - Setup a mistake whose stored start ply is later than the mistake ply
   - Expected: progress should not mark step 1 as failed due to index clamping

3. **Requeue and backtracking**
   - Fail one reinforcement item so it is requeued behind a later item
   - Expected:
     - forward continuation when next target is ahead,
     - reset + replay when requeued target is behind current board position

4. **Three-phase focus loop**
   - variant phase -> mistakes phase -> variant confirm phase
   - Expected:
     - confirm with mistakes returns to mistakes phase,
     - clean confirm ends cycle and opens final rating modal

5. **Final-only save in focus mode**
   - In `mode=mistakes`, entering mistakes phase must not persist `variant-reviews`
   - `variant-reviews` save occurs once after clean confirm completion

6. **Focus progress semantics**
   - Dots must represent only player-color moves from move 1 in the focused variant
   - Expected:
     - current marker advances with auto-replay board progression,
     - failures are mapped by real `mistakePly`,
     - solved previous failures render as orange (not green),
     - initial variant pass errors stay red in that same pass (no immediate orange conversion),
     - no misalignment from mixed-color ply indexing

7. **Focus completion gating**
   - In focus mode, finished state must remain hidden while mistakes/full-run phases or pending focus review are active.

8. **Focus assist gating**
   - Start focus session without errors: hints/available variants are locked.
   - After first error: hints/available variants unlock and remain available during mistakes + full-run confirm.
   - Validate both desktop (`TrainInfo`) and mobile (`HelpInfo`) behavior.
   - Validate inline `Focus Assist` card remains in waiting state before first error.
   - Validate card tabs (`Comentarios`, `Variantes candidatas`) after errors and correct content switch.
   - Validate normal mode keeps persistent panel behavior and focus-only card is not rendered there.

9. **Focus assist inline composition**
   - Focus workspace renders `Focus Assist` as a supplemental card below `Your turn`.
   - Mobile and desktop focus workspaces keep the same inline card behavior.
   - No side-sheet/chip surfaces are rendered in focus mode.

10. **Mastery impact clarity**
   - Mastery card must show understandable before/after context and explicit point delta (gain/loss/no change).

## Mock Data Patterns

### Initial Repertoire Setup
```typescript
const createInitialMoves = () => {
  // Creates a repertoire with:
  // - e4 line (Apertura Española)
  // - d4 line (Queen's Gambit)
  // - Standard responses
};
```

### Move Creation
```typescript
const createMockMove = (san: string, lan: string) => {
  // Creates move compatible with the system
};
```

## Test Execution Commands

```bash
# All tests
yarn test

# Frontend only
yarn test:frontend

# Specific test file
cd packages/frontend
yarn test -- --testPathPattern="RepertoireContext.variants.test.tsx"

# Watch mode
yarn test -- --watch
```

## Common Testing Issues

### 1. Missing LAN Properties
**Problem**: Tests fail because mock moves don't have `lan` property
**Solution**: Update Chess.js mock to include proper LAN notation

### 2. Async State Updates
**Problem**: Tests fail due to race conditions
**Solution**: Use `waitFor` and `act` properly

### 3. Mock Data Inconsistency
**Problem**: Test data doesn't match real chess moves
**Solution**: Use proper SAN-to-LAN mappings in mocks

### 4. Context Provider Setup
**Problem**: useRepertoireContext used outside provider
**Solution**: Always wrap tests with proper provider

## Coverage Requirements

### Minimum Coverage Areas
- [ ] All navigation methods
- [ ] Variant selection logic
- [ ] Move addition/deletion
- [ ] Auto-save functionality
- [ ] Edge cases (empty repertoire, invalid moves)
- [ ] Error handling

### Current Test Count
- **Total Tests**: 49
- **Test Suites**: 3
- **All Packages**: 340+ tests

## Performance Considerations

### Test Optimization
- Use specific test name patterns to run subsets
- Mock expensive operations (PGN generation, large repertoires)
- Avoid unnecessary DOM rendering in unit tests

### Mock Efficiency
- Keep Chess.js mock minimal but complete
- Cache created test data when possible
- Use test-specific data rather than large fixtures
