"use client";

import React from "react";
import DarkPillSwitcher from "./DarkPillSwitcher";

// PersonaSwitcher — demo-only persona preview pill (Part E, restyled in
// Part F to the dark-UI family). Chrome lives in DarkPillSwitcher so the
// persona + variant switchers read as visual siblings. No fixed
// positioning here — the parent (MissionsLandingShell) handles bottom-
// right anchoring + vertical stacking with the variant switcher.
//
// Removability: when the demo ends, delete this file + VariantSwitcher +
// DarkPillSwitcher + the persona / variant state in MissionsLandingShell
// + the persona / variant prop chain through MissionsKanbanLayout /
// MissionDetailContent. Demo logic never enters shared components
// (gated at page level only).

export const PERSONAS = ["Team Leader", "Agent"];

export default function PersonaSwitcher({ persona, onChange }) {
  return (
    <DarkPillSwitcher
      ariaLabel="Persona preview switcher"
      value={persona}
      options={PERSONAS}
      onChange={onChange}
    />
  );
}
