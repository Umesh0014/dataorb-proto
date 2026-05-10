# SideNav — Canonical Spec

This document is the source of truth for the 64-pixel side navigation rail
shared by every module in the DataOrb platform: **Insights Hub**, **Learning
Hub**, **Ask Mira**, **Coaching**.

The implementation lives at `components/SideNav/`. The Learning Hub rail was
the visual reference; this spec freezes its measurements and behaviors so no
module can drift.

## Anatomy

Top-to-bottom, vertically stacked inside a 64 px fixed-position rail:

1. **Brand mark slot** — 64 px tall slot with the dataOrb logo (28 × 28)
   centered.
2. **App switcher trigger** — single 40 × 40 button rendering the 3×3 dot
   icon. Owns only the trigger; the popover (see "9-dot app switcher") is an
   external, unchanged dependency.
3. **Divider** — 32 × 1 px line, 12 px vertical margin above and below.
4. **Module section** — vertical stack of 40 × 40 icon buttons. Items come
   from the per-module config.
5. **Spacer** — `flex: 1`, pushes the footer to the bottom.
6. **Footer group** — Help → Settings → Avatar, in that order.

## 9-dot app switcher

The 9-dot menu (`components/AppSwitcherPopover.jsx`) keeps its public
behavior, contents, animation, and routing unchanged. Internally it now
consumes the same `RailFlyout` primitive the per-icon sub-menus use, so
panel motion + surface + dismissal stay aligned across every flyout off
the rail. The switcher's external API (`open`, `onClose`, `anchorRef`,
`currentPage`, `onSelectPage`) is unchanged.

SideNav owns:

- The trigger button (3×3 icon, 40 × 40, 8 px radius, hover/focus states).
- Forwarding `appSwitcherTriggerRef` so the popover can anchor itself.
- Calling `onAppSwitcherClick` to toggle the popover.

SideNav does **not** own:

- The popover's item list, copy, or routing decisions.
- The Insights ↔ Learning ↔ Ask Mira navigation behavior the popover drives.

When Ask Mira and Coaching come online they will surface inside the
existing popover via `AppSwitcherPopover`'s own item list — no SideNav
change needed.

## RailFlyout primitive

`components/SideNav/RailFlyout.jsx` is the shared popover primitive used by
**both** the 9-dot app switcher and per-icon sub-menus. It owns:

- Anchor positioning relative to the rail.
- Enter/exit motion (`scale + opacity`, 150 ms ease-out).
- Surface treatment (white, radius-xl, shadow, 12 px padding).
- Click-outside dismissal.
- `Escape` dismissal.

It does **not** own its content. Consumers pass children. A companion
`<RailFlyoutItem>` renders the canonical pill row (used by both the app
switcher and the sub-menus) so item styling is identical across flyouts.

Do not duplicate this primitive — extend it.

## Dimensions and spacing

| Token                               | Value             |
| ----------------------------------- | ----------------- |
| Rail width                          | 64 px             |
| Rail vertical padding               | 16 px top/bot     |
| Brand slot height                   | 64 px             |
| Brand logo size                     | 28 × 28 px        |
| App switcher button                 | 40 × 40 px        |
| App switcher radius                 | 8 px              |
| Module icon button                  | 40 × 40 px        |
| Module icon button radius           | 20 px (full pill) |
| Module item gap                     | 8 px              |
| Footer item gap                     | 4 px              |
| Avatar                              | 32 × 32 px        |
| Avatar radius                       | 16 px (circle)    |
| Avatar margin-top                   | 8 px              |
| Divider                             | 32 × 1 px, margin 12 px |
| Icon glyph                          | 22 × 22 px        |

## Color tokens

| Token                    | Hex / value                             | Used for                                   |
| ------------------------ | --------------------------------------- | ------------------------------------------ |
| `rail.bg`                | `#EFEEF6`                               | Rail background                            |
| `rail.border`            | `#E4E2EE`                               | Right border + divider color               |
| `state.bgDefault`        | `transparent`                           | Idle button background                     |
| `state.bgHover`          | `#E4E2EE`                               | Hovered icon button                        |
| `state.bgActive`         | `#DDD9EC`                               | Active module item                         |
| `state.iconColor`        | `#1F2440`                               | Module + footer icon glyphs                |
| `state.appSwitcherColor` | `#3A3F58`                               | App switcher glyph (slightly muted)        |
| `state.focusRing`        | `0 0 0 2px #FFFFFF, 0 0 0 4px #004BEF`  | Keyboard focus on every interactive button |
| `avatar.bg`              | `#1B92A6`                               | Avatar fill                                |
| `avatar.fg`              | `#FFFFFF`                               | Avatar initial                             |
| `tooltip.bg`             | `#1F2937`                               | Tooltip bubble                             |
| `tooltip.fg`             | `#FFFFFF`                               | Tooltip text                               |

