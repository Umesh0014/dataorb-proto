"use client";

import React from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import Button from "./Button";

// Gap between the trigger and the menu, and the minimum padding kept from
// the viewport edges when the menu is clamped.
const GAP = 8;
const EDGE = 8;

// KebabMenu — shared per-row / per-header action menu. The menu surface is
// rendered in a portal at document.body so it escapes the table card's
// stacking context and `overflow: hidden` clipping (a row cell cannot
// contain a dropdown that paints beyond its bounds — bumping z-index does
// not help because the cell traps it in its own stacking context). Position
// is computed from the trigger's getBoundingClientRect in viewport
// coordinates and flips upward when there is no room below. Menu chrome is
// unchanged from the prior in-DOM version.
//
// Callers inside a clickable row must stop propagation on the wrapping cell
// so opening the menu does not also fire the row's click handler.
//
// items: Array<{ label, onClick }>. onClick fires then the menu closes.
export default function KebabMenu({ ariaLabel = "More actions", items }) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState(null); // { top, left } | null
  const triggerRef = React.useRef(null);
  const menuRef = React.useRef(null);

  const focusTrigger = React.useCallback(() => {
    triggerRef.current?.querySelector("button")?.focus();
  }, []);

  // Close + return focus to the trigger (keyboard affordance). Used by
  // Escape, scrim click, and item activation. Scroll/resize close without
  // moving focus to avoid yanking the viewport.
  const close = React.useCallback(() => {
    setOpen(false);
    focusTrigger();
  }, [focusTrigger]);

  // Measure + position synchronously before paint so the menu never flashes
  // at the wrong spot, then move focus to the first item. Runs once the menu
  // is in the DOM (open === true).
  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current || !menuRef.current) return;
    const t = triggerRef.current.getBoundingClientRect();
    const m = menuRef.current.getBoundingClientRect();

    const spaceBelow = window.innerHeight - t.bottom;
    const spaceAbove = t.top;
    let top;
    if (spaceBelow >= m.height + GAP) {
      top = t.bottom + GAP; // open downward
    } else if (spaceAbove >= m.height + GAP) {
      top = t.top - m.height - GAP; // open upward
    } else {
      top = EDGE; // very short viewport — pin to top
    }

    let left = t.right - m.width; // right edge aligns with the trigger
    if (left < EDGE) left = EDGE;
    if (left + m.width > window.innerWidth - EDGE) {
      left = window.innerWidth - m.width - EDGE;
    }

    setCoords({ top, left });
    menuRef.current.querySelector('button[role="menuitem"]')?.focus();
  }, [open]);

  // While open: close on any ancestor scroll (capture phase) or resize, since
  // the fixed-positioned menu would otherwise drift away from its trigger.
  // Escape closes and returns focus.
  React.useEffect(() => {
    if (!open) return undefined;
    const onScrollOrResize = () => setOpen(false);
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Reset stale coords when closing so the next open re-measures from hidden.
  React.useEffect(() => {
    if (!open) setCoords(null);
  }, [open]);

  return (
    <div ref={triggerRef} style={kmStyles.wrap}>
      <Button
        variant="icon"
        size="sm"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <MoreVertical size={18} />
      </Button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div style={kmStyles.scrim} onClick={close} aria-hidden="true" />
            <div
              ref={menuRef}
              role="menu"
              style={{
                ...kmStyles.menu,
                top: coords ? coords.top : 0,
                left: coords ? coords.left : 0,
                visibility: coords ? "visible" : "hidden",
              }}
            >
              {items.map((it) => (
                <button
                  key={it.label}
                  type="button"
                  role="menuitem"
                  style={kmStyles.item}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--pill-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                  onClick={() => {
                    it.onClick?.();
                    close();
                  }}
                >
                  {it.label}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}

const kmStyles = {
  wrap: { display: "inline-flex" },
  scrim: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "transparent",
  },
  menu: {
    position: "fixed",
    width: 200,
    background: "#FFFFFF",
    borderRadius: 8,
    boxShadow: "var(--shadow-8)",
    padding: "4px 0",
    zIndex: 1001,
  },
  item: {
    display: "block",
    width: "100%",
    padding: "8px 16px",
    background: "transparent",
    border: "none",
    textAlign: "left",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    cursor: "pointer",
  },
};
