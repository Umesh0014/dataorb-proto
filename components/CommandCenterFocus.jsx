"use client";

import React from "react";
import { PartyPopper, Repeat, GraduationCap, Target, Plus, MessageSquare, Download } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Banner from "./Banner";
import InlineStatusAffordance from "./InlineStatusAffordance";
import MetricSparkline from "./MetricSparkline";
import AttentionItemCard, { ItemKebab } from "./AttentionItemCard";
import CommandCenterTeamStrip from "./CommandCenterTeamStrip";
import { rankItems, SEVERITY_META, INTERVENTION_META, toneInk } from "./mocks/commandCenter";

// CommandCenterFocus (Variant C) — editorial "Monday-morning" digest. Reads
// top-down in one ~760px column: the single highest-priority action as a
// hero ("start here"), a short "also needs you today" list, then a "this
// worked last week" recap. Answers JTBD-1/2 ("in 5 minutes, who needs me and
// what do I do") with an editorial, white-surface treatment (UI-10) rather
// than an operational grid.

const INTERVENTION_ICON = { Repeat, GraduationCap, Target, Plus, MessageSquare };

export default function CommandCenterFocus({
  items,
  resolved,
  onLaunch,
  onOpenDetail,
  onOpenAgent,
  onSnooze,
  onDismiss,
  onMarkHandled,
}) {
  const open = rankItems(items.filter((it) => it.status === "open"));
  const [hero, ...rest] = open;
  const improved = resolved.filter((r) => r.status === "improved");

  return (
    <div style={fStyles.column}>
      <CommandCenterTeamStrip subtitle="Your 5-minute Monday read — who needs you, and what to do first" />

      {hero ? (
        <FocusHero
          item={hero}
          onLaunch={() => onLaunch(hero.id)}
          onOpenDetail={() => onOpenDetail(hero.id)}
          onOpenAgent={onOpenAgent}
          onSnooze={() => onSnooze(hero.id)}
          onDismiss={() => onDismiss(hero.id)}
          onMarkHandled={() => onMarkHandled(hero.id)}
        />
      ) : (
        <Banner
          tone="success"
          leading={<PartyPopper size={20} style={{ color: "var(--color-success)", flexShrink: 0 }} />}
          heading="Nothing needs you first thing"
          body={`Your team is on track. ${improved.length} interventions improved a metric this cycle — see below.`}
        />
      )}

      {rest.length > 0 && (
        <section style={fStyles.section}>
          <h2 style={fStyles.sectionTitle}>Also needs you today</h2>
          <div style={fStyles.list}>
            {rest.map((item) => (
              <AttentionItemCard
                key={item.id}
                item={item}
                status="open"
                onLaunch={() => onLaunch(item.id)}
                onOpenDetail={() => onOpenDetail(item.id)}
                onOpenAgent={onOpenAgent}
                onSnooze={() => onSnooze(item.id)}
                onDismiss={() => onDismiss(item.id)}
                onMarkHandled={() => onMarkHandled(item.id)}
              />
            ))}
          </div>
        </section>
      )}

      {improved.length > 0 && (
        <section style={fStyles.section}>
          <div style={fStyles.recapHeader}>
            <h2 style={fStyles.sectionTitle}>This worked last week</h2>
            <Button
              variant="text"
              uppercase={false}
              trailingIcon={<Download size={15} aria-hidden="true" />}
              onClick={() => downloadRecap(improved)}
            >
              Download
            </Button>
          </div>
          <p style={fStyles.sectionLede}>Take these into a 1:1 or up-report — coaching that moved the metric.</p>
          <Card tone="outline" padX={20} padY={8}>
            {improved.map((r, i) => (
              <button
                key={r.id}
                type="button"
                className="cc-focusable"
                onClick={() => onOpenAgent?.(r.agent.id)}
                style={{ ...fStyles.recapRow, borderTop: i === 0 ? "none" : "1px solid var(--color-divider-card)" }}
              >
                <span style={fStyles.recapAvatar}>{r.agent.initials}</span>
                <span style={fStyles.recapMain}>
                  <span style={fStyles.recapName}>{r.agent.name}</span>
                  <span style={fStyles.recapComp}>{r.competency} · {r.intervention.asset}</span>
                </span>
                <InlineStatusAffordance tone="success" style={{ color: toneInk("success") }}>↑ {r.delta.label} {r.delta.value}</InlineStatusAffordance>
              </button>
            ))}
          </Card>
        </section>
      )}
    </div>
  );
}

