"use client";

import React from "react";
import PlaybookV1 from "./PlaybookV1";
import PlaybookV2 from "./PlaybookV2";
import PlaybookV3 from "./PlaybookV3";
import VersionBar from "./VersionBar";

// TaskRecordPage — Playbook redesign (Notion ticket Playbook redesign).
//
// Was the long-form playbook implementation; now a shell that hosts the three
// redesign variants behind the canonical VersionBar switcher (design-guidelines
// INT-3). Each variant lives in its own file (PlaybookV1/V2/V3) and shares the
// body section primitives via playbookShared.jsx so the redesigns differ in
// framing, not in content chrome.
//
// Variant state is in-memory React only (gate G5). The mount point in
// app/[[...slug]]/page.jsx wires `taskId` + `onBack`; those are forwarded into
// the active variant untouched (gate G6 — fetch/handler logic untouched during
// a visual refactor).

const VARIANT_VERSIONS = [
  { id: "v1", label: "V1", iterations: [] },
  { id: "v2", label: "V2", iterations: [] },
  { id: "v3", label: "V3", iterations: [] },
];

const VARIANT_BASELINE = [
  { id: "playbook", label: "Playbook redesign" },
];

const VARIANT_COMPONENT = {
  v1: PlaybookV1,
  v2: PlaybookV2,
  v3: PlaybookV3,
};

export default function TaskRecordPage({ taskId, onBack }) {
  const [variant, setVariant] = React.useState("v1");
  const Active = VARIANT_COMPONENT[variant] || PlaybookV1;

  const handleVersionChange = ({ versionId }) => {
    if (VARIANT_COMPONENT[versionId]) setVariant(versionId);
  };

  return (
    <>
      <Active taskId={taskId} onBack={onBack} />
      <VersionBar
        versions={VARIANT_VERSIONS}
        baselineOptions={VARIANT_BASELINE}
        staticBaseline
        value={{ versionId: variant, iterationId: null }}
        onChange={handleVersionChange}
      />
    </>
  );
}
