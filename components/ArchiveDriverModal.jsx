"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Archive } from "lucide-react";
import Button from "./Button";
import { AFFECTED_AREAS } from "./mocks/roleplayDrivers";

// ArchiveDriverModal — confirmation dialog for archiving a Roleplay
// Driver. Mirrors the CreateDriverModal scrim/panel chrome so both modals
// in the Roleplay Drivers flow read as siblings. Lists the static
// AFFECTED_AREAS so reviewers see the downstream surfaces a real driver
// archive would touch. Primary action carries the `Archive` icon to match
// the Figma spec.

export default function ArchiveDriverModal({ open, driverName, onClose, onConfirm }) {
  const dialogRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  React.useEffect(() => {
    if (open && dialogRef.current) dialogRef.current.focus();
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const handleScrimClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return createPortal(
    <div role="presentation" style={styles.scrim} onClick={handleScrimClick}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-driver-title"
        aria-describedby="archive-driver-desc"
        tabIndex={-1}
        style={styles.dialog}
      >
        <h2 id="archive-driver-title" style={styles.title}>
          Archive “{driverName}” Driver?
        </h2>
        <div id="archive-driver-desc" style={styles.body}>
          <p style={styles.lead}>
            Are you sure you want to archive this driver? The following areas
            will be affected:
          </p>
          <ul style={styles.list}>
            {AFFECTED_AREAS.map((area) => (
              <li key={area} style={styles.listItem}>{area}</li>
            ))}
          </ul>
        </div>

        <div style={styles.actions}>
          <Button variant="text" uppercase={false} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            uppercase={false}
            leadingIcon={<Archive size={16} />}
            onClick={onConfirm}
          >
            Archive
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const styles = {
  scrim: {
    position: "fixed",
    inset: 0,
    zIndex: 60,
    background: "rgba(27, 27, 31, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    width: "min(520px, 100%)",
    background: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 24px 64px rgba(27, 27, 31, 0.24)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    fontFamily: "var(--font-sans)",
    outline: "none",
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  lead: {
    margin: 0,
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-medium)",
    lineHeight: 1.5,
  },
  list: {
    margin: 0,
    paddingLeft: 20,
    // Global resets in the project zero list-style on ul/ol; restore here
    // so the affected-areas bullets render as designed.
    listStyleType: "disc",
    listStylePosition: "outside",
  },
  listItem: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-medium)",
    lineHeight: 1.7,
    display: "list-item",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    paddingTop: 4,
  },
};
