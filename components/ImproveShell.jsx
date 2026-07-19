"use client";

import React from "react";
import DarkPillSwitcher from "./DarkPillSwitcher";
import ImproveLanes from "./ImproveLanes";
import ImproveTable from "./ImproveTable";
import ImproveMatrix from "./ImproveMatrix";

// ImproveShell — entry point for the "Improve" surface (Jul 17 pivot).
// Hosts 3 structurally distinct direction variants behind a DarkPillSwitcher
// pinned to the bottom-right corner (floating, non-intrusive).

const VARIANTS = ["Lanes", "Table", "Matrix"];

export default function ImproveShell() {
  const [variant, setVariant] = React.useState("Lanes");

  return (
    <div style={shellStyles.wrap}>
      {variant === "Lanes" && <ImproveLanes />}
      {variant === "Table" && <ImproveTable />}
      {variant === "Matrix" && <ImproveMatrix />}
      <div style={shellStyles.switcherFloat}>
        <DarkPillSwitcher
          value={variant}
          options={VARIANTS}
          onChange={setVariant}
          ariaLabel="Improve direction switcher"
        />
      </div>
    </div>
  );
}

const shellStyles = {
  wrap: { position: "relative", minHeight: "100%" },
  switcherFloat: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 100,
  },
};