No color values may be hard-coded inside a module's config. All values come
from `components/SideNav/tokens.js`.

## State matrix

| State              | Module item                       | App switcher trigger        | Footer item                 |
| ------------------ | --------------------------------- | --------------------------- | --------------------------- |
| Default            | bg `transparent`, icon `#1F2440`  | bg `transparent`, icon `#3A3F58` | bg `transparent`, icon `#1F2440` |
| Hover              | bg `#E4E2EE`                      | bg `#E4E2EE`                | bg `#E4E2EE`                |
| Active (selected)  | bg `#DDD9EC`, `aria-current="page"` | n/a (transient trigger)   | n/a                         |
| Focus-visible      | focus ring on top of current bg   | focus ring                  | focus ring                  |
| Disabled           | reduce icon opacity to 40 %, no hover bg, `aria-disabled="true"` | same | same |

Transitions: `background 150ms ease, box-shadow 150ms ease` on every
interactive element.

## Tooltip behavior

- Triggered on `mouseenter` and `focus`.
- Delay: **300 ms** before show; instant hide on `mouseleave` or `blur`.
- Placement: right of the trigger, `8 px` offset, vertically centered.
- Copy: matches `item.label` verbatim.
- Bubble: `#1F2937` background, white 12 px medium-weight text, 6 px radius,
  drop shadow `0 2px 6px rgba(0,0,0,0.15)`, `pointer-events: none`,
  `role="tooltip"`.
- Dismissal: hover-out, blur, or unmount.

## Accessibility

- Wrapper renders as `<aside role="navigation" aria-label="<Module> side
  navigation">`.
- Module items render inside `<ul role="list">` / `<li>`.
- Each interactive element is a real `<button type="button">`.
- App switcher trigger carries `aria-haspopup="menu"`.
- The selected module item carries `aria-current="page"`.
- Tooltips render with `role="tooltip"` and `pointer-events: none`.
- Keyboard order, top to bottom: app switcher → each module item in array
  order → help → settings → avatar. Tab moves between buttons; Enter/Space
  activates.
- Focus indication is always visible via the focus ring described above.
- Decorative SVGs use `aria-hidden="true"` and `focusable="false"`.
- Notification dot uses `aria-hidden="true"`; semantic notification state, if
  needed, must be supplied separately by the consuming module.

## Per-module config contract

```ts
type SideNavChild = {
  id: string;                              // stable child identifier
  label: string;                           // visible label inside the flyout
  route?: string;                          // navigation target
};

type SideNavItem =
  | {
      // Direct nav variant
      id: string;
      label: string;
      Icon: (p: { size: number; color: string }) => JSX.Element;
      route: string;
      matcher?: (active: string) => boolean;
      dot?: boolean;
    }
  | {
      // Sub-menu variant — clicking the icon opens a RailFlyout
      id: string;
      label: string;
      Icon: (p: { size: number; color: string }) => JSX.Element;
      children: SideNavChild[];
      matcher?: (active: string) => boolean;
      dot?: boolean;
    };

type SideNavConfig = {
  moduleId: string;                        // 'insights' | 'learning' | …
  moduleLabel: string;                     // human label, used in aria-label
  items: SideNavItem[];                    // middle-section items
};
```

`route` and `children` are mutually exclusive on a single item — direct nav
or sub-menu, never both.

### Sub-menu (per-icon flyout) behavior

Items that declare `children` open a `<RailFlyout>` flyout when their icon
is clicked. The flyout uses the **same primitive** that powers the 9-dot
app switcher, so the panel motion, surface, dismissal, and keyboard
behavior are identical:

- Trigger: click to open; click trigger again to close.
- Position: anchored to the trigger button, top-aligned, `64 + 12 = 76 px`
  from the left edge.
