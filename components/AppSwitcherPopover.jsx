"use client";

import React from "react";
import RailFlyout, { RailFlyoutItem } from "./SideNav/RailFlyout";

const APP_MENU_ITEMS = [
  { key: "insights",  label: "Insights Hub" },
  { key: "learning",  label: "Learning Hub" },
  { key: "mira",      label: "Ask Mira Pro" },
  { key: "recruiter", label: "AI Recruiter" },
];

export default function AppSwitcherPopover({
  open,
  onClose,
  anchorRef,
  currentPage,
  onSelectPage,
}) {
  return (
    <RailFlyout
      open={open}
      onClose={onClose}
      anchorRef={anchorRef}
      ariaLabel="Apps"
    >
      {APP_MENU_ITEMS.map((item) => (
        <RailFlyoutItem
          key={item.key}
          label={item.label}
          selected={currentPage === item.key}
          onClick={() => onSelectPage?.(item.key)}
        />
      ))}
    </RailFlyout>
  );
}
