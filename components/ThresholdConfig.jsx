"use client";

import React from "react";
import { X } from "lucide-react";
import Card from "./Card";
import { COMPETENCIES } from "./mocks/improveLanes";

// ThresholdConfig — vertical slider list for configuring competency thresholds.
// Each row: competency label, "below X%" descriptor, and a range slider.
// Shared across all Improve directions.

export default function ThresholdConfig({ thresholds, onChange, onClose }) {
  return (
    <Card padX={20} padY={16}>
      <div style={styles.header}>
        <div>
          <h4 style={styles.title}>Thresholds</h4>
          <p style={styles.subtitle}>Flag agents scoring below these levels</p>
        </div>
        <button type="button" className="im-focusable" onClick={onClose} style={styles.closeBtn} aria-label="Close config">
          <X size={16} />
        </button>
      </div>
      <div style={styles.list}>
        {COMPETENCIES.map((c) => {
          const val = thresholds[c.id];
          return (
            <div key={c.id} style={styles.item}>
              <div style={styles.itemTop}>
                <span style={styles.label}>{c.label}</span>
                <span style={styles.value}>below {val}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={val}
                onChange={(e) => onChange((t) => ({ ...t, [c.id]: Number(e.target.value) }))}
                style={styles.slider}
                aria-label={`${c.label} threshold`}
              />
              <div style={styles.rangeLabels}>
                <span style={styles.rangeEdge}>0%</span>
                <span style={styles.rangeEdge}>100%</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  subtitle: {
    margin: "2px 0 0",
    fontSize: 12,
    color: "var(--color-text-tertiary)",
  },
  closeBtn: {
    all: "unset",
    cursor: "pointer",
    width: 28,
    height: 28,
    borderRadius: 6,
    display: "grid",
    placeItems: "center",
    color: "var(--color-text-tertiary)",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  item: {
    padding: "12px 0",
    borderTop: "1px solid var(--color-divider-card, rgba(0,0,0,0.06))",
  },
  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  value: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-error-text)",
    background: "var(--color-error-bg)",
    padding: "2px 8px",
    borderRadius: 4,
  },
  slider: {
    width: "100%",
    height: 6,
    cursor: "pointer",
    accentColor: "var(--do-brand-blue)",
  },
  rangeLabels: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 4,
  },
  rangeEdge: {
    fontSize: 10,
    color: "var(--color-text-tertiary)",
  },
};