// FocusHero — the single "start here" action, given editorial weight: large
// type, the evidence + trend, the recommended intervention, and a prominent
// Launch. Reuses MetricSparkline / Button / InlineStatusAffordance.
function FocusHero({ item, onLaunch, onOpenDetail, onOpenAgent, onSnooze, onDismiss, onMarkHandled }) {
  const sev = SEVERITY_META[item.severity];
  const interv = INTERVENTION_META[item.intervention.kind];
  const IntervIcon = INTERVENTION_ICON[interv.icon] || Target;
  return (
    <Card padX={28} padY={26} shadow style={fStyles.hero}>
      <div style={fStyles.heroEyebrow}>
        <span style={fStyles.startHere}>Start here</span>
        <InlineStatusAffordance tone={sev.tone} icon={<Dot tone={sev.tone} />} style={{ color: toneInk(sev.tone) }}>{sev.label} priority</InlineStatusAffordance>
      </div>
      <div style={fStyles.heroIdentity}>
        <button
          type="button"
          className="cc-focusable"
          onClick={() => onOpenAgent?.(item.agent.id)}
          style={fStyles.heroAvatar}
          aria-label={`Open ${item.agent.name}'s profile`}
        >
          {item.agent.initials}
        </button>
        <div style={{ minWidth: 0 }}>
          <h2 style={fStyles.heroName}>{item.agent.name}</h2>
          <div style={fStyles.heroTags}>
            <span style={fStyles.heroComp}>{item.competency}</span>
            {item.driver && <span style={fStyles.heroDriver}>{item.driver}</span>}
          </div>
        </div>
      </div>

      <p style={fStyles.heroEvidence}>{item.evidence}</p>

      {item.metric && (
        <div style={fStyles.heroMetric}>
          <span style={fStyles.heroSpark} role="img" aria-label={`${item.competency} trend, now ${item.metric.current}${item.metric.unit}`}>
            <MetricSparkline
              points={item.metric.points}
              labels={item.metric.labels}
              color="var(--color-error)"
              formatValue={(v) => `${Math.round(v)}${item.metric.unit}`}
            />
          </span>
          <span style={fStyles.heroNow}>{item.metric.current}{item.metric.unit}</span>
        </div>
      )}

      <div style={fStyles.heroInterv}>
        <IntervIcon size={16} aria-hidden="true" style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={fStyles.heroIntervVerb}>{interv.label}</span>
          <span style={fStyles.heroIntervAsset}>{item.intervention.asset} · {item.intervention.duration}</span>
        </div>
      </div>

      <div style={fStyles.heroActions}>
        <Button variant="primary" onClick={onLaunch}>Launch intervention</Button>
        <Button variant="text" uppercase={false} onClick={onOpenDetail}>View details</Button>
        <ItemKebab
          onOpenAgent={() => onOpenAgent?.(item.agent.id)}
          onSnooze={onSnooze}
          onDismiss={onDismiss}
          onMarkHandled={onMarkHandled}
        />
      </div>
    </Card>
  );
}

// downloadRecap — exports the "this worked" outcomes as a plain-text file the
// lead can drop into a 1:1 or up-report. Real client-side download (Blob +
// anchor), no new deps; satisfies the editorial downloadable-artifact lever.
function downloadRecap(improved) {
  const lines = ["This worked last week — coaching that moved the metric", ""];
  improved.forEach((r) => {
    lines.push(`- ${r.agent.name} · ${r.competency}: ${r.intervention.asset} → ${r.delta.label} ${r.delta.value} ${r.delta.window}`);
  });
  if (typeof document === "undefined") return;
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "command-center-this-worked.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Dot({ tone }) {
  const color = {
    danger: "var(--color-error)", warning: "var(--color-warning)",
    info: "var(--color-info)", success: "var(--color-success)", tertiary: "var(--color-text-tertiary)",
  }[tone] || "var(--color-text-tertiary)";
  return <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

const fStyles = {
  column: { maxWidth: 760, marginInline: "auto", width: "100%", display: "flex", flexDirection: "column", gap: 28 },
  section: { display: "flex", flexDirection: "column", gap: 12 },
  recapHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  sectionTitle: { margin: 0, fontFamily: "var(--font-sans)", fontSize: 17, fontWeight: 700, color: "var(--color-text-deep)" },
  sectionLede: { margin: "-4px 0 4px", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 400, color: "var(--text-secondary)" },
  list: { display: "flex", flexDirection: "column", gap: 14 },

  hero: { display: "flex", flexDirection: "column", gap: 16, borderRadius: 16 },
  heroEyebrow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  startHere: {
    fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em",
    textTransform: "uppercase", color: "var(--color-button-primary-bg)",
  },
  heroIdentity: { display: "flex", alignItems: "center", gap: 14 },
  heroAvatar: {
    flexShrink: 0, width: 48, height: 48, borderRadius: "50%", border: "none",
    background: "var(--grey-100)", color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 700, cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  },
  heroName: { margin: 0, fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 800, color: "var(--color-text-deep)", lineHeight: 1.2 },
  heroTags: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 },
  heroComp: {
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600,
    color: "var(--color-icon-tertiary-fg)", background: "var(--color-icon-tertiary-bg)",
    padding: "2px 10px", borderRadius: 999,
  },
  heroDriver: {
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600,
    color: "var(--color-text-tertiary)", background: "var(--pill-bg)",
    padding: "2px 10px", borderRadius: 999,
  },
  heroEvidence: { margin: 0, fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 400, color: "var(--text-primary)", lineHeight: 1.5 },
  heroMetric: { display: "flex", alignItems: "center", gap: 14 },
  heroSpark: { flex: 1, minWidth: 0 },
  heroNow: { fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 800, color: "var(--color-text-deep)", flexShrink: 0 },
  heroInterv: {
    display: "flex", alignItems: "center", gap: 12,
    background: "var(--color-card-emoji-bg)", borderRadius: 12, padding: "14px 16px",
  },
  heroIntervVerb: { display: "block", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  heroIntervAsset: { display: "block", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 400, color: "var(--text-secondary)", marginTop: 1 },
  heroActions: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },

  recapRow: {
    display: "flex", alignItems: "center", gap: 12, width: "100%",
    background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
    padding: "12px 0",
  },
  recapAvatar: {
    flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
    background: "var(--grey-100)", color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  },
  recapMain: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 },
  recapName: { fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  recapComp: { fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 400, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
};
