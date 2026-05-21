"use client";

import React from "react";

/**
 * RailFlyout — shared popover primitive for everything that opens off the
 * 64-pixel side rail.
 *
 * Owns: anchor positioning, enter/exit motion, surface treatment (white
 * card, shadow, radius, padding), click-outside dismissal, Escape dismissal.
 *
 * Does NOT own: the items rendered inside. Both the 9-dot app switcher
 * (`AppSwitcherPopover`) and per-item sub-menus on the rail consume this
 * primitive so the panel motion + look + behavior are identical.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   anchorRef: React.RefObject<HTMLElement>,
 *   children: React.ReactNode,
 *   width?: number,
 *   ariaLabel?: string,
 *   role?: string,
 * }} props
 */
export default function RailFlyout({
  open,
  onClose,
  anchorRef,
  children,
  width = 280,
  ariaLabel,
  role = "menu",
}) {
  const popoverRef = React.useRef(null);
  const [pos, setPos] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (!anchorRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    // Anchor against the trigger's right edge so the flyout sits correctly
    // at both rail widths (64 collapsed / 260 expanded) without hardcoding.
    setPos({ top: rect.top, left: rect.right + 12 });
  }, [open, anchorRef]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, anchorRef]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <div
      ref={popoverRef}
      role={role}
      aria-label={ariaLabel}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width,
        background: "var(--surface-white)",
        borderRadius: "var(--radius-xl)",
        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)",
        padding: 12,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        opacity: open ? 1 : 0,
        transform: open ? "scale(1)" : "scale(0.95)",
        transformOrigin: "top left",
        transition: "opacity 150ms ease-out, transform 150ms ease-out",
        pointerEvents: open ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}

/**
 * RailFlyoutItem — pill row that matches the 9-dot menu's AppMenuItem.
 * Used by both the app switcher and per-icon sub-menus so the rows look
 * identical across all flyouts off the rail.
 */
export function RailFlyoutItem({
  label,
  selected = false,
  onClick,
  trailing,
}) {
  const [hovered, setHovered] = React.useState(false);

  const bg = selected
    ? "color-mix(in srgb, var(--nav-rail-bg) 70%, transparent)"
    : hovered
      ? "var(--pill-bg)"
      : "transparent";

  return (
    <div
      role="menuitem"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-current={selected ? "page" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderRadius: "var(--radius-pill)",
        background: bg,
        cursor: "pointer",
        transition: "background 150ms ease",
        outline: "none",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 16,
          fontWeight: 500,
          color: "var(--do-ink)",
          lineHeight: 1.4,
        }}
      >
        {label}
      </span>
      {trailing && (
        <span
          style={{
            color: "var(--grey-600)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {trailing}
        </span>
      )}
    </div>
  );
}
