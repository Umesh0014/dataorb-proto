"use client";

import React from "react";
import Card from "./Card";

// DrillHeader — page header band for the Drill page. Mirrors the
// title-row pattern from <HeaderCard> (avatar + title + chevron) so it
// reads as part of the same family. No subtitle, no CTA — Roleplay
// lives in the tab row below.
export default function DrillHeader({ title = "Drill" }) {
  return (
    <Card>
      <div style={dhStyles.titleRow}>
        <div style={dhStyles.titleLeft}>
          <div style={dhStyles.avatar}>
            <span className="material-symbols-outlined" style={dhStyles.avatarIcon}>
              co_present
            </span>
          </div>
          <span style={dhStyles.titleText}>{title}</span>
          <span className="material-symbols-outlined" style={dhStyles.chevronTitle}>
            expand_more
          </span>
        </div>
      </div>
    </Card>
  );
}

const dhStyles = {
  titleRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  titleLeft: { display: "flex", alignItems: "center", gap: 0 },
  avatar: {
    width: 32, height: 32, borderRadius: 16, background: "#E8ECFF",
    display: "grid", placeItems: "center", flexShrink: 0, marginRight: 12,
  },
  avatarIcon: {
    fontSize: 18, color: "#245BFF",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  },
  titleText: {
    fontFamily: '"Mulish", sans-serif', fontSize: 16, fontWeight: 600,
    color: "#1F232A", lineHeight: 1.4, marginRight: 6,
  },
  chevronTitle: {
    fontSize: 18, color: "#8C90A6",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  },
};
