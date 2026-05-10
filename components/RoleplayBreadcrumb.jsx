"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import Button from "./Button";

// RoleplayBreadcrumb — shared two-step breadcrumb for the New Roleplay
// wizard. `active` controls which step is highlighted in primary color.
// View Sample button on the right (no-op handler passed in).
export default function RoleplayBreadcrumb({ active = "persona", onViewSample }) {
  const isPersona = active === "persona";
  return (
    <div style={bcStyles.row}>
      <div style={bcStyles.crumbs}>
        <span style={isPersona ? bcStyles.active : bcStyles.inactive}>
          Enter Persona Details
        </span>
        <ChevronRight size={14} color="var(--color-text-tertiary)" />
        <span style={!isPersona ? bcStyles.active : bcStyles.inactive}>
          Add Conversation Context
        </span>
      </div>
      <Button variant="text" onClick={onViewSample}>View Sample</Button>
    </div>
  );
}

const bcStyles = {
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottom: "1px solid var(--color-divider-card)",
  },
  crumbs: { display: "flex", alignItems: "center", gap: 8 },
  active: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-button-primary-bg)",
  },
  inactive: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
};
