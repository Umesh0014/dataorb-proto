"use client";

import React from "react";

// MissionActivityHeatmap — GitHub-contribution-graph-style dot matrix
// for the Agent curtain's "Last roleplay" card (Part E.1 §E1.4).
// Promotable primitive — any "activity over a window" visualisation
// elsewhere (agent profiles, coaching cadence, etc.) can mount this.
//
// Visual: rows = weekdays (Mon–Fri by default per spec §E1.6 #3),
// columns = weeks of the mission lifetime. Cells shade by density
// using the existing DataOrb green tokens (success family) at 4 fill
// intensities + a neutral track for empty days. No GitHub greens.
//
// Inputs:
//   activity   Array of `{date: "YYYY-MM-DD", count: N}` entries.
//   startDate  YYYY-MM-DD — first day of the mission.
//   endDate    YYYY-MM-DD — last day to render. Defaults to today.
//   weekdays   "weekday" (Mon–Fri, default) or "full" (Mon–Sun).
//
// Tooltip on hover follows spec §E1.4: "{N} roleplay(s) on {date}".

const WEEKDAY_LABELS_WEEKDAY = ["Mon", "Wed", "Fri"]; // label every other row, like image 2
const WEEKDAY_LABELS_FULL    = ["Mon", "Wed", "Fri"]; // same labels — Sat/Sun unlabeled
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CELL = 11;        // px
const GAP = 3;          // px
const LABEL_COL = 28;   // px width for weekday labels gutter

// 5-step density scale tied to existing success-family tokens. Step 0
// = neutral track (border color); steps 1-4 = green at increasing
// saturation. Same family the design system uses for success/positive
// elsewhere — no new hues introduced.
const INTENSITY = [
  "var(--color-border-card-soft)",   // 0 roleplays — empty
  "#D1FAE5",                          // 1 — light success-95-ish
  "#86EFAC",                          // 2
  "#22C55E",                          // 3
  "var(--color-success)",             // 4+ — darkest
];

function shadeForCount(n) {
  if (!n || n <= 0) return INTENSITY[0];
  if (n === 1) return INTENSITY[1];
  if (n === 2) return INTENSITY[2];
  if (n === 3) return INTENSITY[3];
  return INTENSITY[4];
}

function pad2(n) { return String(n).padStart(2, "0"); }

function dateKey(d) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

// GitHub-style ordinal suffix: 1st, 2nd, 3rd, 4th, … 21st, 22nd, 23rd.
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatTooltipDate(d) {
  return `${MONTH_FULL[d.getUTCMonth()]} ${ordinal(d.getUTCDate())}`;
}

function formatTooltipText(count, d) {
  if (!count || count <= 0) return `No roleplays on ${formatTooltipDate(d)}.`;
  return `${count} roleplay${count === 1 ? "" : "s"} on ${formatTooltipDate(d)}.`;
}

