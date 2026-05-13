"use client";

import React from "react";

// SelectionAccentBar — 4px-tall gradient bar that pins to the top edge
// of a selected list card. Rendered conditionally inside the card
// (parent must set position:relative + overflow:hidden so the bar
// follows the card's border-radius silhouette).
//
// Gradient stops use the existing brand + secondary tokens
// (`--do-brand-blue` → `--color-secondary-500`).
//
// TODO: stories

export default function SelectionAccentBar() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: "linear-gradient(90deg, var(--do-brand-blue) 0%, var(--color-secondary-500) 100%)",
      }}
    />
  );
}
