"use client";

import React from "react";
import { Field, FieldNote, RingInput } from "./CreditsUsageParts";
import { LIMIT_RULES } from "./mocks/creditsUsage";

// LimitRuleControl — the single "what happens when an agent reaches their
// weekly cap" decision. One rule for the whole tenant; "Allow additional"
// is last and reveals the additional-minutes input. No "overage" wording —
// it is framed as additional minutes that are themselves capped.
export default function LimitRuleControl({ value, onChange, additionalCapMin, onAdditionalCapMin }) {
  return (
    <Field label="When an agent reaches their weekly cap">
      <div style={styles.group} role="radiogroup" aria-label="When an agent reaches their weekly cap">
        {LIMIT_RULES.map((rule) => {
          const selected = value === rule.id;
          return (
            <button
              key={rule.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(rule.id)}
              style={{
                ...styles.option,
                borderColor: selected ? "var(--color-icon-tertiary-fg)" : "var(--color-border-card-soft)",
                background: selected ? "var(--color-icon-tertiary-bg)" : "#FFFFFF",
              }}
            >
              <span style={styles.dot}>{selected && <span style={styles.dotInner} />}</span>
              <span style={styles.text}>
                <span style={styles.label}>{rule.label}</span>
                <span style={styles.desc}>{rule.description}</span>
              </span>
            </button>
          );
        })}
        {value === "allow_additional" && (
          <div style={styles.additionalRow}>
            <Field label="Additional minutes allowed per agent">
              <RingInput
                value={additionalCapMin}
                onChange={onAdditionalCapMin}
                suffix="min"
                ariaLabel="Additional minutes allowed per agent"
                width={72}
              />
            </Field>
            <FieldNote>Billed at your additional-usage rate. Practice is not interrupted.</FieldNote>
          </div>
        )}
      </div>
    </Field>
  );
}

const styles = {
  group: { display: "flex", flexDirection: "column", gap: 8, width: "100%" },
  option: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "12px 16px",
    borderRadius: 10,
    border: "1.5px solid",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    width: "100%",
    transition: "border-color 120ms ease, background 120ms ease",
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    border: "2px solid var(--color-icon-tertiary-fg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  dotInner: { width: 9, height: 9, borderRadius: "50%", background: "var(--color-icon-tertiary-fg)" },
  text: { display: "flex", flexDirection: "column", gap: 2 },
  label: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  desc: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: "18px" },
  additionalRow: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "14px 16px",
    borderRadius: 10,
    background: "var(--color-card-emoji-bg)",
  },
};
