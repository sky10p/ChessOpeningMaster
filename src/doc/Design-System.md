# Design System

ChessKeep uses a lightweight, token-based design system with CVA component variants, a three-level elevation palette, and full dark/light theme support. The system is intentionally opinionated to ensure visual consistency across all pages.

For the mandatory frontend consistency workflow, see `UI-Consistency-Governance.md`.

---

## 1. Theming

### Dark / Light Mode

The active theme is controlled by the class on `<html>`. It's persisted to `localStorage` under the key `chess-theme` and applied via `hooks/useTheme.ts`. An inline `<script>` in `index.html` reads the stored value before the first paint to prevent flash.

```html
<!-- dark (default) -->
<html lang="en" class="dark">

<!-- light -->
<html lang="en" class="light">
```

CSS custom properties are defined in `packages/frontend/src/theme.css`:

```css
:root, .light { /* light theme tokens - cool slate base */ }
.dark         { /* dark theme overrides - slate-950 base */ }
```

Tailwind resolves every `bg-page`, `text-text-base`, `shadow-surface`, etc. through `var(--*)` helpers in `tailwind.config.js`.

### Personality

| Aspect | Value | Rationale |
|---|---|---|
| **Primary / Brand** | Blue (`#60a5fa` dark · `#2563eb` light) | Clear, actionable; distinct from neutral gray throughout both themes |
| **Accent** | Amber/Gold (`#f2b84b` dark · `#c58a1d` light) | Matches the ChessKeep logo gold tone |
| **Page base** | `#0b1220` dark · `#f7f8fa` light | Deep navy dark / cool off-white — never pure black or pure white |
| **Surfaces** | `#10192b` dark · `#ffffff` light | White cards contrast clearly against the cool-gray page in light mode |

---

## 2. Token Reference

Every colour class in the application **must** use one of the semantic tokens below. Hard-coded Tailwind colours (`bg-gray-900`, `bg-blue-600`, etc.) are **forbidden** in new code.

### Backgrounds - three-level elevation

| Token class | Dark value | Light value | Purpose |
|---|---|---|---|
| `bg-page` | `#0b1220` | `#f7f8fa` | Global canvas |
| `bg-page-subtle` | `#0f172a` | `#eef2f6` | Aside / split-screen backgrounds |
| `bg-surface` | `#10192b` | `#ffffff` | Cards, panels, modals |
| `bg-surface-raised` | `#162236` | `#f1f4f8` | Nested / inner raised surface |
| `bg-interactive` | `#1d2a40` | `#e7edf5` | Hover states, input bg, filter chips |
| `overlay` | `rgba(2,6,23,0.7)` | `rgba(15,23,42,0.45)` | Modal scrims |

### Borders

| Token class | Dark | Light |
|---|---|---|
| `border-border-default` | `#243247` | `#d7dee8` |
| `border-border-subtle` | `#182335` | `#e6ebf2` |
| `border-border-strong` | `#31445d` | `#b7c3d4` |

### Text - WCAG AA verified (light mode)

| Token class | Dark | Light | Contrast on white |
|---|---|---|---|
| `text-text-base` | `#e5eefb` | `#0f172a` | **18.1 : 1** |
| `text-text-muted` | `#bfd0e6` | `#334155` | **7.1 : 1** |
| `text-text-subtle` | `#7f95b2` | `#64748b` | **4.7 : 1** |
| `text-text-on-brand` | `#081120` | `#ffffff` | - (on brand bg) |

### Brand / Action

| Token class | Dark | Light |
|---|---|---|
| `bg-brand` | `#60a5fa` (blue-400) | `#2563eb` (blue-600) |
| `bg-brand-hover` | `#93c5fd` (blue-300) | `#1d4ed8` (blue-700) |
| `bg-brand-subtle` | `rgba(96,165,250,0.16)` | `rgba(37,99,235,0.1)` |
| `bg-brand-soft` | `rgba(96,165,250,0.22)` | `#dbeafe` (blue-100) |
| `bg-accent` | `#f2b84b` | `#c58a1d` |
| `bg-accent-hover` | `#f7c86b` | `#a96f05` |

