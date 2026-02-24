# UI Consistency Governance

## Purpose and Scope

This document defines the mandatory UX/UI consistency workflow for frontend work.
It complements `Design-System.md` and does not replace it.

Use this policy for:
- feature implementation,
- refactors,
- UI bug fixes,
- code reviews.

## Non-Negotiable Principles

1. Reuse-first: prefer existing base components and documented patterns before custom markup.
2. Token-first: use semantic design tokens and existing utility patterns; avoid hard-coded visual values when token alternatives exist.
3. Consistency over local optimization: prioritize system coherence instead of one-off local styling wins.
4. Responsive parity: mobile and desktop may differ in layout, but semantic behavior and state meaning must remain aligned.

## Consistency Sweep Protocol (Mandatory)

Trigger:
- any task that touches UI code.

Enforced scope:
- touched files, plus directly related sibling UI components used by the modified screen.

Required sweep checklist:
1. Replace raw controls with UI primitives where applicable (`Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Tabs`, `TabButton`, `Badge`, `Card`).
2. Collapse duplicated styling patterns into reusable abstractions when repetition is present.
3. Align spacing/layout decisions with canonical page and panel framing patterns.
4. Keep copy and interaction states consistent across breakpoints for the same feature.

Stop condition:
- if full cleanup exceeds task scope or risk budget, record explicit follow-up work instead of silently deferring.

## Pattern Decision Tree

1. Existing pattern available in `components/ui` or documented page/layout patterns:
- reuse it.
2. Similar pattern appears in two or more locations in touched scope:
- extract a reusable component or hook.
3. New pattern is genuinely needed:
- add it, then document it in `Design-System.md` in the same change and reference it in implementation notes.

## Reusable Pattern Catalog (Initial)

1. Top-level page framing (`PageRoot` + `PageFrame`; `PageSurface` for workspace pages).
2. Desktop-first gutters (`PageFrame`: no horizontal mobile gutter, adds gutter from `sm`).
3. Section header with optional filter/actions row.
4. State surfaces for loading, empty, and error states.
5. Metrics/stat cards for compact summary blocks.
6. Contextual assist/help panels.
7. Mobile/desktop split composition with shared state contract.

## Anti-Patterns

1. One-off page-only style blocks with no reuse path.
2. Raw buttons/inputs/selects/textareas duplicating existing primitives.
3. Divergent page spacing decisions without documented rationale.
4. Responsive mismatch where the same state has different semantic meaning across breakpoints.

## Definition of Done (UX/UI Additions)

1. Consistency sweep completed in touched scope.
2. No new ad-hoc UI patterns introduced.
3. New reusable abstractions are documented when created.
4. Relevant UI tests are added or updated for changed behavior and composition.
