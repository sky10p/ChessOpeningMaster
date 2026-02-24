# Mobile vs Desktop Component Architecture

## Overview

The repertoire editing page (`EditRepertoirePage`) has two distinct rendering paths: a **mobile path** and a **desktop path**. They share the same data (via context) but use different components tuned for each viewport.

---

## Consistency Rules

### Shared-first policy
- Define shared logic and state contracts first.
- Keep view-specific composition (mobile vs desktop) as a rendering concern.

### Parity contract
- The same feature state must keep the same semantic meaning across breakpoints.
- Layout and density can differ, but message intent, action availability, and state labels must remain aligned.

### Extraction guideline
- If mobile and desktop repeat equivalent behavior/markup patterns, extract shared component or model logic.
- Prefer shared abstractions over duplicated per-breakpoint ad-hoc implementations.

---

## Layout Shell: `RepertoireWorkspaceLayout`

**File:** `packages/frontend/src/pages/repertoires/shared/RepertoireWorkspaceLayout.tsx`

This layout component is the single entry point that decides which slot renders:

```
┌──────────────────────────────────────────────────────┐
│ grid-cols-12                                          │
│                                                       │
│  col-span-6                      col-span-6           │
│  ┌──────────────────┐            ┌─────────────────┐  │
│  │  title + board   │  desktop   │  desktopPanel   │  │
│  │  + boardActions  │  only      │  (RepertoireInfo│  │
│  └──────────────────┘            │  full panel)    │  │
│                                  └─────────────────┘  │
│  col-span-12 (mobile only, sm:hidden)                 │
│  ┌─────────────────────────────────────────────────┐  │
│  │  mobilePanel (tab-selected content)             │  │
│  └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Key constraints
- Mobile panel: `max-h-[70vh] overflow-auto` — allows internal scroll without the panel growing unbounded.
- Desktop panel: `overflow-auto` — scrolls the full `RepertoireInfo` panel.
- Both slots receive identical board section on the left.

---

## Mobile Architecture

### Tab navigation
The `Footer` component (visible only on `md:hidden`) provides 4 tab icons. The active tab is tracked via `panelSelected` state in `EditRepertoireViewContainer`:

| Tab key      | Label       | Component rendered                         |
|--------------|-------------|--------------------------------------------|
| `variants`   | Variants    | `<VariantsInfo />`                         |
| `comments`   | Comments    | `<BoardCommentContainer />`                |
| `statistics` | Statistics  | `<StatisticsPanel fen={chess.fen()} />`    |
| `stockfish`  | Stockfish   | `<StockfishPanel fen={chess.fen()} numLines={3} />` |

### Mobile-specific panel components
These exist at `packages/frontend/src/components/design/`:

#### `statistics/StatisticsPanel.tsx`
- Masters / Lichess source toggle in header bar
- Rating filter using `<label>` + `<input type="checkbox">` chips — same pattern as desktop `StatisticsSubpanel`
- Table: move name / games% / `ResultBar` + colored win-draw-loss percentages
- Spinning loader state, error state, empty state

#### `stockfish/StockfishPanel.tsx`
- Header bar with depth progress bar and elapsed time
- Color-coded evaluation column (green → neutral → red)
- First move pill highlighted with `bg-brand/20` (matches `StockfishSubpanel` desktop)
- Empty calculating state

### Design rules for mobile panels
- No outer padding wrapper — the panel fills the container edge-to-edge
- Header always `bg-surface-raised border-b border-border-default`
- Content area `bg-surface`
- No fixed `h-full` — height is natural/intrinsic so the scroll container in `RepertoireWorkspaceLayout` controls overflow

---

## Desktop Architecture

### `RepertoireInfo` (container)
**File:** `packages/frontend/src/components/application/chess/board/RepertoireInfo.tsx`

Renders `RepertoireInfoPanel`, which is the full desktop panel with all features visible simultaneously via toggle switches (no tab bar).

### `RepertoireInfoPanel`
**File:** `packages/frontend/src/components/design/chess/RepertoireInfoPanel/RepertoireInfoPanel.tsx`

Contains three sub-panels shown/hidden by `UiSwitch` toggles in a sticky header:

| Toggle    | Sub-panel component        | Location                            |
|-----------|----------------------------|-------------------------------------|
| Engine    | `StockfishSubpanel`        | `RepertoireInfoPanel/StockfishSubpanel.tsx`   |
| Stats     | `StatisticsSubpanel`       | `RepertoireInfoPanel/StatisticsSubpanel.tsx`  |
| Notes     | `BoardComment`             | `design/chess/BoardComment.tsx`     |

Plus the always-visible `VariantMovementsSubpanel` for move list navigation.

### Desktop-specific sub-panel components
These live inside `RepertoireInfoPanel/` and are **not** reused on mobile:

#### `StockfishSubpanel.tsx`
Same data as `StockfishPanel` but embedded inline within the panel — no own header, inherits the panel's `UiSwitch` toggle.

#### `StatisticsSubpanel.tsx`
Same data as `StatisticsPanel` — compact source toggle buttons + rating checkboxes, no header.

---

## Shared components

| Component                | Used by                      | Purpose                          |
|--------------------------|------------------------------|----------------------------------|
| `statistics/ResultBar`   | Both panels                  | Win/draw/loss color bar          |
| `BoardComment`           | Desktop panel + mobile tab   | Notes textarea                   |
| `useStockfish` (hook)    | Both stockfish components    | Stockfish engine wrapper         |
| `UiSwitch`               | Desktop panel header         | Toggle switches for sub-panels   |
| `StockfishLabel`         | Desktop panel (UiSwitch label) | Engine icon + depth badge      |

---

## Data flow

```
RepertoireContext (chess, fen, variants, comment...)
        │
        ├── EditRepertoireViewContainer
        │       │
        │       ├── [mobile] panelSelected state
        │       │       ├── StatisticsPanel   ← fetches Lichess API directly
        │       │       ├── StockfishPanel    ← useStockfish(fen, numLines)
        │       │       ├── BoardCommentContainer ← reads/writes comment via context
        │       │       └── VariantsInfo      ← reads variant list from context
        │       │
        │       └── [desktop] RepertoireInfo
        │               └── RepertoireInfoPanel
        │                       ├── StockfishSubpanel   ← useStockfish(via parent)
        │                       ├── StatisticsSubpanel  ← fetches Lichess API directly
        │                       ├── BoardComment        ← reads/writes comment
        │                       └── VariantMovementsSubpanel ← reads variant from context
```

---

## Adding a new mobile panel tab

1. Add a new `FooterSection` union member in `EditRepertoireViewContainer`.
2. Register a new `addIconFooter` call with the new key, label, and icon.
3. Add a new `{panelSelected === "myPanel" && <MyPanel />}` branch in `mobilePanel`.
4. Create `MyPanel` in `packages/frontend/src/components/design/<domain>/MyPanel.tsx` following:
   - No outer padding — edge-to-edge
   - `bg-surface-raised` header bar with icon + title
   - `bg-surface` content area
   - No `h-full` on the root element

---

## Adding a new desktop sub-panel

1. Create `MySubPanel.tsx` inside `RepertoireInfoPanel/`.
2. Add a `myPanelEnabled` state + `UiSwitch` in the `RepertoireInfoPanel` header.
3. Render `{myPanelEnabled && <div className="p-3 border-t border-border-default bg-surface"><MySubPanel /></div>}`.