// Build a [weekIndex][weekdayRow] grid of UTC dates spanning startDate
// to endDate. Mon-anchored ISO week start so the rows line up with
// MON/WED/FRI labels regardless of locale.
function buildGrid(startISO, endISO, includeWeekend) {
  const start = new Date(`${startISO}T00:00:00Z`);
  const end = new Date(`${endISO}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return { weeks: [], rows: includeWeekend ? 7 : 5 };
  }
  const rows = includeWeekend ? 7 : 5;
  // Anchor first week to the Monday on or before startDate.
  const firstMon = new Date(start);
  const dow = (firstMon.getUTCDay() + 6) % 7; // Mon=0, Sun=6
  firstMon.setUTCDate(firstMon.getUTCDate() - dow);
  const weeks = [];
  for (let w = firstMon; w <= end; w.setUTCDate(w.getUTCDate() + 7)) {
    const wk = [];
    for (let r = 0; r < rows; r += 1) {
      const day = new Date(w);
      day.setUTCDate(day.getUTCDate() + r);
      if (day < start || day > end) {
        wk.push(null); // outside mission lifetime (above/below)
      } else {
        wk.push(new Date(day));
      }
    }
    weeks.push(wk);
  }
  return { weeks, rows };
}

export default function MissionActivityHeatmap({
  activity = [],
  startDate,
  endDate,
  weekdays = "weekday",
}) {
  const includeWeekend = weekdays === "full";
  const today = React.useMemo(() => {
    const d = new Date();
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
  }, []);
  const start = startDate;
  const end = endDate || today;

  const grid = React.useMemo(() => buildGrid(start, end, includeWeekend), [start, end, includeWeekend]);
  const counts = React.useMemo(() => {
    const map = new Map();
    for (const a of activity || []) {
      if (a && a.date) map.set(a.date, (map.get(a.date) || 0) + (a.count || 0));
    }
    return map;
  }, [activity]);

  // Hover state — GitHub-style dark tooltip pinned above the focused
  // cell. Tracked by week/row indices so the tooltip can absolutely
  // position itself over the cell without measuring DOM.
  const [hover, setHover] = React.useState(null);

  if (!grid.weeks.length) {
    return <div style={styles.empty}>No activity window</div>;
  }

  // Month labels above columns — render label on the first week that
  // contains the 1st of a new month (matches image 2 cadence).
  const monthCols = grid.weeks.map((wk) => {
    const firstDay = wk.find((d) => d) || null;
    if (!firstDay) return null;
    return firstDay.getUTCDate() <= 7 ? MONTH_LABELS[firstDay.getUTCMonth()] : null;
  });

  const labels = includeWeekend ? WEEKDAY_LABELS_FULL : WEEKDAY_LABELS_WEEKDAY;
  const labelRowIdx = { Mon: 0, Wed: 2, Fri: 4 };

  return (
    <div style={styles.wrap}>
      <div style={styles.gridWrap}>
        {/* Month labels row */}
        <div style={{ ...styles.monthRow, paddingLeft: LABEL_COL }}>
          {monthCols.map((label, i) => (
            <span
              key={`m-${i}`}
              style={{ ...styles.monthLabel, width: CELL, marginRight: i === monthCols.length - 1 ? 0 : GAP }}
            >
              {label || ""}
            </span>
          ))}
        </div>
        <div style={styles.gridRow}>
          {/* Weekday label column */}
          <div style={{ ...styles.weekdayCol, width: LABEL_COL }}>
            {labels.map((l) => (
              <span key={l} style={{ ...styles.weekdayLabel, top: labelRowIdx[l] * (CELL + GAP) }}>
                {l}
              </span>
            ))}
          </div>
          {/* Week columns */}
          <div style={styles.weeks}>
            {grid.weeks.map((wk, wi) => (
              <div key={`w-${wi}`} style={{ ...styles.week, marginRight: wi === grid.weeks.length - 1 ? 0 : GAP }}>
                {wk.map((d, ri) => {
                  if (!d) {
                    return <span key={`c-${wi}-${ri}`} style={{ ...styles.cell, background: "transparent" }} />;
                  }
                  const key = dateKey(d);
                  const n = counts.get(key) || 0;
                  const isHover = hover && hover.wi === wi && hover.ri === ri;
                  return (
                    <span
                      key={`c-${wi}-${ri}`}
                      onMouseEnter={() => setHover({ wi, ri, text: formatTooltipText(n, d) })}
                      onMouseLeave={() => setHover((h) => (h && h.wi === wi && h.ri === ri ? null : h))}
                      style={{
                        ...styles.cell,
                        background: shadeForCount(n),
                        outline: isHover ? "1px solid var(--color-text-deep)" : "none",
                        outlineOffset: isHover ? 1 : 0,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          {hover && (
            <div
              role="tooltip"
              style={{
                ...styles.tooltip,
                left: LABEL_COL + hover.wi * (CELL + GAP) + CELL / 2,
                top: hover.ri * (CELL + GAP) - 8,
              }}
            >
              {hover.text}
            </div>
          )}
        </div>
      </div>

      <div style={styles.legend}>
        <span style={styles.legendText}>Less</span>
        {INTENSITY.map((bg, i) => (
          <span key={`leg-${i}`} style={{ ...styles.legendCell, background: bg }} />
        ))}
        <span style={styles.legendText}>More</span>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: "inline-flex",
    flexDirection: "column",
    gap: 8,
    width: "fit-content",
    maxWidth: "100%",
  },
  empty: {
    fontFamily: "var(--font-sans)",
    fontSize: 12, color: "var(--color-text-tertiary)",
    padding: "12px 0",
  },
  gridWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    // No clipping — wrap is fit-content so cells already match container
    // width; visible overflow lets the hover tooltip render outside the
    // grid bounds when hovering top-row or right-edge cells.
    overflow: "visible",
  },
  monthRow: {
    display: "flex",
    alignItems: "center",
    height: 14,
  },
  monthLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 10, fontWeight: 500, letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  gridRow: {
    display: "flex",
    alignItems: "flex-start",
    position: "relative",
  },
  weekdayCol: {
    position: "relative",
    flexShrink: 0,
  },
  weekdayLabel: {
    position: "absolute",
    left: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 10, fontWeight: 500, letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
    lineHeight: `${CELL}px`,
  },
  weeks: {
    display: "flex",
    alignItems: "flex-start",
    flexShrink: 0,
  },
  week: {
    display: "flex",
    flexDirection: "column",
    gap: GAP,
    flexShrink: 0,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 2,
    flexShrink: 0,
    transition: "outline 80ms ease",
  },
  // GitHub-style dark tooltip pinned above the hovered cell.
  tooltip: {
    position: "absolute",
    transform: "translate(-50%, -100%)",
    background: "#1B1B1F",
    color: "#FFFFFF",
    fontFamily: "var(--font-sans)",
    fontSize: 12, fontWeight: 500, letterSpacing: "0.1px",
    padding: "6px 10px",
    borderRadius: 6,
    whiteSpace: "nowrap",
    pointerEvents: "none",
    boxShadow: "0 4px 12px rgba(27, 27, 31, 0.18)",
    zIndex: 5,
  },
  legend: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    justifyContent: "flex-end",
    paddingTop: 4,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontFamily: "var(--font-sans)",
    fontSize: 11, fontWeight: 500, letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
  },
};
