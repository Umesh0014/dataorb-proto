"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Card from "../Card";
import Button from "../Button";
import { CategoryChip, WorkflowStatusPill } from "./GuidedWorkflowParts";
import CreateWorkflowModal from "./CreateWorkflowModal";
import { gwReasons, gwWorkflows } from "../mocks/guidedWorkflowDrivers";

// ContactReasonsPage — the Contact Reason rung of the hierarchy
// (Driver → Contact Reason → Workflow), reached by opening a workflow on
// the driver detail. Lists every contact reason under the driver: reasons
// that already have a workflow show its lane + status; reasons with none
// surface a "Create workflow" CTA (the gap the team lead fills). Create
// state is in-memory and scoped to the reason that opened it.

export default function ContactReasonsPage({ driver, onBack, onBackToLanding }) {
  const reasons = gwReasons(driver.id);
  const workflows = gwWorkflows(driver.id);
  const byId = React.useMemo(() => Object.fromEntries(workflows.map((w) => [w.id, w])), [workflows]);
  const [createReason, setCreateReason] = React.useState(null);

  const covered = reasons.filter((r) => r.workflowId).length;
  const open = reasons.length - covered;

  return (
    <div style={styles.page}>
      <header style={styles.headingText}>
        <nav style={styles.breadcrumb} aria-label="Breadcrumb">
          <button type="button" onClick={onBackToLanding} className="gw-focusable" style={styles.crumbLink}>
            <ChevronLeft size={15} aria-hidden="true" />
            Guided Workflows
          </button>
          <ChevronRight size={14} color="var(--color-text-placeholder)" aria-hidden="true" />
          <button type="button" onClick={onBack} className="gw-focusable" style={styles.crumbLink}>
            {driver.name}
          </button>
          <ChevronRight size={14} color="var(--color-text-placeholder)" aria-hidden="true" />
          <span style={styles.crumbCurrent}>Contact reasons</span>
        </nav>
        <h1 style={styles.title}>Contact reasons</h1>
        <p style={styles.substats}>
          <strong style={styles.strong}>{reasons.length}</strong> reasons
          <span style={styles.dotSep}>·</span>
          <strong style={styles.strong}>{covered}</strong> with a workflow
          <span style={styles.dotSep}>·</span>
          <strong style={styles.strong}>{open}</strong> ready to capture
        </p>
      </header>

      <div style={styles.list}>
        {reasons.map((r) => {
          const wf = r.workflowId ? byId[r.workflowId] : null;
          return (
            <Card key={r.id} shadow padX={20} padY={16} style={styles.row}>
              <span style={styles.reasonMain}>
                <span style={styles.reasonName}>{r.name}</span>
                <span style={styles.reasonSub}>
                  {wf ? (
                    <>
                      <span style={styles.id}>{wf.id}</span>
                      <span style={styles.sep}>·</span>
                      Standardised from a winning call
                    </>
                  ) : (
                    "No workflow yet — capture one from a winning call."
                  )}
                </span>
              </span>

              <span style={styles.reasonSide}>
                {wf ? (
                  <>
                    <CategoryChip category={wf.category} />
                    <WorkflowStatusPill status={wf.status} />
                    <Button variant="text" uppercase={false} onClick={() => setCreateReason(r)} style={styles.editBtn}>
                      {wf.status === "draft" ? "Review" : "Edit"}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    leadingIcon={<Plus size={15} />}
                    uppercase={false}
                    onClick={() => setCreateReason(r)}
                  >
                    Create workflow
                  </Button>
                )}
              </span>
            </Card>
          );
        })}
      </div>

      <CreateWorkflowModal
        open={Boolean(createReason)}
        reason={createReason?.name}
        onClose={() => setCreateReason(null)}
      />
    </div>
  );
}

const styles = {
  page: { display: "flex", flexDirection: "column", gap: 24, width: "100%" },
  headingText: { display: "flex", flexDirection: "column", gap: 8, minWidth: 0 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  crumbLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    borderRadius: 4,
  },
  crumbCurrent: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  title: { margin: 0, fontSize: 28, fontWeight: 800, color: "var(--color-text-deep)", lineHeight: 1.2 },
  substats: { margin: 0, fontSize: 13.5, color: "var(--color-text-tertiary)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  strong: { fontWeight: 700, color: "var(--color-text-deep)" },
  dotSep: { color: "var(--color-text-placeholder)" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  reasonMain: { display: "flex", flexDirection: "column", gap: 5, minWidth: 0 },
  reasonName: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  reasonSub: { display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--color-text-tertiary)", flexWrap: "wrap" },
  id: { fontFamily: "var(--font-mono)" },
  sep: { color: "var(--color-text-placeholder)" },
  reasonSide: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  editBtn: {
    height: 32,
    paddingInline: 16,
    border: "1px solid var(--color-divider-card)",
    borderRadius: 999,
    fontWeight: 600,
  },
};
