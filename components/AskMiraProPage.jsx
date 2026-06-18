"use client";

import React from "react";
import MiraSpaceShell from "./MiraSpaceShell";

/**
 * AskMiraProPage — Ask Mira Pro module home route.
 *
 * The landing is the collaborative outcome "space" (Notion ticket:
 * [Ask Mira Pro] Landing page), rendered via MiraSpaceShell. Chat is no
 * longer a takeover surface — it lives in a collapsible right-hand column
 * inside the space (MiraChatColumn). This component is the adapter that
 * threads the parent-owned chat state/handlers (app/page.jsx) into the shell;
 * lifting that state avoids loss when PageLayout swaps its inner layout.
 *
 * @param {{
 *   queriesTotal?: number,
 *   conversation: Array<{ id: string, question: string, response: object | null }>,
 *   pendingTurnId: string | null,
 *   queriesUsed: number,
 *   onSubmit: (text: string) => void,
 *   onReset: () => void,
 *   setupContextOpen?: boolean,
 *   onToggleSetupContext?: () => void,
 * }} props
 */
export default function AskMiraProPage({
  queriesTotal = 1002,
  conversation,
  pendingTurnId,
  queriesUsed,
  onSubmit,
  onReset,
  setupContextOpen = false,
  onToggleSetupContext,
}) {
  return (
    <MiraSpaceShell
      conversation={conversation}
      pendingTurnId={pendingTurnId}
      queriesUsed={queriesUsed}
      queriesTotal={queriesTotal}
      onSubmit={onSubmit}
      onReset={onReset}
      setupContextOpen={setupContextOpen}
      onToggleSetupContext={onToggleSetupContext}
    />
  );
}
