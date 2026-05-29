"use client";

import React from "react";
import { createPortal } from "react-dom";

// Tooltip — shared dark hover tooltip primitive (Figma Part F audit Q10).
// Wraps a target element and surfaces a small dark caption on pointer-enter
// / focus. Portal-rendered at document.body so it escapes ancestor
// stacking and `overflow: hidden` clipping. Positioned above the target by
// default; flips below when there is no room.
//
// Built for the disabled "+ Driver" CTA tooltip on the Roleplay Drivers
// list cap-reached state ("No more than 20 drivers can be created. Please
// archive one to create new."). Designed as the shared tooltip primitive
// for future hover-help affordances elsewhere.
//
// Note: the trigger must be capable of receiving pointer events for the
// hover to fire. Disabled native <button>s do not emit mouseenter — wrap
// them in a span and pass that span as the child.
//
// Props:
//   content    string | React.Node — tooltip body
//   placement  "top" | "bottom" — preferred placement. Default "top".
//   maxWidth   number — px clamp on tooltip width. Default 240.
//   disabled   boolean — when true the tooltip never renders.
//   children   single React element to wrap as the anchor.

const GAP = 6;
const EDGE = 8;

export default function Tooltip({
  content,
  placement = "top",
  maxWidth = 240,
  disabled = false,
  children,
}) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState(null);
  const anchorRef = React.useRef(null);
  const tipRef = React.useRef(null);

  const show = React.useCallback(() => {
    if (disabled || !content) return;
    setOpen(true);
  }, [disabled, content]);
  const hide = React.useCallback(() => setOpen(false), []);

  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current || !tipRef.current) return;
    const a = anchorRef.current.getBoundingClientRect();
    const t = tipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = placement === "top" ? a.top - t.height - GAP : a.bottom + GAP;
    // Flip when clipped.
    if (placement === "top" && top < EDGE) top = a.bottom + GAP;
    if (placement === "bottom" && top + t.height > vh - EDGE) {
      top = a.top - t.height - GAP;
    }
    let left = a.left + a.width / 2 - t.width / 2;
    if (left < EDGE) left = EDGE;
    if (left + t.width > vw - EDGE) left = vw - EDGE - t.width;

    setCoords({ top, left });
  }, [open, placement]);

  // Close on scroll / resize so the tooltip doesn't drift away from its
  // anchor. Cheap to recompute, but the trigger likely moves out of view
  // anyway — easier to hide than re-measure mid-scroll.
  React.useEffect(() => {
    if (!open) return undefined;
    const onScroll = () => setOpen(false);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  return (
    <>
      <span
        ref={anchorRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        style={anchorStyle}
      >
        {children}
      </span>
      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={tipRef}
          role="tooltip"
          style={{
            ...tipStyle,
            maxWidth,
            top: coords ? coords.top : -9999,
            left: coords ? coords.left : -9999,
            opacity: coords ? 1 : 0,
          }}
        >
          {content}
        </div>,
        document.body,
      )}
    </>
  );
}

const anchorStyle = {
  display: "inline-flex",
};

const tipStyle = {
  position: "fixed",
  zIndex: 9999,
  background: "#1B1B1F",
  color: "#FFFFFF",
  fontFamily: "var(--font-sans)",
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1.4,
  letterSpacing: "0.1px",
  padding: "8px 12px",
  borderRadius: 6,
  boxShadow: "0 8px 24px rgba(27, 27, 31, 0.24)",
  pointerEvents: "none",
  transition: "opacity 80ms ease",
};
