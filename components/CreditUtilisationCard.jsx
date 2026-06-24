"use client";

import React from "react";
import StatCard from "./StatCard";
import { Section, CapacityBar, CapAlertBanner } from "./CreditsUsageParts";

// CreditUtilisationCard — the tenant-level committed-capacity header shown
// above every assignment approach. Big % consumed + a capacity bar + the
// three pool/consumed/remaining tiles, with the over-cap alert docked at the
// bottom when agents are paused. Pure presentation; figures come from the
// quota mock and the derived overCap.
export default function CreditUtilisationCard({ quota, consumedPct, overCap, onViewAgents, fyi, headerRight }) {
  return (
    <Section
      title="Credit utilisation"
      description={`${quota.consumedMin.toLocaleString()} of ${quota.totalMin.toLocaleString()} committed min used · ${quota.periodLabel}`}
      headerRight={headerRight}
    >
      <div style={styles.consumedLine}>
        <span style={styles.consumedPct}>{consumedPct}%</span>
        <span style={styles.consumedCaption}>of committed capacity consumed</span>
      </div>
      <CapacityBar used={quota.consumedMin} total={quota.totalMin} height={10} />
      <div style={styles.statRow}>
        <StatCard size="md" labelStyle="uppercase" label="Total pool" value={`${quota.totalMin.toLocaleString()} min`} sublabel={quota.totalSub} />
        <StatCard size="md" labelStyle="uppercase" label="Consumed" value={`${quota.consumedMin.toLocaleString()} min`} sublabel={quota.consumedSub} />
        <StatCard size="md" labelStyle="uppercase" label="Remaining" value={`${quota.remainingMin.toLocaleString()} min`} sublabel={quota.remainingSub} />
      </div>
      {overCap && (
        <CapAlertBanner
          count={overCap.count}
          resetDay={overCap.resetDay}
          tone={overCap.tone}
          message={overCap.message}
          onViewAgents={onViewAgents}
        />
      )}
      {fyi}
    </Section>
  );
}

const styles = {
  consumedLine: { display: "flex", alignItems: "baseline", gap: 8 },
  consumedPct: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1,
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
  consumedCaption: { fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  statRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
};
