# CONVENTIONS

How this codebase is structured. Read before editing.

---

## 1. Project overview

DataOrb proto is a Next.js App Router prototype for the DataOrb product surface — Insights Hub (Contact Center, Interaction, Agent Performance) and Learning Hub (Drill, Drill Details, Roleplay wizard). Single page entry at `app/page.jsx` resolves a state-driven router into module pages. Everything is mock data; no backend, no API.

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | `app/` directory; single-file routing via state in `app/page.jsx` |
| Runtime | React 19 | Function components only |
| Language | JavaScript (`.jsx`, `.js`) | TypeScript installed for path/types but `strict: false`, `allowJs: true`. Not migrating yet. |
| Styles | Tailwind v3 + CSS variables | Tokens defined in `app/globals.css`, aliased to Tailwind in `tailwind.config.js` |
| Icons | `lucide-react` + Material Symbols (Outlined) | Material Symbols loaded via stylesheet in `app/layout.jsx` |
| State | `useState` / `useEffect` | No Context, no Redux, no Zustand. Wizard / cross-page state lifted to `app/page.jsx`. |
| Lint / Format | `next lint` (default Next config) | No Prettier, no Storybook |

## 3. Folder structure

```
app/
  layout.jsx              # Root HTML shell, fonts, metadata
  page.jsx                # Single-file router, state for currentPage/nav/wizard/detail
  globals.css             # CSS variable tokens + html/body resets
components/
  <Component>.jsx         # All shared and page-level components, flat
  SideNav/                # Side nav primitive, configs, icons, tokens (sub-system)
  mocks/                  # Mock data (e.g. drillCards.js)
  useMeasuredWidth.js     # Hooks live next to components, prefixed `use`
docs/                     # Specs and audit notes
public/                   # Static assets
```

Rules:
- One folder layer for components — no `ui/`, no `pages/`, no `features/`.
- Hooks alongside components; filename prefixed `use`.
- Mocks under `components/mocks/`.
- Subfolders only when a component has its own ecosystem (`SideNav/` has icons + configs + tokens).

## 4. Naming conventions

| Thing | Style | Example |
|---|---|---|
| Component file | PascalCase | `DrillCard.jsx`, `NewRoleplayPage.jsx` |
| Hook file | camelCase, `use` prefix | `useMeasuredWidth.js` |
| Mock data file | camelCase | `mocks/drillCards.js` |
| Component | PascalCase | `function DrillCard(…)` |
| Hook | camelCase, `use` prefix | `useMeasuredWidth` |
| Constant | SCREAMING_SNAKE_CASE | `DRILL_CARDS`, `EMPTY_ROLEPLAY` |
| Style-object map | `<file-prefix>Styles` | `dcStyles`, `nrStyles`, `dpStyles` |

## 5. File and function size limits

| Limit | Soft | Hard |
|---|---|---|
| Component file | 200 lines | 350 lines |
| Function | 50 lines | — |

Page-level form components (NewRoleplayPage, DrillDetailPage) may exceed the soft limit. When a non-form component approaches the soft limit, extract sub-components or move shared primitives into their own files.

Style objects (the `xxStyles = {...}` block at the bottom) do not count toward function length — they count toward file length.

## 6. Component design rules

- **One component per file**, default-exported.
- **Function components only.** No classes.
- **Composition over configuration.** Prefer `<Card shadow tone="muted">` over `<Card variant="muted-shadow">`.
- **No "potentially useful" optional props.** Add a prop when the second consumer needs it.
- **Rule of three** — extract a shared primitive once 3 callsites repeat the same composition. Until then, inline composition is fine.
- Internal helper components live in the same file, declared after the default export.
- Style objects live at the bottom of the file: `const xxStyles = { … }`.
- JSDoc on the default-exported component is encouraged for non-trivial APIs (Button, Card, PageLayout, StatCard already do this).

## 7. Type safety

- TypeScript is installed but the codebase is `.jsx`. `strict: false` today.
- New files stay `.jsx` until a planned TS migration; don't introduce `.tsx` ad hoc.
- Document component props via JSDoc (`@param {{...}} props`) for non-trivial APIs.
- Never use `any` if you do introduce TS later.

## 8. State management

- **Default to component-local `useState`.**
- **Lift to the nearest common parent** when 2+ siblings need the same value.
- **Lift to `app/page.jsx`** when state must persist across page transitions (wizard fields, drill-detail selection, panel open).
- **No Context** until a 3rd unrelated consumer needs the same state.
- **No external state libraries.** If a feature needs more, escalate before adding a dependency.

## 9. Tokens and styling

- All visual tokens live in `app/globals.css` as CSS custom properties on `:root`.
- Color, typography, surface, and layout tokens are aliased to Tailwind in `tailwind.config.js` so both `style={{ color: "var(--color-text-deep)" }}` and `className="text-text-deep"` work.
- **No hard-coded hex colors, font sizes outside the token scale, or spacing magic numbers** in component files. Reference tokens.
  - Exception: very local pixel values (icon size 8, dot 4, tab underline height 2) that are inherently component-scale, not theme-scale.
