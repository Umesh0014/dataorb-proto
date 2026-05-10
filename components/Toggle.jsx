"use client";

import React from "react";

// Toggle — switch primitive used by DrillCard's active state and the
// Drill Details page header. Uncontrolled if only `defaultEnabled` is
// supplied; controlled if `enabled` + `onChange` are passed.
export default function Toggle({
  enabled: enabledProp,
  defaultEnabled = false,
  onChange,
  ariaLabel,
}) {
  const isControlled = typeof enabledProp === "boolean";
  const [internal, setInternal] = React.useState(defaultEnabled);
  const enabled = isControlled ? enabledProp : internal;

  const handleClick = (e) => {
    e.stopPropagation();
    const next = !enabled;
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative shrink-0 cursor-pointer border-none p-0"
      aria-pressed={enabled}
      aria-label={ariaLabel}
      style={{
        width: 40,
        height: 24,
        borderRadius: 999,
        background: enabled ? "rgba(0, 113, 29, 0.5)" : "#CBD5E1",
        transition: "background 150ms ease",
      }}
    >
      <span
        className="absolute bg-white"
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          top: 3,
          left: enabled ? 19 : 3,
          transition: "left 150ms ease",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}
