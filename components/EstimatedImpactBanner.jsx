"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import Card from "./Card";

// EstimatedImpactBanner — single outline Card that surfaces the bill
// consequence of a pending bucket move before the admin commits to it.
// The standing over-cap state lives inside the utilisation card; this
// banner is only the transient move forecast. Renders nothing otherwise —
// the page only mounts it when a move is pending.
export default function EstimatedImpactBanner({ pendingChange }) {
  if (!pendingChange) return null;

  const { count, bucketName, capMin, estDelta } = pendingChange;
  return (
    <Banner Icon={TrendingUp} tone="info">
      Moving <strong>{count} {count === 1 ? "agent" : "agents"}</strong> to {bucketName} ({capMin} min)
      could raise next month&apos;s bill by <strong>~${estDelta.toLocaleString()}</strong>. The forecast
      settles in 2–24h.
    </Banner>
  );
}

const TONES = {
  info: { fg: "var(--color-icon-tertiary-fg)", text: "var(--color-text-medium)" },
};

function Banner({ Icon, tone, children }) {
  const t = TONES[tone] || TONES.info;
  return (
    <Card tone="outline" padX={16} padY={14} style={styles.card} role="status">
      <Icon size={16} color={t.fg} style={styles.icon} aria-hidden="true" />
      <span style={{ ...styles.text, color: t.text }}>{children}</span>
    </Card>
  );
}

const styles = {
  card: { display: "flex", alignItems: "flex-start", gap: 10 },
  icon: { flexShrink: 0, marginTop: 1 },
  text: { fontSize: 12, fontWeight: 500, lineHeight: "18px" },
};
