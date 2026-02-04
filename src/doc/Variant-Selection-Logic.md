# Variant Selection Logic Documentation

## Overview

The variant selection system manages how chess opening variants are chosen and switched as users navigate through move trees. This is a critical component that ensures the UI shows the most relevant variant at any given position.

## Core Principle

**Keep the selected variant when the current tree is compatible with it. Switch variants only when the tree is no longer compatible, choosing the first compatible variant.**

## Algorithm Details

### 1. Compatibility Check

```typescript
const isVariantCompatibleWithPath = (variant: Variant, movePath: string[]): boolean => {
  if (variant.moves.length < movePath.length) return false;
  return movePath.every((moveLan, index) => variant.moves[index].getMove().lan === moveLan);
};
```

- Uses LAN (Logical Algebraic Notation) for move comparison
- Ensures variant has enough moves to cover the path
- Checks each move in sequence for exact match

### 2. Path Building

The system uses `buildMovePath` from the common package to create move paths:

```typescript
const movePath = buildMovePath(nodeToEvaluate).map(move => move.lan);
```

This creates an array of LAN strings representing the path from root to current position.

### 3. Variant Selection Priority

1. **Current Variant First**: Check if the currently selected variant is still compatible
2. **Find First Compatible**: If current is incompatible, find the first variant that matches the path
3. **Fallback to First**: If no compatible variant exists, select the first available variant
4. **Create New**: When adding moves, create new variants if no compatible variant exists

### 4. Automatic Switching Scenarios

#### Moving to Incompatible Position
```
Current: Selected variant for "1.e4 e5 2.Nf3"
Move to: Position after "1.d4"
Result: Switch to variant compatible with d4 opening
```

#### Adding Incompatible Move
```
Current: Selected variant for "1.e4 e5" (Spanish opening line)
Add: "2.f4" (King's Gambit)
Result: Create new variant starting with "1.e4 e5 2.f4"
```

## Implementation Functions

### `updateVariants(targetNode?: MoveVariantNode)`

Triggered by all navigation functions:
- `executeMove()` - when making a move
- `prev()` - when going back
- `next()` - when going forward
- `goToMove()` - when jumping to specific position

### `findBestVariantForNode(variants: Variant[], targetNode?: MoveVariantNode)`

Core logic for variant selection:
1. Build move path for target position
2. Check current variant compatibility
3. Search for first compatible variant
4. Return best match or null

## Edge Cases Handled

### Empty Repertoire
- When no variants exist, system gracefully handles null states
- First move creates the initial variant

### Multiple Compatible Variants
- System selects the **first** compatible variant (deterministic behavior)
- Order of variants in array matters

### Variant Creation
- New variants are automatically created when adding incompatible moves
- Maintains proper parent-child relationships in move tree

## Testing Considerations

The variant selection logic is thoroughly tested with scenarios including:
- Exact path matches
- Partial path compatibility (variant longer than current path)
- Incompatible moves requiring variant switching
- Empty repertoires and first move scenarios
- Complex opening sequences

## Debugging Tips

### Common Issues
1. **LAN vs SAN confusion**: Always use LAN for path comparison
2. **Mock data**: Ensure test mocks include proper `lan` properties
3. **Path building**: Verify `buildMovePath` returns correct sequence

### Debug Helpers
```typescript
// Log current variant and path
console.log('Selected variant:', selectedVariant?.name);
console.log('Current path:', buildMovePath(currentMoveNode).map(m => m.lan));
console.log('All variants:', variants.map(v => v.name));
```

## Future Considerations

- Could implement "smart" variant selection based on user preferences
- Might add variant priority/weighting system
- Consider caching path calculations for performance
- Could add variant "locking" to prevent automatic switching