"use client";

import React from "react";
import { MoreHorizontal, Check } from "lucide-react";
import Button from "./Button";

// GroupCard — one Usage Group (Level 1–4): renameable name + default badge, the
// weekly per-learner allowance (or "Not set" when dormant), the learner count, a
// "Set weekly allowance" action, and an overflow menu (Set as default / Rename).
// Clicking the card body selects the group so the learner table drills into it.
// The card is a div (role=button) so the inner controls aren't nested buttons.
export default function GroupCard({ group, selected, onSelect, onSetAllowance, onSetDefault, onRename }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [renaming, setRenaming] = React.useState(false);
  const [draft, setDraft] = React.useState(group.name);

  const startRename = () => {
    setDraft(group.name);
    setRenaming(true);
    setMenuOpen(false);
  };
  const commitRename = () => {
    const v = draft.trim();
    if (v) onRename(group.id, v);
    setRenaming(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(group.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(group.id);
        }
      }}
      style={{
        ...styles.card,
        borderColor: selected ? "var(--color-icon-tertiary-fg)" : "var(--color-divider-card)",
        background: selected ? "var(--color-icon-tertiary-bg)" : "#FFFFFF",
      }}
    >
      <div style={styles.head}>
        {renaming ? (
          <input
            value={draft}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setRenaming(false);
            }}
            aria-label="Group name"
            style={styles.nameInput}
          />
        ) : (
          <span style={styles.name}>{group.name}</span>
        )}
        {group.isDefault && <span style={styles.badge}>Default</span>}
      </div>

      <div style={styles.allowance}>
        {group.capMin != null ? (
          <>
            <strong style={styles.allowNum}>{group.capMin}</strong>
            <span style={styles.allowUnit}>min / learner / week</span>
          </>
        ) : (
          <span style={styles.notSet}>Not set</span>
        )}
      </div>
      <span style={styles.count}>
        {group.agentCount.toLocaleString()} {group.agentCount === 1 ? "learner" : "learners"}
      </span>

      <div style={styles.actions} onClick={(e) => e.stopPropagation()} role="presentation">
        <Button variant="text" uppercase={false} onClick={() => onSetAllowance(group)} style={styles.setBtn}>
          Set weekly allowance
        </Button>
        <div style={styles.menuWrap}>
          <Button variant="icon" size="sm" aria-label={`More options for ${group.name}`} onClick={() => setMenuOpen((o) => !o)}>
            <MoreHorizontal size={16} />
          </Button>
          {menuOpen && (
            <>
              <div style={styles.menuScrim} onClick={() => setMenuOpen(false)} aria-hidden="true" />
              <div role="menu" style={styles.menu}>
                <MenuItem disabled={group.isDefault} onClick={() => { onSetDefault(group.id); setMenuOpen(false); }}>
                  {group.isDefault && <Check size={14} />} Set as default
                </MenuItem>
                <MenuItem onClick={startRename}>Rename</MenuItem>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuItem({ children, disabled = false, onClick }) {
  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      style={{ ...styles.menuItem, color: disabled ? "var(--color-text-tertiary)" : "var(--color-text-medium)", cursor: disabled ? "default" : "pointer" }}
    >
      {children}
    </div>
  );
}

const styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "14px 16px",
    border: "1px solid",
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "left",
    transition: "border-color 120ms ease, background 120ms ease",
    minWidth: 0,
  },
  head: { display: "flex", alignItems: "center", gap: 8, minHeight: 24 },
  name: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  nameInput: {
    flex: 1,
    minWidth: 0,
    height: 26,
    padding: "0 8px",
    border: "1px solid var(--do-brand-blue)",
    borderRadius: 6,
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    outline: "none",
  },
  badge: {
    marginInlineStart: "auto",
    padding: "1px 8px",
    borderRadius: 999,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.2px",
  },
  allowance: { display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 },
  allowNum: { fontSize: 22, fontWeight: 600, color: "var(--color-text-deep)", fontVariantNumeric: "tabular-nums" },
  allowUnit: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  notSet: { fontSize: 15, fontWeight: 600, color: "var(--color-text-tertiary)" },
  count: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  actions: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 8 },
  setBtn: { fontSize: 12, fontWeight: 600, color: "var(--do-brand-blue)" },
  menuWrap: { position: "relative", flexShrink: 0 },
  menuScrim: { position: "fixed", inset: 0, background: "transparent", zIndex: 39 },
  menu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    insetInlineEnd: 0,
    minWidth: 150,
    background: "#FFFFFF",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 10,
    boxShadow: "0 16px 40px -16px rgba(17,17,26,0.4)",
    padding: 6,
    zIndex: 40,
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
  },
};
