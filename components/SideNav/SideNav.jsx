"use client";

import React from "react";
import { PanelLeft } from "lucide-react";
import { SIDENAV_TOKENS as T } from "./tokens";
import { AppSwitcherIcon, SettingsIcon, HelpIcon } from "./icons";
import RailFlyout, { RailFlyoutItem } from "./RailFlyout";

/**
 * SideNav — canonical navigation rail with two width states.
 *
 * Single source of truth for all four modules (Insights Hub, Learning
 * Hub, Ask Mira Pro, Coaching). The middle icon set varies per module
 * via `config`. Everything else (chrome, states, footer, motion, a11y)
 * is constant.
 *
 * Width states:
 *   - Collapsed (default, 64px) — icon-only.
 *   - Expanded (260px) — icons + labels, dataOrb wordmark in the brand
 *     slot, "Apps" / user name visible in the footer.
 * Switching states is driven by the `isExpanded` prop. The component
 * also syncs `--sidenav-width` on `:root` and a `data-sidenav` attribute
 * so PageLayout / body min-width respond without any consumer change.
 *
 * The 9-dot app switcher is treated as an external dependency: SideNav
 * owns only the trigger (renders the 3×3 icon, exposes a ref, fires
 * `onAppSwitcherClick`). The popover (AppSwitcherPopover) is rendered
 * by the consumer and anchored via `appSwitcherTriggerRef`.
 *
 * Per-item sub-menus continue to use the same `RailFlyout` primitive
 * that powers the 9-dot popover so motion + surface + dismissal are
 * identical across both states. RailFlyout anchors against the
 * triggering button's rect so it works at both rail widths.
 *
 * @typedef {Object} SideNavChild
 * @property {string} id     Stable child identifier (matches activeId).
 * @property {string} label  Visible label inside the flyout.
 * @property {string} [route] Optional URL the child navigates to.
 *
 * @typedef {Object} SideNavItem
 * @property {string} id                Stable item identifier (matches activeId).
 * @property {string} label             Tooltip + aria-label + expanded-state label.
 * @property {(p:{size:number,color:string})=>JSX.Element} Icon  Icon component.
 * @property {string} [route]           Direct nav target (mutually exclusive with children).
 * @property {SideNavChild[]} [children] Sub-menu items; clicking opens a flyout.
 * @property {(active:string)=>boolean} [matcher] Custom active-route matcher.
 * @property {boolean} [dot]            Show a small notification dot.
 *
 * @typedef {Object} SideNavConfig
 * @property {string}        moduleId   Stable module key.
 * @property {string}        moduleLabel Human label for the module.
 * @property {SideNavItem[]} items      Module-specific middle-section items.
 *
 * @param {{
 *   config: SideNavConfig,
 *   activeId?: string,
 *   onSelect?: (id: string) => void,
 *   onAppSwitcherClick?: () => void,
 *   onHelpClick?: () => void,
 *   onSettingsClick?: () => void,
 *   onAvatarClick?: () => void,
 *   appSwitcherTriggerRef?: React.RefObject<HTMLButtonElement>,
 *   userInitial?: string,
 *   userName?: string,
 *   logoSrc?: string,
 *   logoAlt?: string,
 *   showHelp?: boolean,
 *   isExpanded?: boolean,
 *   onToggleExpanded?: () => void,
 * }} props
 */
