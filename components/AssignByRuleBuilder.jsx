"use client";

import React from "react";
import { Plus, X } from "lucide-react";
import Button from "./Button";
import { RULE_FIELDS, ASSIGNMENT_RULES_SAMPLE } from "./mocks/creditsUsage";

// AssignByRuleBuilder — assignment approach A. A conditional-field builder
// that folds agents into buckets by rule ("Agents where Department is Sales
// and Tenure is New → Onboarding"), reusing the Workspace mental model so it
// scales to 1,000+ agents with no manual clicking. Preview-only here: rules
// are declarative and don't mutate the sample table.
export default function AssignByRuleBuilder({ buckets }) {
  const [rules, setRules] = React.useState(ASSIGNMENT_RULES_SAMPLE);
  const nextId = React.useRef(ASSIGNMENT_RULES_SAMPLE.length + 1);

  const update = (id, patch) =>
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id) => setRules((prev) => prev.filter((r) => r.id !== id));
  const add = () => {
    const id = `r${nextId.current}`;
    nextId.current += 1;
    setRules((prev) => [
      ...prev,
      { id, fieldId: "department", value: "Sales", tenureId: "tenure", tenureValue: "New", bucketId: buckets[0]?.id },
    ]);
  };

  return (
    <div style={styles.wrap}>
      {rules.map((rule) => (
        <div key={rule.id} style={styles.rule}>
          <span style={styles.lead}>Agents where</span>
          <Condition rule={rule} keyName="fieldId" valKey="value" onChange={update} id={rule.id} />
          <span style={styles.join}>and</span>
          <Condition rule={rule} keyName="tenureId" valKey="tenureValue" onChange={update} id={rule.id} />
          <span style={styles.arrow}>→</span>
          <Select
            value={rule.bucketId}
            onChange={(v) => update(rule.id, { bucketId: v })}
            ariaLabel="Target bucket"
            options={buckets.map((b) => ({ id: b.id, label: `${b.name} (${b.capMin} min)` }))}
          />
          <Button variant="icon" size="sm" onClick={() => remove(rule.id)} aria-label="Remove rule">
            <X size={14} />
          </Button>
        </div>
      ))}
      <Button variant="text" uppercase={false} leadingIcon={<Plus size={15} />} onClick={add}>
        Add rule
      </Button>
    </div>
  );
}

function Condition({ rule, keyName, valKey, onChange, id }) {
  const field = RULE_FIELDS.find((f) => f.id === rule[keyName]) || RULE_FIELDS[0];
  return (
    <>
      <Select
        value={rule[keyName]}
        onChange={(v) => onChange(id, { [keyName]: v, [valKey]: (RULE_FIELDS.find((f) => f.id === v) || RULE_FIELDS[0]).options[0] })}
        ariaLabel="Condition field"
        options={RULE_FIELDS.map((f) => ({ id: f.id, label: f.label }))}
      />
      <span style={styles.is}>is</span>
      <Select
        value={rule[valKey]}
        onChange={(v) => onChange(id, { [valKey]: v })}
        ariaLabel="Condition value"
        options={field.options.map((o) => ({ id: o, label: o }))}
      />
    </>
  );
}

function Select({ value, onChange, options, ariaLabel }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={ariaLabel} style={styles.select}>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" },
  rule: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  lead: { fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)" },
  join: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },
  is: { fontSize: 12, color: "var(--color-text-tertiary)" },
  arrow: { fontSize: 14, fontWeight: 700, color: "var(--color-icon-tertiary-fg)" },
  select: {
    height: 34,
    padding: "0 10px",
    borderRadius: 8,
    border: "1px solid var(--color-border-card-soft)",
    background: "#FFFFFF",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-medium)",
    cursor: "pointer",
    appearance: "auto",
  },
};
