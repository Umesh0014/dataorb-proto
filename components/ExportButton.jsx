"use client";

import React from "react";
import { Download, Image, Table, FileText, FileSpreadsheet } from "lucide-react";

// FORMAT_META — every supported export format. ExportButton renders only
// the ids passed in `formats`; copy actions are grouped above downloads.
const FORMAT_META = {
  "image-copy": { label: "Copy as image", Icon: Image, group: "copy" },
  "table-copy": { label: "Copy as table", Icon: Table, group: "copy" },
  png: { label: "Download PNG", Icon: Image, group: "download" },
  pdf: { label: "Download PDF", Icon: FileText, group: "download" },
  csv: { label: "Download CSV", Icon: FileSpreadsheet, group: "download" },
};
const FORMAT_ORDER = ["image-copy", "table-copy", "png", "pdf", "csv"];

// ExportButton — secondary export control for a card or artifact header.
// Click opens a dropdown of formats; picking one calls onExport(id). V1
// wires the affordance only — real file generation is a later pass.
export default function ExportButton({
  formats,
  label = "Export",
  variant = "icon",
  onExport,
  align = "right",
}) {
  const [open, setOpen] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const pick = (id) => {
    setOpen(false);
    if (onExport) onExport(id);
    else console.log(`[ExportButton] export requested: ${id}`);
  };

  const isText = variant === "text";
  const ids = FORMAT_ORDER.filter((id) => formats.includes(id));
  // Index of the last "Copy as…" row — a divider sits below it.
  const lastCopy = ids.map((id) => FORMAT_META[id].group).lastIndexOf("copy");

  const base = isText ? "var(--surface-white)" : "transparent";
  const hoverBg = isText ? "var(--surface-alt)" : "var(--overlay-hover)";

  return (
    <span ref={wrapRef} style={exportStyles.wrap}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          ...(isText ? exportStyles.textBtn : exportStyles.iconBtn),
          background: open ? "var(--grey-100)" : hover ? hoverBg : base,
        }}
      >
        <Download size={isText ? 14 : 15} />
        {isText && <span>{label}</span>}
      </button>
      {open && (
        <div role="menu" style={{ ...exportStyles.menu, [align]: 0 }}>
          {ids.map((id, i) => {
            const { label: optLabel, Icon } = FORMAT_META[id];
            return (
              <button
                key={id}
                type="button"
                role="menuitem"
                onClick={() => pick(id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-alt)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                style={{
                  ...exportStyles.menuItem,
                  borderBottom:
                    i === lastCopy && lastCopy < ids.length - 1
                      ? "1px solid var(--table-row-border)"
                      : "none",
                }}
              >
                <Icon size={14} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
                {optLabel}
              </button>
            );
          })}
        </div>
      )}
    </span>
  );
}

const exportStyles = {
  wrap: {
    position: "relative",
    display: "inline-flex",
  },
  iconBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    padding: 0,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    color: "var(--text-secondary)",
    transition: "background 120ms ease",
  },
  textBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 32,
    padding: "0 12px",
    border: "1px solid var(--grey-300)",
    borderRadius: 6,
    cursor: "pointer",
    color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    transition: "background 120ms ease",
  },
  menu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    width: 200,
    background: "var(--surface-white)",
    border: "1px solid var(--grey-300)",
    borderRadius: 8,
    boxShadow: "var(--shadow-card)",
    padding: "4px 0",
    zIndex: 30,
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    height: 32,
    padding: "0 12px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--color-text-medium)",
  },
};