### Semantic Feedback

| Token | Dark | Light |
|---|---|---|
| `bg-danger` | `#fb923c` (orange-400) | `#c2410c` (orange-700) |
| `bg-danger-subtle` | `rgba(251,146,60,0.16)` | `#ffedd5` (orange-100) |
| `bg-success` | `#4ade80` (green-400) | `#15803d` (green-700) |
| `bg-warning` | `#f59e0b` (amber-500) | `#b45309` (amber-700) |
| `bg-info` | `#38bdf8` (sky-400) | `#0369a1` (sky-700) |

### Shadows - CSS variable backed, theme-aware

| Token class | Dark | Light |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(2,6,23,0.5)` | `0 1px 2px rgba(15,23,42,0.06)` |
| `shadow-surface` | `0 14px 28px rgba(2,6,23,0.38)` | `0 12px 30px rgba(15,23,42,0.07)` |
| `shadow-elevated` | `0 24px 56px rgba(2,6,23,0.55)` | `0 20px 48px rgba(15,23,42,0.12)` |

> Shadows are defined as CSS variables (`--shadow-sm`, `--shadow-surface`, `--shadow-elevated`) and resolve automatically per theme. Never hardcode `rgba` shadow values in components.

### Utility class `.surface-card`

A convenience component class defined in `@layer components`:

```css
.surface-card {
  @apply bg-surface border border-border-subtle rounded-xl;
  box-shadow: var(--shadow-surface);
}
```

Use this for standalone cards that need the correct shadow + border + background across both themes.

---

## 3. Component Catalogue

All primitives live in `packages/frontend/src/components/ui/`. Import from the barrel:

```ts
import {
  Button, IconButton, Badge, Checkbox, Card,
  PageHeader, SectionHeader, StatStrip, ListRow,
  Tabs, TabButton, Input, Textarea, Select,
  EmptyState, Tooltip, MetricTitle,
} from "../../components/ui";
```

### 3.1 `Button`

```tsx
<Button intent="primary" size="md" onClick={handler}>Label</Button>

// with loading spinner
<Button intent="primary" loading={isSubmitting}>Submit</Button>

// full-width
<Button intent="secondary" className="w-full justify-center">Reset</Button>
```

**`intent` options:** `primary` · `secondary` · `danger` · `ghost` · `accent` · `outline`

**`size` options and approximate tap heights:**

| Size | Height | Use case |
|---|---|---|
| `xs` | ~26px | Non-interactive chips, counters (avoid as tap target) |
| `sm` | ≥34px | Secondary/tertiary actions in dense cards |
| `md` | ≥40px | Default for most page-level actions |
| `lg` | ≥48px | Primary CTAs, hero buttons |
| `xl` | ≥52px | Full-width CTA rows |

Rule: primary CTAs (e.g. **Train**, **Save**, **Confirm**) must use `size="md"` or larger. `size="sm"` is reserved for secondary/tertiary actions inside compact cards.

### 3.2 `IconButton`

```tsx
<IconButton label="Remove item" onClick={handler}>
  <XMarkIcon className="h-4 w-4" />
</IconButton>
```

Always provide a `label` prop for accessibility. Uses `ghost` intent by default. Renders at **36×36px** (`h-9 w-9`) — the minimum safe touch target for finger-precision interaction.

### 3.3 `Badge`

```tsx
<Badge variant="brand">New</Badge>
<Badge variant="danger" size="sm">Error</Badge>
```

**`variant` options:** `default` · `brand` · `success` · `warning` · `danger` · `info` · `accent`

**`size` options:**

| Size | Text | Use case |
|---|---|---|
| `sm` | 12px (`text-xs`) | Dense metadata chips (status, mastery, counts) |
| `md` | 12px (`text-xs`) | Default in-line badges |
| `lg` | 14px (`text-sm`) | Summary row chips, hero stats |

### 3.4 `Card`

```tsx
<Card padding="default" elevation="raised">
  <p>Content</p>
