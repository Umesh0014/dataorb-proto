"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import Button from "./Button";
import { lhWizard, lhDir } from "./learningHubLocale";

// RoleplayBreadcrumb — shared two-step breadcrumb for the New Roleplay
// wizard. `active` controls which step is highlighted in primary color.
// View Sample button on the right (no-op handler passed in). Under RTL the
// row mirrors via the document direction and the separator chevron is
// flipped to point in the reading direction.
export default function RoleplayBreadcrumb({ active = "persona", onViewSample, locale = "en" }) {
  const isPersona = active === "persona";
  const isRtl = lhDir(locale) === "rtl";
  return (
    <div style={bcStyles.row}>
      <div style={bcStyles.crumbs}>
        <span style={isPersona ? bcStyles.active : bcStyles.inactive}>
          {lhWizard(locale, "bcPersona")}
        </span>
        <ChevronRight
          size={14}
          color="var(--color-text-tertiary)"
          style={isRtl ? { transform: "scaleX(-1)" } : undefined}
        />
        <span style={!isPersona ? bcStyles.active : bcStyles.inactive}>
          {lhWizard(locale, "bcContext")}
        </span>
      </div>
      <Button variant="text" onClick={onViewSample}>{lhWizard(locale, "viewSample")}</Button>
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
