"use client";

import React from "react";

// BucketFacepile — overlapping avatar stack + "N in bucket" caption for the
// bucket-as-folder approaches (C1 inline, C2 rail, C3 stacked). Shows up to
// five initials; the count reflects the full membership.
export default function BucketFacepile({ members }) {
  const shown = members.slice(0, 5);
  return (
    <span style={styles.facepile} aria-label={`${members.length} members`}>
      {shown.map((m, i) => (
        <span key={m.id} style={{ ...styles.face, marginLeft: i === 0 ? 0 : -8, zIndex: shown.length - i }}>
          {m.name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
        </span>
      ))}
      <span style={styles.faceCount}>{members.length} in bucket</span>
    </span>
  );
}

const styles = {
  facepile: { display: "inline-flex", alignItems: "center", gap: 8 },
  face: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "var(--chart-lavender)",
    border: "2px solid #FFFFFF",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: 600,
  },
  faceCount: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", marginLeft: 4 },
};
