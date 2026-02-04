# Variant and board synchronization

## Goal

Keep the selected variant when the current tree is compatible with it. Switch variants only when the tree is no longer compatible, choosing the first compatible variant in the available order.

## Definitions

- Current tree: the sequence of moves from the root to the current node.
- Compatible variant: a variant whose initial sequence fully matches the current tree.
- Selected variant: the active variant in the UI and the one used to highlight the next move.

## Selection rules

1. If a selected variant exists and is compatible with the current tree, keep it.
2. If the selected variant is incompatible, pick the first compatible variant.
3. If no compatible variant exists, fall back to the initial variant based on load order.

## Navigation consequences

- Advancing a move recalculates the variant using the target node.
- Going back recalculates the variant using the parent node.
- Jumping to a move from lists or panels recalculates using that node.
- Replacing the root history recalculates using the new root.

## Practical example

- Selected variant: Spanish Opening (starts with e4).
- If the user plays e4, the variant remains selected.
- If the user plays d4, the selected variant becomes incompatible and switches to the first compatible variant with d4.

## Selection priority

The first compatible variant is the first one in the computed variant list for the repertoire.

## Consistency notes

The variant is always evaluated against the target node representing the current position. This prevents changes due to stale state or async board updates.

Move selection highlighting in the variants panel depends on `currentMoveNode` matching by reference with a node in the selected variant moves list. That is why variant recalculation refreshes nodes to keep the highlighted move in sync.
