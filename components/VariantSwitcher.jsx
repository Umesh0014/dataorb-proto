"use client";

import React from "react";
import DarkPillSwitcher from "./DarkPillSwitcher";

// VariantSwitcher — demo-only M1/M2 variant pill (Part F §F3). Sibling
// chrome to PersonaSwitcher (same dark family via DarkPillSwitcher).
// Visible only when persona = Team Leader (gate handled by parent).
//
// M2 is the default (current Team Leader view). M1 swaps the swimlane
// composition to Upcoming / Active / At Risk / Completed — Draft is
// silently hidden (spec §F8 #3 default b), all other Team Leader chrome
// stays intact (+Mission CTA, filters, full curtain).

export const VARIANTS = ["M1", "M2"];

export default function VariantSwitcher({ variant, onChange }) {
  return (
    <DarkPillSwitcher
      ariaLabel="Mission layout variant switcher"
      value={variant}
      options={VARIANTS}
      onChange={onChange}
    />
  );
}
