"use client";

import React from "react";
import SideNav from "./SideNav/SideNav";
import PageLayout from "./PageLayout";
import { insightsHubConfig } from "./SideNav/configs/insightsHubConfig";

// DashboardShell — page chassis for Insights Hub.
// Composes <SideNav> on the left and <PageLayout> for everything to the
// right. Spacing and gutters come from PageLayout tokens — this
// component owns nothing layout-specific anymore.

export default function DashboardShell({
  children,
  activeId = "insights",
  onSelect,
  onAppMenuClick,
  onHelpClick,
  onSettingsClick,
  onAvatarClick,
  appMenuTriggerRef,
  config = insightsHubConfig,
  rightPanel = null,
  onPanelClose,
}) {
  return (
    <>
      <SideNav
        config={config}
        activeId={activeId}
        onSelect={onSelect}
        onAppSwitcherClick={onAppMenuClick}
        onHelpClick={onHelpClick}
        onSettingsClick={onSettingsClick}
        onAvatarClick={onAvatarClick}
        appSwitcherTriggerRef={appMenuTriggerRef}
      />
      <PageLayout rightPanel={rightPanel} onPanelClose={onPanelClose}>{children}</PageLayout>
    </>
  );
}
