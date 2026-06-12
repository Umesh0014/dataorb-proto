"use client";

import React from "react";
import Card from "./Card";
import Button from "./Button";
import { MetricTile, CapacityBar, UsageTrendChart } from "./CreditsUsageParts";
import { TENANT_SAMPLE, TREND_DATA } from "./mocks/creditsUsage";

// TenantCapacityHero — the committed-capacity header shared by every option-C
// iteration (I1/I2/I3): a prominent used/committed bar, three KPI tiles, the
// usage trend, and the page Save action. Extracted once all three iterations
// rendered it identically (rule of three).

export default function TenantCapacityHero({ allocatedCap, usageMode, additionalCap, onSave, saveDisabled }) {
  const usedPct = Math.round((TENANT_SAMPLE.usedThisPeriod / allocatedCap) * 100);
  return (
    <Card padX={0} padY={0} style={heroStyles.hero}>
      <header style={heroStyles.header}>
        <div>
          <h2 style={heroStyles.title}>Tenant capacity</h2>
          <p style={heroStyles.sub}>
            {TENANT_SAMPLE.usedThisPeriod.toLocaleString()} of {allocatedCap.toLocaleString()}{" "}
            committed min used · {TENANT_SAMPLE.periodLabel}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={saveDisabled}
          style={{ height: 36, paddingInline: 20 }}
        >
          Save changes
        </Button>
      </header>
      <div style={heroStyles.body}>
        <div style={heroStyles.bar}>
          <div style={heroStyles.barTop}>
            <span style={heroStyles.barPct}>{usedPct}%</span>
            <span style={heroStyles.barNote}>of committed capacity</span>
          </div>
          <CapacityBar used={TENANT_SAMPLE.usedThisPeriod} total={allocatedCap} height={10} />
        </div>
        <div style={heroStyles.kpiRow}>
          <MetricTile label="Committed" value={`${allocatedCap.toLocaleString()} min`} sub="Billed per contract" />
          <MetricTile
            label="Additional cap"
            value={usageMode === "additional" ? `${additionalCap.toLocaleString()} min` : "Off"}
            sub={usageMode === "additional" ? "Allowed on top" : "Hard stop at commitment"}
            chipLabel={usageMode === "additional" ? "Capped" : undefined}
          />
          <MetricTile
            label="Active agents"
            value={`${TENANT_SAMPLE.activeAgents} of ${TENANT_SAMPLE.totalAgents}`}
            sub={`Practiced ${TENANT_SAMPLE.periodLabel.toLowerCase()}`}
          />
        </div>
        <UsageTrendChart data={TREND_DATA} />
      </div>
    </Card>
  );
}

const heroStyles = {
  hero: { border: "1px solid var(--color-border-card-soft)", display: "flex", flexDirection: "column" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "16px 20px",
    borderBottom: "1px solid #F9F9FF",
  },
  title: { margin: 0, fontSize: 16, fontWeight: 600, color: "var(--color-text-deep)" },
  sub: { margin: "4px 0 0", fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)" },
  body: { display: "flex", flexDirection: "column", gap: 18, padding: 20 },
  bar: { display: "flex", flexDirection: "column", gap: 8 },
  barTop: { display: "flex", alignItems: "baseline", gap: 8 },
  barPct: { fontSize: 22, fontWeight: 600, color: "var(--color-text-deep)", fontVariantNumeric: "tabular-nums" },
  barNote: { fontSize: 12, color: "var(--color-text-tertiary)" },
  kpiRow: { display: "flex", gap: 12 },
};
