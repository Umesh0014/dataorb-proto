"use client";

import React from "react";
import { SIDENAV_TOKENS as T } from "./tokens";
import { AppSwitcherIcon, SettingsIcon, HelpIcon } from "./icons";
import RailFlyout, { RailFlyoutItem } from "./RailFlyout";

/**
 * SideNav — canonical 64px navigation rail.
 *
 * Single source of truth for all four modules (Insights Hub, Learning Hub,
 * Ask Mira, Coaching). The middle icon set varies per module via `config`.
 * Everything else (chrome, states, footer, motion, a11y) is constant.
 *
 * The 9-dot app switcher is treated as an external dependency: SideNav owns
 * only the trigger button (renders the 3×3 icon, exposes a ref, fires
 * `onAppSwitcherClick`). The popover/menu component (AppSwitcherPopover) is
 * not modified or owned by SideNav — consumers continue to render it next to
 * SideNav and anchor it via `appSwitcherTriggerRef`.
 *
 * Per-item sub-menus use the same `RailFlyout` primitive that powers the
 * 9-dot popover, so motion + surface + dismissal are identical.
 *
 * @typedef {Object} SideNavChild
 * @property {string} id     Stable child identifier (matches activeId).
 * @property {string} label  Visible label inside the flyout.
 * @property {string} [route] Optional URL the child navigates to.
 *
 * @typedef {Object} SideNavItem
 * @property {string} id                Stable item identifier (matches activeId).
 * @property {string} label             Tooltip + aria-label.
 * @property {(p:{size:number,color:string})=>JSX.Element} Icon  Icon component.
 * @property {string} [route]           Direct nav target (mutually exclusive with children).
 * @property {SideNavChild[]} [children] Sub-menu items; clicking the icon opens a flyout.
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
 *   logoSrc?: string,
 *   logoAlt?: string,
 *   showHelp?: boolean,
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
  userInitial = "T",
  logoSrc = "/assets/logo-color.svg",
  logoAlt = "dataOrb",
  showHelp = true,
}) {
  const [internalActive, setInternalActive] = React.useState(
    activeId ?? config?.items?.[0]?.id ?? ""
  );
  const isControlled = activeId !== undefined;
  const active = isControlled ? activeId : internalActive;

  // Which item's sub-menu flyout (if any) is currently open. Only items
  // with `children` participate. Mirrors the 9-dot trigger toggle pattern.
  const [flyoutItemId, setFlyoutItemId] = React.useState(null);

  // Per-item button refs so RailFlyout can anchor against the clicked icon.
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
          width: T.rail.width,
          height: "100vh",
          background: T.rail.bg,
          borderRight: `1px solid ${T.rail.border}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: `${T.rail.paddingY}px 0`,
          boxSizing: "border-box",
          zIndex: T.rail.zIndex,
        }}
      >
        <Logo src={logoSrc} alt={logoAlt} />

        <AppSwitcherTrigger
          onClick={onAppSwitcherClick}
          triggerRef={appSwitcherTriggerRef}
        />

        <Divider />

        <ul
          role="list"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: T.itemGroup.gap,
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {items.map((item) => {
            const childIds = item.children?.map((c) => c.id) ?? [];
            const isActive = item.matcher
              ? item.matcher(active)
              : active === item.id || childIds.includes(active);
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            return (
              <li key={item.id}>
                <RailItem
                  item={item}
                  isActive={isActive}
                  hasChildren={hasChildren}
                  isFlyoutOpen={flyoutItemId === item.id}
                  buttonRef={hasChildren ? getItemRef(item.id) : undefined}
                  onClick={() => {
                    if (hasChildren) {
                      setFlyoutItemId((cur) => (cur === item.id ? null : item.id));
                    } else {
                      setFlyoutItemId(null);
                      handleSelect(item.id);
                    }
                  }}
                />
              </li>
            );
          })}
        </ul>

        <div style={{ flex: 1 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: T.footer.gap,
          }}
        >
          {showHelp && (
            <FooterIconButton label="Help" onClick={onHelpClick} Icon={HelpIcon} />
          )}
          <FooterIconButton
            label="Settings"
            onClick={onSettingsClick}
            Icon={SettingsIcon}
          />
          <Avatar onClick={onAvatarClick} initial={userInitial} />
        </div>
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

function Logo({ src, alt }) {
  return (
    <div
      style={{
        height: T.brand.slotHeight,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: T.brand.marginBottom,
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: T.brand.logoSize,
          height: T.brand.logoSize,
          display: "block",
        }}
      />
    </div>
  );
}

// Trigger button only. The 9-dot popover (AppSwitcherPopover) is NOT owned by
// SideNav — consumers render it separately and anchor it via triggerRef.
function AppSwitcherTrigger({ onClick, triggerRef }) {
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  return (
    <Tooltip label="Apps">
      <button
        type="button"
        ref={triggerRef}
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: T.iconButton.size,
          height: T.iconButton.size,
          borderRadius: T.iconButton.appSwitcherRadius,
          border: "none",
          background: hover ? T.state.bgHover : "transparent",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          padding: 0,
          transition: T.iconButton.transition,
          outline: "none",
          boxShadow: focus ? T.state.focusRing : "none",
        }}
        aria-label="Apps"
        aria-haspopup="menu"
      >
        <AppSwitcherIcon
          size={T.iconButton.iconSize}
          color={T.state.appSwitcherColor}
        />
      </button>
    </Tooltip>
  );
}

function Divider() {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      style={{
        width: T.divider.width,
        height: T.divider.height,
        background: T.divider.color,
        margin: `${T.divider.marginY}px 0`,
      }}
    />
  );
}

function RailItem({
  item,
  isActive,
  hasChildren,
  isFlyoutOpen,
  buttonRef,
  onClick,
}) {
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const Icon = item.Icon;

  const bg = isActive
    ? T.state.bgActive
    : hover
      ? T.state.bgHover
      : T.state.bgDefault;

  return (
    <Tooltip label={item.label}>
      <button
        type="button"
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: T.iconButton.size,
          height: T.iconButton.size,
          borderRadius: T.iconButton.radius,
          border: "none",
          background: bg,
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          padding: 0,
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
        <Icon size={T.iconButton.iconSize} color={T.state.iconColor} />
        {item.dot && <NotificationDot />}
      </button>
    </Tooltip>
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

function FooterIconButton({ label, onClick, Icon }) {
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  return (
    <Tooltip label={label}>
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: T.iconButton.size,
          height: T.iconButton.size,
          borderRadius: T.iconButton.radius,
          border: "none",
          background: hover ? T.state.bgHover : "transparent",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          padding: 0,
          transition: T.iconButton.transition,
          outline: "none",
          boxShadow: focus ? T.state.focusRing : "none",
        }}
        aria-label={label}
      >
        <Icon size={T.iconButton.iconSize} color={T.state.iconColor} />
      </button>
    </Tooltip>
  );
}

function Avatar({ initial, onClick }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: T.avatar.size,
        height: T.avatar.size,
        borderRadius: T.avatar.radius,
        background: T.avatar.bg,
        color: T.avatar.fg,
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        border: "none",
        fontFamily: T.font.sans,
        fontSize: T.avatar.fontSize,
        fontWeight: T.avatar.fontWeight,
        padding: 0,
        marginTop: T.footer.avatarMarginTop,
        outline: "none",
        boxShadow: focus ? T.state.focusRing : "none",
      }}
      aria-label="Profile"
    >
      {initial}
    </button>
  );
}

function Tooltip({ label, children }) {
  const [show, setShow] = React.useState(false);
  const timerRef = React.useRef(null);

  const open = () => {
    timerRef.current = setTimeout(() => setShow(true), T.tooltip.delayMs);
  };
  const close = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow(false);
  };

  React.useEffect(() => () => clearTimeout(timerRef.current), []);

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