- **Inline `style={{...}}` is the default styling pattern** in this codebase. Tailwind classes are used for layout primitives (`flex`, `grid`, `gap-*`, `w-full`) and explicit token aliases (`bg-white`, `text-text-medium`).
- Add a token: add the CSS variable in `app/globals.css`, alias in `tailwind.config.js` if needed, reference from components.

## 10. Imports

Import order (within each file):
1. `react` and React types
2. Third-party packages (`next/*`, `lucide-react`)
3. Local components (`./Card`, `./Button`, `./SideNav/SideNav`)
4. Local hooks (`./useMeasuredWidth`)
5. Mocks (`./mocks/drillCards`)
6. Styles (`./globals.css` — only in `app/layout.jsx`)

- Use **relative imports**. Path alias `@/*` exists in `tsconfig.json` but is not used; don't introduce it.
- Keep import depth at most 2 levels: `../components/Foo` is fine. `../../components/Foo` is acceptable; deeper indicates structural drift.

## 11. Comments

- **Why, not what.** Code already says what.
- One block-comment header on the default export when the API is non-trivial: layout rules, prop contract, gotchas.
- **No line-by-line narration.** No `// click handler`, `// set state`, etc.
- Section dividers (`// ---------- Header ----------`) are allowed inside large composite files (DrillDetailPage uses these).
- Future-promotion notes (e.g. "Promote to a shared `<Pagination>` when a 3rd table appears") are encouraged at callsites that hit a deferred-decision threshold.

## 12. Standard components inventory

| Component | File | Purpose |
|---|---|---|
| `Button` | [components/Button.jsx](components/Button.jsx) | Single primitive with variants `primary | text | icon | ai`. `fullWidth`, `leadingIcon`, `trailingIcon`, `bordered`, `disabled`, `uppercase`. |
| `Card` | [components/Card.jsx](components/Card.jsx) | Surface primitive. `padX`, `padY`, `shadow`, `tone: default | muted | outline`. |
| `StatCard` | [components/StatCard.jsx](components/StatCard.jsx) | Icon + label + value composite. `size: sm | lg`. Optional `trailing` slot + `onAction`. Composes `Card`. |
| `Toggle` | [components/Toggle.jsx](components/Toggle.jsx) | Switch. Controlled (`enabled` + `onChange`) or uncontrolled (`defaultEnabled`). |
| `TabsRow` | [components/TabsRow.jsx](components/TabsRow.jsx) | Shared tab strip. Tabs render `Label (count)` if `count` set, else `Label`. Optional `action` slot. |
| `MultiLineInput` | [components/MultiLineInput.jsx](components/MultiLineInput.jsx) | Capped textarea + live `n/max` counter. |
| `ComingSoon` | [components/ComingSoon.jsx](components/ComingSoon.jsx) | Placeholder for unbuilt routes. Sets document title from `pageName`. |
| `PageLayout` | [components/PageLayout.jsx](components/PageLayout.jsx) | Frame right of `<SideNav>`. Owns horizontal centering, gutters, vertical rhythm, dock-vs-overlay panel logic. |
| `DashboardShell` | [components/DashboardShell.jsx](components/DashboardShell.jsx) | Composes `<SideNav>` + `<PageLayout>`. Used by Insights Hub. |
| `SideNav` | [components/SideNav/SideNav.jsx](components/SideNav/SideNav.jsx) | Config-driven navigation rail. Per-module configs in `SideNav/configs/`. |
| `RoleplayBreadcrumb` | [components/RoleplayBreadcrumb.jsx](components/RoleplayBreadcrumb.jsx) | Two-step breadcrumb for the New Roleplay wizard. |
| `DrillHeader` | [components/DrillHeader.jsx](components/DrillHeader.jsx) | Drill page header card (title + chevron). |

When a deferred composite reaches 3 callsites, promote: `Pagination`, `Chip`, `PillGroup`, `Dropdown`, `IconButton-with-dropdown`.

---

## Layout system summary

Reference for any layout decision.

- **Min viewport width 1260px.** Below is out of scope.
- **Sidebar fixed at 64px.** Never moves.
- **Content max-width: 1068px**, centered inside the main area via `margin-inline: auto`.
- **Minimum gutter 64px** each side at 1260; gutters grow above 1260 as a natural consequence of centering.
- **Right panel:** open at viewport ≥ 1644 → docks alongside content as a centered unit (1068 + 64 gap + 320 panel = 1452). Below 1644 → overlays the right edge of content; content stays at 1068 centered. Mode locked at the moment the panel opens.
- **`min-height: 100vh`** on the root shell only. No other layout container has any `height` rule.
- **Element sizes are fixed** (token-driven). Layout responds; elements do not.