</Card>

// interactive (hover ring)
<Card interactive padding="compact">
  <p>Clickable content</p>
</Card>
```

**`padding` options:** `none` · `compact` · `default` · `relaxed`

**`elevation` options:** `flat` · `raised` · `high`

### 3.5 `PageHeader`

```tsx
<PageHeader
  eyebrow="Repertoire"
  title="Italian Game"
  description="Primary page summary."
  secondaryActions={<Button intent="secondary">Open editor</Button>}
  primaryAction={<Button intent="primary">Start review</Button>}
/>
```

Use at the top of all top-level product pages. It is the canonical pattern for title, summary, CTA hierarchy, and compact metadata badges.

### 3.6 `SectionHeader`

```tsx
<SectionHeader
  title="Variants"
  description="Line-level actions."
  action={<Badge variant="brand">12 total</Badge>}
/>
```

Use inside cards and sections to introduce a content block with one supporting action or summary.

### 3.7 `StatStrip`

```tsx
<StatStrip
  items={[
    { label: "Due variants", value: 4, tone: "warning", detail: "Ready now" },
    { label: "Mistakes", value: 2, tone: "danger" },
  ]}
/>
```

Use for compact top-of-page KPI rows. Keep it to four items by default.

### 3.8 `ListRow`

```tsx
<ListRow
  title="Italian Game: Main Line"
  description="Due now. 2 active errors."
  meta={<Badge variant="warning">Needs work</Badge>}
  actions={<Button intent="secondary" size="sm">Train variant</Button>}
/>
```

Use for mobile-first collections, queue items, and action-oriented rows. Prefer it over ad-hoc bordered row markup.

### 3.9 `Tabs` + `TabButton`

```tsx
<Tabs variant="underline">
  {tabs.map((tab) => (
    <TabButton
      key={tab.id}
      variant="underline"
      active={selectedTab === tab.id}
      onClick={() => setSelectedTab(tab.id)}
    >
      {tab.label}
    </TabButton>
  ))}
</Tabs>
```

**`variant` options:** `underline` · `pill` · `segment`

### 3.10 `Checkbox`

```tsx
<label className="inline-flex items-center gap-2">
  <Checkbox checked={checked} onChange={handler} />
  Keep me signed in
</label>
```

Use `Checkbox` for inline boolean controls. Wrap it in a `<label>` when the text should be part of the click target.

### 3.11 `Input` + `Textarea`

```tsx
<Input
  label="Opening"
  placeholder="e.g. Sicilian"
  value={value}
  onChange={handler}
/>

// with error state
<Input
  label="Username"
  error
  errorMessage="Username is required"
  value={value}
  onChange={handler}
/>

<Textarea label="Notes" rows={4} value={value} onChange={handler} />
```

**`size` options:**

| Size | Height | Text | Use case |
|---|---|---|---|
| `sm` | ~36px | 14px | Compact filter bars, inline forms |
| `md` | ~40px | 14px | Default form fields |
| `lg` | ~48px | 16px | Full-page forms, login screens |

```tsx
<Select label="Color" value={orientation} onChange={handler}>
  <option value="all">All</option>
  <option value="white">White</option>
  <option value="black">Black</option>
