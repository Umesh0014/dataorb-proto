"use client";

import React from "react";
import { ArrowLeft, Send, Presentation } from "lucide-react";
import Card from "./Card";
import Button from "./Button";

/**
 * CoachingBriefHeader — shared header chrome across the three Coaching
 * Brief variants (Deck / Editorial / Document). Carries identity (kind ·
 * agent · period), an explicitly-blocked "Send to team lead" action
 * (INT-8 — irreversible action visibly blocked rather than failing
 * silently), an optional disabled "Present" affordance for the Document
 * variant, and the v1 auto-generated status pill.
 *
 * The back-button wrapper extends the icon button's effective hit area
 * to 48×48 so it clears the WCAG-6 44px floor without changing the
 * Button primitive's documented sizes.
 *
 * Props:
 *   overview         the overview section (agent / period / brand / schemaVersion)
 *   onBack           back handler
 *   showPresent      render a disabled Present button (Document variant only)
 */
export default function CoachingBriefHeader({ overview, onBack, showPresent = false }) {
  return (
    <Card padX={0} padY={0} shadow style={cbhStyles.headerCard}>
      <div style={cbhStyles.headerInner}>
        <span style={cbhStyles.backWrap}>
          <Button variant="icon" size="md" onClick={onBack} aria-label="Back to Coaching">
            <ArrowLeft size={20} color="var(--color-text-medium)" />
          </Button>
        </span>
        <span style={cbhStyles.kind}>Coaching Brief</span>
        <Dot />
        <span style={cbhStyles.agent}>{overview.agentName}</span>
        <Dot />
        <span style={cbhStyles.period}>{overview.period}</span>
        <div style={{ flex: 1 }} />
        {showPresent && (
          <Button
            variant="text"
            uppercase={false}
            leadingIcon={
              <Presentation size={16} color="var(--color-text-medium)" aria-hidden="true" />
            }
            aria-label="Present brief — not yet available"
            title="Present mode is planned — not available in v1"
            disabled
          >
            Present
          </Button>
        )}
        <Button
          variant="text"
          uppercase={false}
          leadingIcon={
            <Send size={16} color="var(--color-text-tertiary)" aria-hidden="true" />
          }
          aria-label="Send to team lead — not yet available"
          title="Sending requires Neil's review of metadata fields"
          disabled
        >
          Send to team lead
        </Button>
        <span style={cbhStyles.statusPill}>
          v{overview.schemaVersion} · Auto-generated
        </span>
      </div>
    </Card>
  );
}

function Dot() {
  return <span style={cbhStyles.dot} aria-hidden="true" />;
}

const cbhStyles = {
  headerCard: { boxShadow: "var(--shadow-card)" },
  headerInner: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 20px",
    minHeight: 56,
  },
  backWrap: {
    display: "inline-grid",
    placeItems: "center",
    padding: 8,
    marginInline: -8,
  },
  kind: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.06em",
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
  },
  agent: {
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    letterSpacing: "0.1px",
  },
  period: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    background: "var(--color-text-placeholder)",
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    borderRadius: 999,
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.05em",
  },
};
