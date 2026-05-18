"use client";

// TrendArrow — up / down trend arrow glyph. Colour is inherited via
// currentColor, so each caller sets the semantic colour for its context
// (e.g. QA Score on AgentsPage, coaching tiles on the Agent Profile).
export default function TrendArrow({ up, size = 11 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      aria-hidden="true"
      style={{ transform: up ? "none" : "rotate(180deg)", flexShrink: 0 }}
    >
      <path d="M6 2L10 7.2H7.4V10.5H4.6V7.2H2L6 2Z" fill="currentColor" />
    </svg>
  );
}
