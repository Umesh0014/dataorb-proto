"use client";

import Card from "./Card";

export default function ManualEvalCard() {
  return (
    <Card>
      <div style={{
        fontFamily: '"Mulish", sans-serif', fontSize: 16, fontWeight: 700,
        color: "#1F232A", lineHeight: 1.4, marginBottom: 24,
      }}>
        Manual Evaluation Trend
      </div>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "40px 0",
      }}>
        <span className="material-symbols-outlined" style={{
          fontSize: 56, color: "#D6DCE8",
          fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48",
        }}>
          view_column_2
        </span>
        <span style={{
          fontFamily: '"Mulish", sans-serif', fontSize: 13,
          color: "rgba(0,0,0,0.38)", marginTop: 12,
        }}>
          No Manual evaluation available.
        </span>
      </div>
    </Card>
  );
}
