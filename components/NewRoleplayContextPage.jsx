"use client";

import React from "react";
import Card from "./Card";
import Button from "./Button";
import MultiLineInput from "./MultiLineInput";
import RoleplayBreadcrumb from "./RoleplayBreadcrumb";

const FIELD_MAX = 500;

// NewRoleplayContextPage — Step 2 of the New Roleplay wizard
// ("Add Conversation Context"). Controlled component: form values
// come from `value`, flow back via `onChange`. Shared wizard state
// lives in app/page.jsx so navigating Step 1 ↔ Step 2 preserves data
// in both directions.
//
// All three fields are optional. Generate stays disabled until any
// field has content. Skip-and-Generate-with-AI is always enabled and
// routes to the same destination as Generate.
export default function NewRoleplayContextPage({
  value,
  onChange,
  onCancel,
  onPrevious,
  onGenerate,
  onSkipAndGenerate,
  onViewSample,
}) {
  const setField = (key) => (next) => onChange({ ...value, [key]: next });
  const { objections, products, context } = value;

  const hasAny =
    objections.trim().length > 0 ||
    products.trim().length > 0 ||
    context.trim().length > 0;

  return (
    <div style={ctxStyles.page}>
      <Card padX={32} padY={32} style={ctxStyles.formCard}>
        <RoleplayBreadcrumb active="context" onViewSample={onViewSample} />

        <div style={ctxStyles.titleRow}>
          <div style={ctxStyles.titleBlock}>
            <div style={ctxStyles.title}>Add Supporting Information</div>
            <div style={ctxStyles.subtitle}>
              Build intelligent customer personas to train and coach the agents
            </div>
          </div>
          <Button variant="ai" onClick={onSkipAndGenerate}>
            Skip and Generate with AI
          </Button>
        </div>

        <div style={ctxStyles.fieldGrid}>
          <Field label="What are the key objections?">
            <MultiLineInput
              value={objections}
              onChange={setField("objections")}
              max={FIELD_MAX}
              placeholder="E.g. The customer is not interested in the product/service"
            />
          </Field>

          <Field label="What products or services will be discussed?">
            <MultiLineInput
              value={products}
              onChange={setField("products")}
              max={FIELD_MAX}
              placeholder="E.g. international roaming plan"
            />
          </Field>

          <Field label="Any additional context?">
            <MultiLineInput
              value={context}
              onChange={setField("context")}
              max={FIELD_MAX}
              placeholder="E.g. The customer is a long term user and has been loyal to the company since 2 years."
            />
          </Field>
        </div>

        <div style={ctxStyles.footer}>
          <Button variant="text" onClick={onCancel}>Cancel</Button>
          <div style={ctxStyles.footerRight}>
            <Button variant="text" onClick={onPrevious}>Previous</Button>
            <Button variant="primary" disabled={!hasAny} onClick={onGenerate}>
              Generate
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={ctxStyles.field}>
      <label style={ctxStyles.label}>{label}</label>
      {children}
    </div>
  );
}

const ctxStyles = {
  page: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    flex: 1,
    minHeight: 0,
  },
  formCard: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  titleRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  titleBlock: { display: "flex", flexDirection: "column", gap: 4 },
  title: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 20,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
  },
  subtitle: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.5,
  },

  fieldGrid: { display: "flex", flexDirection: "column", gap: 24 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 24,
    marginTop: 8,
    borderTop: "1px solid var(--color-divider-card)",
  },
  footerRight: { display: "flex", alignItems: "center", gap: 24 },
};