</Select>
```

**`size` options:** `sm` · `md` · `lg` (same height scale as `Input`)

---

## 3a. Touch Target Guidelines

All interactive elements must meet these minimum sizes for reliable finger-precision interaction:

| Guideline | Minimum tap target |
|---|---|
| Apple HIG | 44 × 44pt |
| Material Design (comfortable) | 48 × 48dp |
| WCAG 2.5.5 (AAA) | 44 × 44px |
| WCAG 2.5.8 (AA, 2.2) | 24 × 24px |
| **This codebase** | **≥ 36px on the short axis for dense UI; ≥ 40px for primary CTAs** |

Practical rules:
1. **Primary CTAs** (`Train`, `Save`, `Confirm`, `Submit`) → `size="md"` minimum (≥40px).
2. **Secondary actions** inside compact cards → `size="sm"` acceptable (≥34px), with ≥4px gap between adjacent targets.
3. **IconButton** renders at `h-9 w-9` (36px). Never reduce below this for touch UI.
4. **Tab bars** — `TabButton variant="underline"` is already ≥44px; `pill` and `segment` are ≥36px.
5. Increase sizes to `md`/`lg` in standalone page contexts (forms, modals, dialogs) where vertical space is not the constraint.

---

```tsx
<EmptyState
  icon={FolderIcon}
  title="No studies found"
  description="Create a study or adjust filters."
/>

<EmptyState
  variant="inline"
  title="Loading..."
  description="Fetching your next lesson."
/>
```

Use `EmptyState` for loading, empty, and lightweight error surfaces instead of ad-hoc text blocks.
Use `variant="card"` for standalone panels and `variant="inline"` for embedded list or tab states.
It accepts an optional `icon` and `action`.

### 3.10 `Tooltip`

Use `Tooltip` for short explanatory help attached to badges or compact metrics when the visible label is ambiguous.

```tsx
<Tooltip
  content={
    <span className="block space-y-1">
      <span className="block font-semibold text-text-base">Due mistakes</span>
      <span className="block text-text-muted leading-snug">
        Scheduled mistake review prompts; not the same as the red error-variant count.
      </span>
    </span>
  }
>
  <Badge variant="danger" size="sm">11 mistakes</Badge>
</Tooltip>
```

Rules:
- Keep tooltip copy short and explanatory.
- Use tooltips for clarification, not primary content.
- Prefer `Tooltip` over page-local absolute overlays so help content can escape clipped scroll containers safely.
- When the direct child is already focusable (a `<button>`, `<a>`, `<input>`, `<select>`, `<textarea>`, or any element with an explicit `tabIndex`), the wrapper span will **not** add an extra `tabIndex={0}`. This prevents double focus stops. When wrapping non-interactive content (plain `<span>`, `<Badge>`, icons), the wrapper provides keyboard access automatically.

---

## 4. Class Composition Utility

Use `cn()` for all conditional / merged class strings:

```ts
import { cn } from "../../utils/cn";

<div className={cn("base-class", isActive && "active-class", className)} />
```

Never concatenate raw template strings when merging Tailwind classes - `cn()` handles deduplication via `tailwind-merge`.

---

## 5. Layout Patterns

### Top-level page frame (canonical)

Use layout primitives from `packages/frontend/src/components/design/layouts`:

- `PageRoot`: route-level scroll container (`bg-page`, `text-text-base`, full-height).
- `PageFrame`: centered max-width frame with responsive horizontal gutters.
- `PageSurface`: elevated page shell for full-height workspace pages.

```tsx
<PageRoot>
  <PageFrame className="h-full max-w-analytics py-4 sm:py-6">
    <PageSurface className="gap-4 border-none bg-transparent shadow-none">
      <PageHeader
        eyebrow="Section label"
        title="Page title"
        description="One-sentence description without trailing period"
        primaryAction={<Button intent="primary" size="md">Primary action</Button>}
        secondaryActions={<Button intent="secondary" size="md">Secondary</Button>}
        meta={<Badge variant="brand" size="sm">Count</Badge>}
      />
      <StatStrip
        items={[
          { label: "KPI one", value: 0, tone: "brand", detail: "Supporting context" },
        ]}
      />
      {/* page content */}
    </PageSurface>
  </PageFrame>
