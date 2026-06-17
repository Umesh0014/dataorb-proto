"use client";

import React from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

// Select — the design-system dropdown: a pill trigger that opens a custom
// popover menu (white rounded panel, soft shadow, lavender hover/selected
// rows), matching the 2.0 Design System filter dropdowns. The menu renders
// in a portal with fixed positioning so it never clips inside a Card, and
// closes on outside-click / Escape / scroll. This is the shared dropdown
// primitive used across the Credit & Usage surface (filters, page size,
// bucket moves, rule scopes).
//
//   options   [{ value, label }]
//   size      "sm" 32 / "md" 36 (default)
//   placeholder  shown on the trigger when nothing is selected
export default function Select({
  value,
  onChange,
  options,
  ariaLabel,
  size = "md",
  placeholder,
  fullWidth = false,
  style,
}) {
  const [open, setOpen] = React.useState(false);
  const [rect, setRect] = React.useState(null);
  const [hi, setHi] = React.useState(-1);
  const triggerRef = React.useRef(null);
  const menuRef = React.useRef(null);

  const selected = options.find((o) => o.value === value) || null;
  const label = selected ? selected.label : placeholder || "Select";
  const compact = size === "sm";

  const openMenu = () => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    setHi(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  React.useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  const choose = (v) => { onChange(v); setOpen(false); triggerRef.current?.focus(); };

  const onTriggerKey = (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) openMenu();
    }
  };
  const onMenuKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(options.length - 1, h + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (options[hi]) choose(options[hi].value); }
    else if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
  };

  return (
    <span style={{ ...styles.wrap, width: fullWidth ? "100%" : undefined, ...style }}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKey}
        style={{
          ...styles.trigger,
          width: fullWidth ? "100%" : undefined,
          height: compact ? 32 : 36,
          fontSize: compact ? 12 : 13,
          borderColor: open ? "var(--color-icon-tertiary-fg)" : "var(--color-border-card-soft)",
        }}
      >
        <span style={styles.label}>{label}</span>
        <ChevronDown
          size={15}
          color="var(--color-text-tertiary)"
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 120ms ease" }}
          aria-hidden="true"
        />
      </button>

      {open && rect && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label={ariaLabel}
          tabIndex={-1}
          onKeyDown={onMenuKey}
          style={{ ...styles.menu, top: rect.bottom + 6, left: rect.left, minWidth: rect.width }}
        >
          {options.map((o, i) => {
            const isSel = o.value === value;
            const isHi = i === hi;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={isSel}
                onMouseEnter={() => setHi(i)}
                onClick={() => choose(o.value)}
                style={{
                  ...styles.item,
                  background: isHi || isSel ? "var(--color-icon-tertiary-bg)" : "transparent",
                  color: isSel ? "var(--color-icon-tertiary-fg)" : "var(--color-text-deep)",
                  fontWeight: isSel ? 600 : 500,
                }}
              >
                <span style={styles.itemLabel}>{o.label}</span>
                {isSel && <Check size={14} aria-hidden="true" />}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </span>
  );
}

const styles = {
  wrap: { display: "inline-flex", alignItems: "center" },
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "0 14px",
    borderRadius: 999,
    border: "1px solid",
    background: "#FFFFFF",
    fontFamily: "inherit",
    fontWeight: 600,
    color: "var(--color-text-deep)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "border-color 120ms ease",
  },
  label: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  menu: {
    position: "fixed",
    zIndex: 70,
    maxHeight: 280,
    overflowY: "auto",
    padding: 6,
    background: "#FFFFFF",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 12,
    boxShadow: "var(--shadow-16)",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    fontFamily: "var(--font-sans)",
  },
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "9px 12px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 13,
    textAlign: "left",
    transition: "background 100ms ease",
  },
  itemLabel: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
};
