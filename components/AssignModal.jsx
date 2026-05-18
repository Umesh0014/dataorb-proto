"use client";

import React from "react";
import Card from "./Card";
import Button from "./Button";

// AssignModal — stub "Confirm assignment" dialog for the Next Best Action
// layer. Renders nothing unless `asset` ({ name, duration }) is supplied;
// the parent owns open/close + the post-confirm toast.
//
// TODO: the codebase has no modal/dialog primitive and no backdrop-scrim
// token — the scrim reuses --overlay-selected. Confirm a modal pattern with
// design before this ships beyond the prototype.
export default function AssignModal({ asset, onConfirm, onClose }) {
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!asset) return null;

  return (
    <div style={modalStyles.scrim} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <Card shadow padX={24} padY={20} style={modalStyles.dialog}>
          <div style={modalStyles.title}>Confirm assignment</div>
          <div style={modalStyles.detail}>
            <span style={modalStyles.label}>Asset</span>
            <span style={modalStyles.value}>{asset.name}</span>
          </div>
          <div style={modalStyles.detail}>
            <span style={modalStyles.label}>Duration</span>
            <span style={modalStyles.value}>{asset.duration}</span>
          </div>
          <div style={modalStyles.actions}>
            <Button variant="primary" onClick={onConfirm}>
              Confirm
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

const modalStyles = {
  scrim: {
    position: "fixed",
    inset: 0,
    background: "var(--overlay-selected)",
    display: "grid",
    placeItems: "center",
    zIndex: 60,
  },
  dialog: {
    width: 380,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  detail: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  value: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--do-ink)",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 4,
  },
};