export default function SideNav({
  config,
  activeId,
  onSelect,
  onAppSwitcherClick,
  onHelpClick,
  onSettingsClick,
  onAvatarClick,
  appSwitcherTriggerRef,
  appSwitcherLabel = "Apps",
  userInitial = "T",
  userName = "Demo Internal",
  logoSrc = "/assets/logo-color.svg",
  logoAlt = "dataOrb",
  showHelp = true,
  isExpanded: isExpandedProp,
  onToggleExpanded,
}) {
  const [internalActive, setInternalActive] = React.useState(
    activeId ?? config?.items?.[0]?.id ?? "",
  );
  const isControlled = activeId !== undefined;
  const active = isControlled ? activeId : internalActive;

  // Width state: controlled when parent supplies isExpanded; otherwise
  // self-managed via internal toggle.
  const [internalExpanded, setInternalExpanded] = React.useState(false);
  const isExpandedControlled = isExpandedProp !== undefined;
  const isExpanded = isExpandedControlled ? isExpandedProp : internalExpanded;

  const handleToggle = () => {
    if (onToggleExpanded) onToggleExpanded();
    if (!isExpandedControlled) setInternalExpanded((v) => !v);
  };

  // Suppress the width transition until one animation frame after mount.
  // Without this gate, the initial paint after hydration (and any
  // re-mount across a route change) animates 64 → 260px even when the
  // user's stored preference is "expanded". Only deliberate toggles —
  // which happen after the rAF callback fires — animate.
  const [animateWidth, setAnimateWidth] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setAnimateWidth(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Sync the rail width to a CSS var on :root so PageLayout (which
  // already reads --sidenav-width) reflows automatically. The data
  // attribute drives the body min-width swap so horizontal scroll
  // behaviour stays consistent. useLayoutEffect so the variable is
  // written before the browser paints the new width — otherwise the
  // content column briefly mismatches the rail width on first frame.
  React.useLayoutEffect(() => {
    if (typeof document === "undefined") return undefined;
    const root = document.documentElement;
    root.style.setProperty(
      "--sidenav-width",
      isExpanded ? `${T.rail.expandedWidth}px` : `${T.rail.width}px`,
    );
    root.setAttribute("data-sidenav", isExpanded ? "expanded" : "collapsed");
    return undefined;
  }, [isExpanded]);

  // Which item's sub-menu flyout (if any) is currently open. Only items
  // with `children` participate.
  const [flyoutItemId, setFlyoutItemId] = React.useState(null);

  // Per-item button refs so RailFlyout can anchor against the clicked item.
  const itemRefs = React.useRef({});
  const getItemRef = (id) => {
    if (!itemRefs.current[id]) {
      itemRefs.current[id] = React.createRef();
    }
    return itemRefs.current[id];
  };

  const handleSelect = (id) => {
    if (!isControlled) setInternalActive(id);
    onSelect?.(id);
  };

  const items = config?.items ?? [];

  return (
    <>
      <aside
        role="navigation"
        aria-label={`${config?.moduleLabel ?? "Module"} side navigation`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isExpanded ? T.rail.expandedWidth : T.rail.width,
          height: "100vh",
          background: T.rail.bg,
          borderRight: `1px solid ${T.rail.border}`,
          display: "flex",
          flexDirection: "column",
          alignItems: isExpanded ? "stretch" : "center",
          padding: isExpanded
            ? `${T.rail.paddingY}px ${T.rail.paddingXExpanded}px`
            : `${T.rail.paddingY}px 0`,
          boxSizing: "border-box",
          zIndex: T.rail.zIndex,
          transition: animateWidth ? T.rail.widthTransition : "none",
        }}
      >
        <BrandSlot src={logoSrc} alt={logoAlt} isExpanded={isExpanded} />

        <AppSwitcherTrigger
          onClick={onAppSwitcherClick}
          triggerRef={appSwitcherTriggerRef}
          isExpanded={isExpanded}
          label={appSwitcherLabel}
        />

        <Divider isExpanded={isExpanded} />

        <ul
          role="list"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: T.itemGroup.gap,
            listStyle: "none",
            margin: 0,
            padding: 0,
            width: isExpanded ? "100%" : "auto",
          }}
        >
          {items.map((item) => {
            const childIds = item.children?.map((c) => c.id) ?? [];
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            const isDirectlyActive = item.matcher
              ? item.matcher(active)
              : active === item.id;
            const hasActiveChild = childIds.includes(active);
            // Collapsed state keeps today's combined active treatment:
            // child active → parent icon active. Expanded inline mode
            // splits the two — see active cascade in §1.
            const showInlineChildren = isExpanded && hasChildren;
            const parentIsActive = showInlineChildren
              ? isDirectlyActive
              : isDirectlyActive || hasActiveChild;
            const parentActiveWithDescendant =
              showInlineChildren && hasActiveChild && !isDirectlyActive;
            return (
              <li key={item.id} style={{ width: isExpanded ? "100%" : "auto" }}>
                <RailItem
                  item={item}
                  isActive={parentIsActive}
                  activeWithDescendant={parentActiveWithDescendant}
                  hasChildren={hasChildren}
                  isFlyoutOpen={flyoutItemId === item.id}
                  isExpanded={isExpanded}
                  buttonRef={hasChildren ? getItemRef(item.id) : undefined}
                  onClick={() => {
                    if (!isExpanded && hasChildren) {
                      // Collapsed state: flyout, unchanged from today.
                      setFlyoutItemId((cur) => (cur === item.id ? null : item.id));
                      return;
                    }
                    setFlyoutItemId(null);
                    if (item.route) {
                      handleSelect(item.id);
                    } else if (hasChildren) {
                      // Grouping parent in expanded mode — navigate to
                      // first child's destination.
                      handleSelect(item.children[0].id);
                    } else {
                      handleSelect(item.id);
                    }
                  }}
                />
                {showInlineChildren && (
                  <ul
                    role="list"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      listStyle: "none",
                      margin: 0,
                      marginTop: 8,
                      padding: 0,
                      width: "100%",
                    }}
                  >
                    {item.children.map((child) => (
                      <li key={child.id} style={{ width: "100%" }}>
                        <RailItem
                          item={child}
                          isActive={active === child.id}
                          activeWithDescendant={false}
                          hasChildren={false}
                          isFlyoutOpen={false}
                          isExpanded
                          indented
                          onClick={() => handleSelect(child.id)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <div style={{ flex: 1 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isExpanded ? "stretch" : "center",
            gap: T.footer.gap,
            width: isExpanded ? "100%" : "auto",
          }}
        >
          {showHelp && (
            <FooterIconButton
              label="Help"
              onClick={onHelpClick}
              Icon={HelpIcon}
              isExpanded={isExpanded}
            />
          )}
          <FooterIconButton
            label="Settings"
            onClick={onSettingsClick}
            Icon={SettingsIcon}
            isExpanded={isExpanded}
          />
          <Avatar
            onClick={onAvatarClick}
            initial={userInitial}
            name={userName}
            isExpanded={isExpanded}
          />
        </div>

        {/* Floating chrome — rendered last so it's tabbed at the end of
            the rail, after the avatar, without reordering any item. */}
        <ToggleButton isExpanded={isExpanded} onClick={handleToggle} />
      </aside>

      {items
        .filter((item) => Array.isArray(item.children) && item.children.length > 0)
        .map((item) => (
          <RailFlyout
            key={`flyout-${item.id}`}
            open={flyoutItemId === item.id}
            onClose={() => setFlyoutItemId(null)}
            anchorRef={getItemRef(item.id)}
            ariaLabel={item.label}
          >
            {item.children.map((child) => (
              <RailFlyoutItem
                key={child.id}
                label={child.label}
                selected={active === child.id}
                onClick={() => {
                  handleSelect(child.id);
                  setFlyoutItemId(null);
                }}
              />
            ))}
          </RailFlyout>
        ))}
    </>
  );
}

// ---- Brand slot ---------------------------------------------------------

function BrandSlot({ src, alt, isExpanded }) {
  return (
    <div
      style={{
        height: T.brand.slotHeight,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: isExpanded ? "flex-start" : "center",
        marginBottom: T.brand.marginBottom,
        flexShrink: 0,
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: T.brand.logoSize,
          height: T.brand.logoSize,
          display: "block",
          flexShrink: 0,
        }}
      />
      {isExpanded && (
        <span
          style={{
            marginLeft: T.brand.wordmark.marginLeft,
            fontFamily: T.font.sans,
            fontSize: T.brand.wordmark.fontSize,
            fontWeight: T.brand.wordmark.fontWeight,
            color: T.brand.wordmark.color,
            transition: T.expandedLabel.fadeIn,
            whiteSpace: "nowrap",
          }}
        >
          {T.brand.wordmark.text}
        </span>
      )}
    </div>
  );
}

// ---- Toggle button (floating chrome) ------------------------------------

function ToggleButton({ isExpanded, onClick }) {
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const label = isExpanded
    ? T.toggle.tooltipCopy.expanded
    : T.toggle.tooltipCopy.collapsed;
  // Outer wrapper is absolutely positioned relative to the <aside> so the
  // toggle anchors to the rail's top-right regardless of flex flow. The
  // Tooltip wrapper inside lays out normally around the 28×28 button.
  return (
    <div
      style={{
        position: "absolute",
        top: T.toggle.anchorTop,
        right: T.toggle.anchorRight,
        zIndex: 2,
      }}
    >
      <Tooltip label={label}>
        <button
          type="button"
          onClick={onClick}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          aria-label={label}
          aria-pressed={isExpanded}
          style={{
            width: T.toggle.size,
            height: T.toggle.size,
            borderRadius: T.toggle.radius,
            border: T.toggle.border,
            background: hover ? T.state.bgHover : T.toggle.bg,
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            padding: 0,
            color: T.toggle.iconColor,
            transition: T.iconButton.transition,
            outline: "none",
            boxShadow: focus ? T.state.focusRing : "none",
          }}
        >
          <PanelLeft size={T.toggle.iconSize} />
        </button>
      </Tooltip>
    </div>
  );
}

// ---- App switcher trigger ----------------------------------------------

function AppSwitcherTrigger({ onClick, triggerRef, isExpanded, label = "Apps" }) {
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  return (
    <Tooltip label={label} disabled={isExpanded}>
      <button
        type="button"
        ref={triggerRef}
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: isExpanded ? "100%" : T.iconButton.size,
          height: T.iconButton.size,
          borderRadius: isExpanded ? T.iconButton.radius : T.iconButton.appSwitcherRadius,
          border: "none",
          background: hover ? T.state.bgHover : "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: isExpanded ? "flex-start" : "center",
          padding: isExpanded ? "0 8px" : 0,
          gap: isExpanded ? T.expandedLabel.marginLeft : 0,
          transition: T.iconButton.transition,
          outline: "none",
          boxShadow: focus ? T.state.focusRing : "none",
        }}
        aria-label={label}
        aria-haspopup="menu"
      >
        <span
          style={{
            width: T.iconButton.size,
            height: T.iconButton.size,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <AppSwitcherIcon
            size={T.iconButton.iconSize}
            color={T.state.appSwitcherColor}
          />
        </span>
        {isExpanded && <ExpandedLabel>{label}</ExpandedLabel>}
      </button>
    </Tooltip>
  );
}

// ---- Divider ------------------------------------------------------------

function Divider({ isExpanded }) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      style={{
        width: isExpanded ? "calc(100% - 24px)" : T.divider.width,
        height: T.divider.height,
        background: T.divider.color,
        margin: `${T.divider.marginY}px ${isExpanded ? "12px" : "0"}`,
        flexShrink: 0,
      }}
    />
  );
}

// ---- Module item --------------------------------------------------------

function RailItem({
  item,
  isActive,
  activeWithDescendant = false,
  hasChildren,
  isFlyoutOpen,
  isExpanded,
  indented = false,
  buttonRef,
  onClick,
}) {
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const Icon = item.Icon;

  // Parent-with-active-descendant gets the subtler hover tint per §1
  // active cascade (V1 default). Direct active still wins.
  const bg = isActive
    ? T.state.bgActive
    : hover
      ? T.state.bgHover
      : activeWithDescendant
        ? T.state.bgHover
        : T.state.bgDefault;

  // Indented child rows align horizontally with the parent label
  // (8 base padding + 40 icon + 12 gap = 60px from the rail's left
  // inner edge). Icon slot is suppressed on these rows.
  const padding = isExpanded
    ? indented
      ? "0 8px 0 60px"
      : "0 8px"
    : 0;

  return (
    <Tooltip label={item.label} disabled={isExpanded}>
      <button
        type="button"
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: isExpanded ? "100%" : T.iconButton.size,
          height: T.iconButton.size,
          borderRadius: T.iconButton.radius,
          border: "none",
          background: bg,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: isExpanded ? "flex-start" : "center",
          padding,
          gap: isExpanded && !indented ? T.expandedLabel.marginLeft : 0,
          transition: T.iconButton.transition,
          position: "relative",
          outline: "none",
          boxShadow: focus ? T.state.focusRing : "none",
        }}
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
        aria-haspopup={hasChildren ? "menu" : undefined}
        aria-expanded={hasChildren ? isFlyoutOpen : undefined}
      >
        {!indented && Icon && (
          <span
            style={{
              width: T.iconButton.size,
              height: T.iconButton.size,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={T.iconButton.iconSize} color={T.state.iconColor} />
          </span>
        )}
        {isExpanded && <ExpandedLabel>{item.label}</ExpandedLabel>}
        {item.dot && (isExpanded ? <InlineDot /> : <NotificationDot />)}
        {item.wip  && <NavBadge label="WIP"  variant="light"  isExpanded={isExpanded} />}
        {item.beta && <NavBadge label="Beta" variant="filled" isExpanded={isExpanded} />}
      </button>
    </Tooltip>
  );
}

// NavBadge — corner pill marking module state on the rail. Anchors
// top-right of the 40×40 icon button in collapsed mode (does not shift
// the icon's optical centring or change rail width). In expanded mode
// it sits inline after the label.
//
// Variants (revisions Part C):
//   light  — outline + tinted fill on warning hue (used by WIP).
//   filled — saturated warning fill + white text (used by Beta). Same
//            hue family as WIP so the rail reads as one badge type;
//            flag for product if Beta should switch to a distinct hue
//            (e.g. brand blue) for at-a-glance stage differentiation.
function NavBadge({ label, variant = "light", isExpanded }) {
  const filled = variant === "filled";
  const sharedStyle = {
    fontFamily: T.font.sans,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: "0.4px",
    color: filled ? "#FFFFFF" : "var(--color-warning-text)",
    background: filled ? "var(--color-warning)" : "var(--color-warning-bg)",
    border: `1px solid var(--color-warning)`,
    borderRadius: 4,
    padding: "1px 4px",
    lineHeight: 1,
    whiteSpace: "nowrap",
    pointerEvents: "none",
    textTransform: "uppercase",
  };
  if (isExpanded) {
    return <span style={{ ...sharedStyle, marginLeft: "auto" }}>{label}</span>;
  }
  return (
    <span
      aria-hidden="true"
      style={{ ...sharedStyle, position: "absolute", top: 2, right: 2 }}
    >
      {label}
    </span>
  );
}

function NotificationDot() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        width: 7,
        height: 7,
        borderRadius: 4,
        background: "#004BEF",
        border: `2px solid ${T.rail.bg}`,
        boxSizing: "content-box",
      }}
    />
  );
}

function InlineDot() {
  return (
    <span
      aria-hidden="true"
      style={{
        marginLeft: "auto",
        width: 7,
        height: 7,
        borderRadius: 4,
        background: "#004BEF",
        flexShrink: 0,
      }}
    />
  );
}

// ---- Footer icon button -------------------------------------------------

function FooterIconButton({ label, onClick, Icon, isExpanded }) {
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  return (
    <Tooltip label={label} disabled={isExpanded}>
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: isExpanded ? "100%" : T.iconButton.size,
          height: T.iconButton.size,
          borderRadius: T.iconButton.radius,
          border: "none",
          background: hover ? T.state.bgHover : "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: isExpanded ? "flex-start" : "center",
          padding: isExpanded ? "0 8px" : 0,
          gap: isExpanded ? T.expandedLabel.marginLeft : 0,
          transition: T.iconButton.transition,
          outline: "none",
          boxShadow: focus ? T.state.focusRing : "none",
        }}
        aria-label={label}
      >
        <span
          style={{
            width: T.iconButton.size,
            height: T.iconButton.size,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={T.iconButton.iconSize} color={T.state.iconColor} />
        </span>
        {isExpanded && <ExpandedLabel>{label}</ExpandedLabel>}
      </button>
    </Tooltip>
  );
}

// ---- Avatar -------------------------------------------------------------

function Avatar({ initial, name, onClick, isExpanded }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: isExpanded ? "100%" : T.avatar.size,
        height: isExpanded ? T.iconButton.size : T.avatar.size,
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: isExpanded ? "flex-start" : "center",
        cursor: "pointer",
        border: "none",
        padding: isExpanded ? `0 ${(T.iconButton.size - T.avatar.size) / 2}px` : 0,
        gap: isExpanded ? T.expandedLabel.marginLeft : 0,
        marginTop: T.footer.avatarMarginTop,
        outline: "none",
        boxShadow: focus ? T.state.focusRing : "none",
        borderRadius: isExpanded ? T.iconButton.radius : T.avatar.radius,
      }}
      aria-label={isExpanded ? `Profile — ${name}` : "Profile"}
    >
      <span
        style={{
          width: T.avatar.size,
          height: T.avatar.size,
          borderRadius: T.avatar.radius,
          background: T.avatar.bg,
          color: T.avatar.fg,
          display: "grid",
          placeItems: "center",
          fontFamily: T.font.sans,
          fontSize: T.avatar.fontSize,
          fontWeight: T.avatar.fontWeight,
          flexShrink: 0,
        }}
      >
        {initial}
      </span>
      {isExpanded && <ExpandedLabel>{name}</ExpandedLabel>}
    </button>
  );
}