- Surface: white, `var(--radius-xl)` corners, drop shadow, 12 px padding.
- Motion: `opacity 150ms ease-out, transform 150ms ease-out` with a
  `scale(0.95) → scale(1)` enter from `top left`.
- Dismiss: outside click (mousedown), `Escape`, or selecting a child item.
- Trigger button carries `aria-haspopup="menu"` and `aria-expanded`.
- Flyout root: `role="menu"`, `aria-label` mirrors the parent item label.
- Each child row: `role="menuitem"`, `tabIndex=0`, Enter/Space activates,
  active row carries `aria-current="page"`.

### Active state with children

A parent item is considered active when **either** `activeId === item.id`
**or** `activeId` matches one of its children's `id`. The default matcher
covers this; `matcher` only needs to be set for unusual routing schemes.

The shared `<SideNav config={…} />` accepts:

- `config: SideNavConfig` — required.
- `activeId?: string` — controlled active id; falls back to internal state.
- `onSelect?: (id: string) => void` — selection callback.
- `onAppSwitcherClick`, `onHelpClick`, `onSettingsClick`, `onAvatarClick`.
- `appSwitcherTriggerRef` — exposed so the popover can position against it.
- `userInitial?: string` — defaults to `"T"`.
- `showHelp?: boolean` — defaults to `true`; allows future modules to hide
  Help if explicitly approved at the spec level.

Modules **may not** override colors, dimensions, motion, tooltip behavior,
focus styling, or footer composition. Anything that would require such an
override is a spec change and must update this document first.

## Forbidden in module configs

- Hard-coded colors, sizes, padding, radii.
- Bespoke tooltip implementations.
- Custom hover/active/focus styles.
- Module-specific footer items (Help/Settings/Avatar are constant).
- Wrapping the rail in a module-specific layout container.
- Modifying or replacing the 9-dot popover (`AppSwitcherPopover`).

## How to add a new module

1. Create `components/SideNav/configs/<module>HubConfig.js`.
2. Export a `SideNavConfig` value with `moduleId`, `moduleLabel`, and an
   `items` array.
3. Reuse existing icons from `components/SideNav/icons/` or add new ones to
   that file using the same 960 × 960 viewBox so the icons render
   identically across modules.
4. Render `<SideNav config={yourConfig} activeId={…} onSelect={…} />` in the
   module's page or shell, alongside the existing `<AppSwitcherPopover>`
   (anchored via the same `appSwitcherTriggerRef`).
5. Add a story to `components/SideNav/SideNav.stories.jsx` and verify it
   from `app/sidenav-preview`.

## Verification checklist

- [ ] Rail width, background, border, padding match the tokens above.
- [ ] Brand slot is 64 px tall, logo is 28 × 28, centered.
- [ ] App switcher trigger uses 8 px radius, no active state, muted glyph
      color, `aria-haspopup="menu"`.
- [ ] Divider sits below the app switcher with 12 px margin top and bottom.
- [ ] Module items use 20 px (pill) radius, 40 px square, 8 px gap.
- [ ] Active item: `#DDD9EC` background, `aria-current="page"`.
- [ ] Hover state: `#E4E2EE` background on every interactive element.
- [ ] Focus-visible: white halo + `#004BEF` outer ring on every button.
- [ ] Tooltips appear after 300 ms with correct placement and copy.
- [ ] Footer order: Help → Settings → Avatar.
- [ ] Avatar is `#1B92A6`, 32 × 32, white initial, 700 weight.
- [ ] Tab order: app switcher → module items → help → settings → avatar.
- [ ] No module-specific colors or sizes leak into the shared component.
- [ ] 9-dot popover (`AppSwitcherPopover.jsx`) is unmodified and the
      Insights ↔ Learning round-trip still works.

## Contract limitations to plan around

These were noted while building the shared component; future modules will
hit them and should drive a spec change before workarounds:

- `Icon` is a function component only — animated/raster icons need a wrapper.
- Footer is fixed (Help / Settings / Avatar). `showHelp` flag exists to hide
  Help only — adding a new footer item would be a spec change.
- `dot` is a single boolean — no count badge yet. If Ask Mira needs numeric
  badges, extend `SideNavItem` (`badge?: number | string`) and update tokens.