</PageRoot>
```

Rules:
- Default to `PageRoot + PageFrame + PageSurface` on every top-level route page.
- Every top-level page **must** start with `<PageHeader>` immediately inside `<PageSurface>`.
- Follow with `<StatStrip>` when the page has 2–4 meaningful KPI metrics visible at a glance.
- `PageSurface` uses `className="gap-4 border-none bg-transparent shadow-none"` for page-level composition (transparent — does not add its own card chrome).
- Available max-width tokens: `max-w-content` (72rem), `max-w-analytics` (80rem, default for most pages), `max-w-workspace` (90rem, for dense side-by-side layouts).
- Mobile gutters are edge-to-edge by default; `PageHeader` handles own padding with `className` override when needed on mobile.
- Never add a custom page title `<h1>` outside `<PageHeader>`.

### Horizontal scrollers inside workspace pages

Use horizontal card rails only as nested content regions inside a normal vertically scrolling page.

Rules:
- Keep page vertical scroll as the primary desktop scroll behavior.
- Support horizontal movement with drag and trackpad gestures when needed.
- Do not remap mouse-wheel vertical delta into horizontal scrolling for desktop card rails.
- Give the rail its own inner surface (`bg-surface-raised` + subtle border) so cards do not read as floating directly on the page base.
### Page shell

```tsx
<div className="w-full h-full bg-page text-text-base overflow-auto">
  {/* page content */}
</div>
```

### Card grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card padding="default" elevation="raised">...</Card>
</div>
```

### Sticky filter bar

```tsx
<div className="sticky top-0 z-10 rounded-xl border border-border-default bg-surface/95 backdrop-blur p-3 space-y-3">
  {/* filters */}
</div>
```

---

## 6. Pattern Extension Rules

When adding or changing UI patterns:

1. Reuse existing patterns from `components/ui` and this document first.
2. If the same custom pattern appears in two or more locations in touched scope, extract it to a reusable component or hook.
3. If a new reusable pattern is introduced, update this document in the same change with usage guidance.
4. Add or update UI consistency test coverage as defined in `Testing-Strategy.md`.

---

## 7. Icon Rules

Use `@heroicons/react` exclusively. Always import from `24/outline` unless you need a filled variant:

```tsx
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
```

Icon sizes should use Tailwind width/height utilities (`h-4 w-4`, `h-5 w-5`, `h-6 w-6`).

---

## 8. Accessibility Checklist

- Every `<IconButton>` must have a `label` prop (becomes `aria-label`).
- Every `<Tabs>` container renders `role="tablist"`.
- All form inputs from `Input` / `Select` / `Textarea` accept a `label` prop that renders a visible `<label>` (preferred over `placeholder`-only labels).
- Keyboard-only users must be able to activate all interactive elements via `Tab` + `Enter`/`Space`. The Button primitive includes `focus-visible` ring using `ring-brand`.
- Do not suppress the outline on interactive elements globally - the global `focus { outline: none }` in `theme.css` is intentional only for mouse users; `focus-visible` styles remain active.

---

## 9. Definition of Done for New Screens

Before a new page or modal is considered complete, verify:

1. **No hard-coded colours** - all classes use semantic token names from §2.
2. **No raw `<button>` elements** - use `Button` or `IconButton` from the UI library, or an explicit accessible control (e.g. `<TabButton>`).
3. **No raw `<input>` / `<textarea>` / `<select>`** - use `Input`, `Textarea`, or `Select` from the UI library.
4. **Class merging via `cn()`** - no manual string concatenation for dynamic classes.
5. **Both themes tested** - toggle `class="light"` on `<html>` and verify there are no invisible elements.
6. **TypeScript clean** - `yarn front:tsc:noEmits` passes with zero errors.
7. **Tests pass** - `yarn test:frontend` passes.
8. **UI consistency regression coverage** - update/add scenarios from `Testing-Strategy.md` whenever UI consistency behavior changes.

