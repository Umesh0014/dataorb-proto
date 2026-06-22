"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import MetricSparkline from "./MetricSparkline";
import { TREND_MONTHS } from "./mocks/miraLandingMetrics";

/**
 * MiraMetricDetail — drill-in for a single landing metric card.
 *
 * Two columns: the left holds the detailed report (headline, trend vs
 * target, breakdown, and key findings); the right lists the public chats
 * other users have run on the same category, so you can pick up a thread
 * instead of starting cold.
 *
 * @param {{
 *   metric: {
 *     label: string,
 *     Icon: React.ComponentType<{ size?: number, color?: string }>,
 *     unit?: string,
 *     trend: number[],
 *     target?: number,
 *     summary: string,
 *     findings: string[],
 *     rows: Array<{ label: string, value: string, tone?: string }>,
 *     publicChats: Array<{ id: string, user: string, initials: string, question: string, time: string, messages: number }>,
 *   },
 *   onBack: () => void,
 * }} props
 */
export default function MiraMetricDetail({ metric, onBack }) {
  const { label, Icon, unit = "", trend, target, summary, findings, rows, publicChats } = metric;
  const headline = rows[0];

  return (
    <div style={s.scroll}>
      <div style={s.wrap}>
        <div style={s.header}>
          <Button variant="text" leadingIcon={<ArrowLeft size={16} />} onClick={onBack}>
            Back
          </Button>
        </div>

        <div style={s.columns}>
          <div style={s.left}>
            <Card padX={24} padY={24}>
              <div style={s.reportHead}>
                <span style={s.iconWrap} aria-hidden="true">
                  <Icon size={18} color="var(--color-button-primary-bg)" />
                </span>
                <div>
                  <div style={s.reportTitle}>{label}</div>
                  <div style={s.reportHeadline}>
                    {headline.value}
                    <span style={s.reportHeadlineLabel}> · {headline.label}</span>
                  </div>
                </div>
              </div>

              <p style={s.summary}>{summary}</p>

              <div style={s.chartFrame}>
                <div style={s.chartHead}>
                  <span style={s.chartLabel}>Trend (last 8 months)</span>
                  {typeof target === "number" && (
                    <span style={s.targetLegend}>
                      <span style={s.targetDash} aria-hidden="true" />
                      Target {target}
                      {unit}
                    </span>
                  )}
                </div>
                <MetricSparkline
                  points={trend}
                  target={target}
                  labels={TREND_MONTHS}
                  color="var(--color-button-primary-bg)"
                  formatValue={(v) => `${Math.round(v)}${unit}`}
                />
              </div>

              <div style={s.breakdown}>
                {rows.map((row) => (
                  <div key={row.label} style={s.breakdownRow}>
                    <span style={s.breakdownLabel}>{row.label}</span>
                    <span style={{ ...s.breakdownValue, ...toneStyle(row.tone) }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div style={s.findings}>
                <div style={s.findingsTitle}>Key findings</div>
                <ul style={s.findingsList}>
                  {findings.map((f) => (
                    <li key={f} style={s.findingsItem}>{f}</li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          <div style={s.right}>
            <div style={s.rightHead}>
              <span style={s.rightTitle}>Public chats by others</span>
              <span style={s.rightCount}>{publicChats.length}</span>
            </div>
            <Card padX={0} padY={0}>
              <div style={s.chatList}>
                {publicChats.map((c) => (
                  <div key={c.id} style={s.chatRow}>
                    <span style={s.avatar} aria-hidden="true">{c.initials}</span>
                    <div style={s.chatText}>
                      <span style={s.chatQuestion}>{c.question}</span>
                      <span style={s.chatMeta}>
                        {c.user} · {c.time} · {c.messages} messages
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function toneStyle(tone) {
  if (tone === "positive") return { color: "var(--color-success)" };
  if (tone === "negative") return { color: "var(--color-error)" };
  return { color: "var(--color-text-deep)" };
}

const s = {
  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
  },
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: "100%",
    maxWidth: 980,
    marginInline: "auto",
    paddingBottom: 8,
  },
  header: {
    display: "flex",
    alignItems: "center",
  },

  columns: {
    display: "flex",
    gap: 20,
    alignItems: "flex-start",
  },
  left: {
    flex: 1,
    minWidth: 0,
  },
  right: {
    width: 320,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  reportHead: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "var(--color-primary-alpha-12)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  reportHeadline: {
    fontSize: 24,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.2,
  },
  reportHeadlineLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  summary: {
    margin: "0 0 20px",
    fontSize: 14,
    lineHeight: 1.6,
    color: "var(--color-text-medium)",
  },

  chartFrame: {
    border: "1px solid var(--color-divider-card)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  chartHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  chartLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  targetLegend: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  targetDash: {
    width: 16,
    height: 0,
    borderTop: "1px dashed var(--color-text-tertiary)",
  },

  breakdown: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginBottom: 20,
  },
  breakdownRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  breakdownLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },

  findings: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  findingsTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  findingsList: {
    margin: 0,
    paddingLeft: 18,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  findingsItem: {
    fontSize: 13,
    lineHeight: 1.5,
    color: "var(--color-text-medium)",
  },

  rightHead: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    paddingInline: 4,
  },
  rightTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  rightCount: {
    minWidth: 20,
    height: 20,
    paddingInline: 6,
    borderRadius: 10,
    background: "var(--color-primary-alpha-12)",
    color: "var(--color-button-primary-bg)",
    fontSize: 11,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chatList: {
    display: "flex",
    flexDirection: "column",
  },
  chatRow: {
    display: "flex",
    gap: 12,
    padding: "14px 16px",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    background: "var(--color-card-emoji-bg)",
    border: "1px solid var(--color-divider-card)",
    color: "var(--color-text-medium)",
    fontSize: 12,
    fontWeight: 700,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  chatText: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  chatQuestion: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  chatMeta: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
};