// ---- Shared bits --------------------------------------------------------

function ExpandedLabel({ children }) {
  return (
    <span
      style={{
        fontFamily: T.font.sans,
        fontSize: T.expandedLabel.fontSize,
        fontWeight: T.expandedLabel.fontWeight,
        color: T.expandedLabel.color,
        whiteSpace: "nowrap",
        transition: T.expandedLabel.fadeIn,
        pointerEvents: "none",
      }}
    >
      {children}
    </span>
  );
}

function Tooltip({ label, children, disabled = false }) {
  const [show, setShow] = React.useState(false);
  const timerRef = React.useRef(null);

  const open = () => {
    if (disabled) return;
    timerRef.current = setTimeout(() => setShow(true), T.tooltip.delayMs);
  };
  const close = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow(false);
  };

  React.useEffect(() => () => clearTimeout(timerRef.current), []);

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div
      style={{ position: "relative", display: "block" }}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {children}
      {show && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            left: `calc(100% + ${T.tooltip.offset}px)`,
            top: "50%",
            transform: "translateY(-50%)",
            background: T.tooltip.bg,
            color: T.tooltip.fg,
            fontFamily: T.font.sans,
            fontSize: T.tooltip.fontSize,
            fontWeight: T.tooltip.fontWeight,
            padding: T.tooltip.padding,
            borderRadius: T.tooltip.radius,
            whiteSpace: "nowrap",
            zIndex: T.tooltip.zIndex,
            pointerEvents: "none",
            boxShadow: T.tooltip.shadow,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
