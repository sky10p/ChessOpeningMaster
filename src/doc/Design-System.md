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

CSS custom properties are defined in `packages/frontend/src/index.css`:

```css
:root, .dark { /* dark theme tokens - slate-900 base */ }
.light       { /* light theme overrides - #eef2f7 base */ }
```

Tailwind resolves every `bg-page`, `text-text-base`, `shadow-surface`, etc. through `var(--*)` helpers in `tailwind.config.js`.

### Personality

| Aspect | Value | Rationale |
|---|---|---|
| **Primary / Brand** | Indigo (`#6366f1` dark · `#4f46e5` light) | Distinctive, modern, matches existing UI hints |
| **Accent** | Amber (`#f59e0b` dark · `#d97706` light) | Matches the ChessKeep logo gold/orange |
| **Page base** | `#0f172a` dark · `#eef2f7` light | Warm dark / cool blue-gray - never pure black or white |
| **Surfaces** | `#1e293b` dark · `#ffffff` light | White cards pop clearly against the cool-gray page in light mode |

---

## 2. Token Reference

Every colour class in the application **must** use one of the semantic tokens below. Hard-coded Tailwind colours (`bg-gray-900`, `bg-blue-600`, etc.) are **forbidden** in new code.

### Backgrounds - three-level elevation

| Token class | Dark value | Light value | Purpose |
|---|---|---|---|
| `bg-page` | `#0f172a` (slate-900) | `#eef2f7` (cool blue-gray) | Global canvas |
| `bg-surface` | `#1e293b` (slate-800) | `#ffffff` (white) | Cards, panels, modals |
| `bg-surface-raised` | `#293548` (slate-750) | `#f8fafc` (slate-50) | Nested / inner raised surface |
| `bg-interactive` | `#334155` (slate-700) | `#e2e8f0` (slate-200) | Hover states, input bg, filter chips |

### Borders

| Token class | Dark | Light |
|---|---|---|
| `border-border-default` | `#334155` (slate-700) | `#cbd5e1` (slate-300) |
| `border-border-subtle` | `#1e293b` (slate-800) | `#e2e8f0` (slate-200) |

### Text - WCAG AA verified (light mode)

| Token class | Dark | Light | Contrast on white |
|---|---|---|---|
| `text-text-base` | `#f1f5f9` (slate-100) | `#0f172a` (slate-900) | **18.1 : 1** |
| `text-text-muted` | `#94a3b8` (slate-400) | `#475569` (slate-600) | **7.1 : 1** |
| `text-text-subtle` | `#64748b` (slate-500) | `#64748b` (slate-500) | **4.7 : 1** |
| `text-text-on-brand` | `#ffffff` | `#ffffff` | - (on brand bg) |

### Brand / Action

| Token class | Dark | Light |
|---|---|---|
| `bg-brand` | `#6366f1` (indigo-500) | `#4f46e5` (indigo-600) |
| `bg-brand-hover` | `#818cf8` (indigo-400) | `#4338ca` (indigo-700) |
| `bg-brand-subtle` | `rgba(99,102,241,0.12)` | `#eef2ff` (indigo-50) |
| `bg-accent` | `#f59e0b` (amber-500) | `#d97706` (amber-600) |
| `bg-accent-hover` | `#fbbf24` (amber-400) | `#b45309` (amber-700) |

### Semantic Feedback

| Token | Dark (pastel) | Light (deep) |
|---|---|---|
| `bg-danger` | `#f87171` (red-400) | `#dc2626` (red-600) |
| `bg-danger-subtle` | `rgba(248,113,113,0.12)` | `#fef2f2` (red-50) |
| `bg-success` | `#34d399` (emerald-400) | `#059669` (emerald-600) |
| `bg-warning` | `#fbbf24` (amber-400) | `#d97706` (amber-600) |

### Shadows - CSS variable backed, theme-aware

| Token class | Dark | Light |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.45)` | `0 1px 3px rgba(15,23,42,0.07)` |
| `shadow-surface` | `0 2px 8px rgba(0,0,0,0.45)` | `0 2px 10px rgba(15,23,42,0.08)` |
| `shadow-elevated` | `0 12px 32px rgba(0,0,0,0.6)` | `0 10px 30px rgba(15,23,42,0.11)` |

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
import { Button, IconButton, Badge, Card, Tabs, TabButton, Input, Textarea, Select } from "../../components/ui";
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

**`size` options:** `xs` · `sm` · `md` · `lg` · `xl`

### 3.2 `IconButton`

```tsx
<IconButton label="Remove item" onClick={handler}>
  <XMarkIcon className="h-4 w-4" />
</IconButton>
```

Always provide a `label` prop for accessibility. Uses `ghost` intent by default.

### 3.3 `Badge`

```tsx
<Badge variant="brand">New</Badge>
<Badge variant="danger" size="sm">Error</Badge>
```

**`variant` options:** `default` · `brand` · `success` · `warning` · `danger` · `info` · `accent`

**`size` options:** `sm` · `md` · `lg`

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

### 3.5 `Tabs` + `TabButton`

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

### 3.6 `Input` + `Textarea`

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

**`size` options:** `sm` · `md` · `lg`

**`state` options:** `default` · `error` · `success`

### 3.7 `Select`

```tsx
<Select label="Color" value={orientation} onChange={handler}>
  <option value="all">All</option>
  <option value="white">White</option>
  <option value="black">Black</option>
</Select>
```

Same `size` and `state` props as `Input`.

### 3.8 `EmptyState`

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
  <PageFrame className="h-full py-0 sm:py-2">
    <PageSurface>{/* page content */}</PageSurface>
  </PageFrame>
</PageRoot>
```

Rules:
- Default to `PageRoot + PageFrame` on top-level route pages.
- Use `PageSurface` for workspace-style pages (`Dashboard`, `Games`, `Path`, `Studies`) that need a framed full-height surface.
- Mobile gutters are edge-to-edge by default (`PageFrame` uses `px-0` on mobile); desktop/tablet adds horizontal gutter from `sm`.
- Do not introduce custom edge-to-edge wrappers unless there is a documented product/layout reason.
- If a different max width is required, set `PageFrame.maxWidthClass` and document the reason in the page architecture doc.
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
- Do not suppress the outline on interactive elements globally - the global `focus { outline: none }` in `index.css` is intentional only for mouse users; `focus-visible` styles remain active.

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

