"use client";

import React from "react";

// PersonaContext — app-shell persona state shared by the top-right
// PersonaPill and any module screen that needs to gate manager-only
// chrome (Roleplay Team Lead spec Phase 1, Q5(b): Agent persona hides
// manager controls and renders the same surfaces read-only).
//
// Default = "Team Lead". The Roleplay Figma spec uses "Team Lead" (no
// trailing "er"); we standardize on that label everywhere — earlier
// Missions code that used "Team Leader" is migrated in the same change.
// In-memory only — no browser storage; reload resets to default.

export const PERSONAS = ["Team Lead", "Agent"];
export const DEFAULT_PERSONA = "Team Lead";

const PersonaCtx = React.createContext(null);

export function PersonaProvider({ children, initialPersona = DEFAULT_PERSONA }) {
  const [persona, setPersona] = React.useState(initialPersona);
  const value = React.useMemo(
    () => ({ persona, setPersona, isAgent: persona === "Agent" }),
    [persona],
  );
  return <PersonaCtx.Provider value={value}>{children}</PersonaCtx.Provider>;
}

// usePersona — read+write the app-shell persona. Falls back to the
// default outside a provider so unit-renders / sandbox callers don't
// crash; production paths always render inside <PersonaProvider>.
export function usePersona() {
  const ctx = React.useContext(PersonaCtx);
  if (ctx) return ctx;
  return {
    persona: DEFAULT_PERSONA,
    setPersona: () => {},
    isAgent: false,
  };
}
