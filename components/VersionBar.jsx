"use client";

import React from "react";

// VersionBar — floating component → version → iteration switcher.
// Lives over a full-screen canvas: collapsed FAB at bottom-right;
// expanded bar at bottom-center. Versions with iterations expand
// inline (sideways disclosure: chip morphs into a yellow-label group
// of iteration circles). Dark chrome regardless of page background.

const DEFAULT_VERSIONS = [
  { id: "current", label: "Current design", iterations: [] },
  { id: "v1", label: "v1", iterations: [] },
  { id: "v2", label: "v2", iterations: ["i1", "i2", "i3"] },
  { id: "v3", label: "v3", iterations: ["i1", "i2"] },
];

export default function VersionBar({
  versions = DEFAULT_VERSIONS,
  defaultActiveId = "current",
  onChange,
  onOpenFigma,
}) {
  const [collapsed, setCollapsed] = React.useState(true);
  const [activeId, setActiveId] = React.useState(defaultActiveId);
  const [expandedId, setExpandedId] = React.useState(null);
  const [iterById, setIterById] = React.useState(() => {
    const m = {};
    versions.forEach((v) => {
      if (v.iterations.length) m[v.id] = v.iterations[0];
    });
    return m;
  });
  const [helpOpen, setHelpOpen] = React.useState(false);

  const barRef = React.useRef(null);
  const fabRef = React.useRef(null);

  const fire = (versionId, iterationId) => {
    onChange?.({ versionId, iterationId });
  };

  // Outside-click closes inline expansion + help; never the bar itself.
  React.useEffect(() => {
    if (collapsed) return;
    const handler = (e) => {
      if (barRef.current?.contains(e.target)) return;
      if (fabRef.current?.contains(e.target)) return;
      setExpandedId(null);
      setHelpOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [collapsed]);

  // Esc closes help + expansion.
  React.useEffect(() => {
    const handler = (e) => {
      if (e.key !== "Escape") return;
      if (helpOpen) setHelpOpen(false);
      if (expandedId) setExpandedId(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [helpOpen, expandedId]);

  // ← / → step iterations when a version is expanded.
  React.useEffect(() => {
    if (!expandedId) return;
    const v = versions.find((x) => x.id === expandedId);
    if (!v || !v.iterations.length) return;
    const handler = (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const current = iterById[expandedId] ?? v.iterations[0];
      const idx = v.iterations.indexOf(current);
      const nextIdx =
        e.key === "ArrowRight"
          ? (idx + 1) % v.iterations.length
          : (idx - 1 + v.iterations.length) % v.iterations.length;
      const next = v.iterations[nextIdx];
      setIterById((m) => ({ ...m, [expandedId]: next }));
      setActiveId(expandedId);
      fire(expandedId, next);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [expandedId, iterById, versions]); // eslint-disable-line react-hooks/exhaustive-deps

  const expand = () => setCollapsed(false);
  const collapse = () => {
    setCollapsed(true);
    setExpandedId(null);
    setHelpOpen(false);
  };
  const figma = () => {
    if (onOpenFigma) onOpenFigma();
    else if (typeof window !== "undefined") window.open("https://figma.com", "_blank", "noopener,noreferrer");
  };

  const selectVersion = (v) => {
    if (v.iterations.length) {
      setActiveId(v.id);
      setExpandedId((cur) => (cur === v.id ? null : v.id));
      const iter = iterById[v.id] ?? v.iterations[0];
      fire(v.id, iter);
    } else {
      setActiveId(v.id);
      setExpandedId(null);
      fire(v.id, null);
    }
  };

  const selectIteration = (versionId, iterId) => {
    setIterById((m) => ({ ...m, [versionId]: iterId }));
    setActiveId(versionId);
    fire(versionId, iterId);
  };

  const baseline = versions.find((v) => v.id === "current");
  const chips = versions.filter((v) => v.id !== "current");

  return (
    <div style={vbStyles.host} aria-live="polite">
      <style>{VB_STYLESHEET}</style>

      {/* FAB (collapsed) */}
      <button
        ref={fabRef}
        type="button"
        aria-label="Open versions"
        title="Versions"
        className="vb-focusable vb-anim"
        onClick={expand}
        style={{
          ...vbStyles.fab,
          opacity: collapsed ? 1 : 0,
          transform: collapsed ? "scale(1)" : "scale(0.82)",
          pointerEvents: collapsed ? "auto" : "none",
        }}
      >
        <CompGlyph />
        <span style={vbStyles.fabBadge} aria-hidden="true">
          {versions.length}
        </span>
      </button>

      {/* Bar (expanded) */}
      <div
        ref={barRef}
        role="group"
        aria-label="Version selector"
        className="vb-anim"
        style={{
          ...vbStyles.barWrap,
          opacity: collapsed ? 0 : 1,
          transform: collapsed
            ? "translateX(-50%) translateY(18px)"
            : "translateX(-50%) translateY(0)",
          pointerEvents: collapsed ? "none" : "auto",
        }}
      >
        {helpOpen && (
          <div style={vbStyles.helpPopover} role="dialog" aria-label="Help">
            <strong style={vbStyles.helpTitle}>Versions</strong>
            <p style={vbStyles.helpText}>
              Click a version to switch the canvas. Versions with iterations
              (›) expand inline so you can step through their drafts.
            </p>
            <p style={vbStyles.helpHint}>
              Esc closes this and any open group. ← / → step iterations
              once a version is expanded.
            </p>
          </div>
        )}

        <div style={vbStyles.bar}>
          {baseline && (
            <Baseline
              version={baseline}
              active={activeId === baseline.id}
              onClick={() => selectVersion(baseline)}
            />
          )}
          <span style={vbStyles.divider} aria-hidden="true" />
          <div style={vbStyles.chipsRow}>
            {chips.map((v) =>
              expandedId === v.id ? (
                <VGroup
                  key={v.id}
                  version={v}
                  activeIter={iterById[v.id]}
                  onIter={(iter) => selectIteration(v.id, iter)}
                />
              ) : (
                <VChip
                  key={v.id}
                  version={v}
                  active={activeId === v.id}
                  onClick={() => selectVersion(v)}
                />
              ),
            )}
          </div>
          <span style={vbStyles.divider} aria-hidden="true" />
          <CircleBtn
            ariaLabel="Help"
            pressed={helpOpen}
            onClick={() => setHelpOpen((v) => !v)}
          >
            <span style={vbStyles.qMark}>?</span>
          </CircleBtn>
          <CircleBtn ariaLabel="Open in Figma" onClick={figma}>
            <FigmaMark />
          </CircleBtn>
          <CircleBtn ariaLabel="Close versions" onClick={collapse}>
            <CollapseGlyph />
          </CircleBtn>
        </div>
      </div>
    </div>
  );
}

function Baseline({ version, active, onClick }) {
  return (
    <button
      type="button"
      className="vb-focusable vb-anim"
      onClick={onClick}
      style={{
        ...vbStyles.baseline,
        background: active ? "var(--vb-accent)" : "var(--vb-pill)",
        color: active ? "var(--vb-accent-ink)" : "var(--vb-txt)",
        fontWeight: active ? 700 : 500,
      }}
    >
      {version.label}
    </button>
  );
}

function VChip({ version, active, onClick }) {
  const hasIter = version.iterations.length > 0;
  return (
    <button
      type="button"
      className="vb-focusable vb-anim"
      onClick={onClick}
      style={{
        ...vbStyles.chip,
        background: active ? "var(--vb-accent)" : "var(--vb-pill)",
        color: active ? "var(--vb-accent-ink)" : "var(--vb-txt)",
        fontWeight: active ? 700 : 500,
      }}
    >
      <span>{version.label}</span>
      {hasIter && <HChevron />}
    </button>
  );
}

function VGroup({ version, activeIter, onIter }) {
  return (
    <div style={vbStyles.vgroup}>
      <span style={vbStyles.vlabel}>{version.label}</span>
      {version.iterations.map((i) => {
        const on = i === activeIter;
        return (
          <button
            key={i}
            type="button"
            aria-pressed={on}
            className="vb-focusable vb-anim"
            onClick={() => onIter(i)}
            style={{
              ...vbStyles.iter,
              background: on ? "var(--vb-accent)" : "transparent",
              color: on ? "var(--vb-accent-ink)" : "var(--vb-muted)",
              fontWeight: on ? 700 : 500,
            }}
          >
            {i}
          </button>
        );
      })}
    </div>
  );
}

function CircleBtn({ ariaLabel, pressed, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={pressed}
      className="vb-focusable vb-anim"
      onClick={onClick}
      style={{
        ...vbStyles.circle,
        color: pressed ? "var(--vb-accent)" : "var(--vb-txt)",
      }}
    >
      {children}
    </button>
  );
}

// ---- Icons (inline SVG; no font dependency) -----------------------------

function CompGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="22"
      height="22"
      style={{ color: "var(--vb-accent)" }}
      aria-hidden="true"
    >
      <path d="M3 12l3 3 3-3-3-3z" />
      <path d="M15 12l3 3 3-3-3-3z" />
      <path d="M9 6l3 3 3-3-3-3z" />
      <path d="M9 18l3 3 3-3-3-3z" />
    </svg>
  );
}

function HChevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function CollapseGlyph() {
  // X (close) glyph — collapses the bar back to the corner FAB. Replaces
  // the earlier «« double-chevron; reads more clearly as "dismiss".
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

function FigmaMark() {
  return (
    <svg width="14" height="20" viewBox="0 0 38 57" fill="none" aria-hidden="true">
      <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0Z" fill="#1ABCFE" />
      <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0Z" fill="#0ACF83" />
      <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19Z" fill="#FF7262" />
      <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5Z" fill="#F24E1E" />
      <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5Z" fill="#A259FF" />
    </svg>
  );
}

// ---- Styles --------------------------------------------------------------

// Host scopes the CSS variables so the dark chrome doesn't depend on the
// page's light-mode tokens. Webfonts fall back to system if not loaded.
const vbStyles = {
  host: {
    "--vb-bar": "#27272C",
    "--vb-pill": "#3A3A40",
    "--vb-group": "#33333A",
    "--vb-circle": "#33333A",
    "--vb-muted": "#9B9BA1",
    "--vb-txt": "#F2F2F4",
    "--vb-accent": "#F4D63E",
    "--vb-accent-ink": "#2A2400",
    "--vb-divider": "rgba(255,255,255,0.12)",
    "--vb-hairline": "rgba(255,255,255,0.07)",
    "--vb-ui": '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
    "--vb-mono":
      '"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace',
    fontFamily: "var(--vb-ui)",
  },
  fab: {
    position: "fixed",
    right: 28,
    bottom: 28,
    width: 54,
    height: 54,
    borderRadius: "50%",
    background: "var(--vb-bar)",
    border: "1px solid var(--vb-hairline)",
    boxShadow: "0 16px 40px -16px rgba(0,0,0,0.7)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 60,
    color: "var(--vb-txt)",
    transition: "opacity 220ms ease-out, transform 220ms ease-out",
  },
  fabBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingInline: 5,
    borderRadius: 9,
    background: "var(--vb-accent)",
    color: "var(--vb-accent-ink)",
    fontFamily: "var(--vb-mono)",
    fontSize: 10,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid var(--vb-bar)",
  },
  barWrap: {
    position: "fixed",
    bottom: 28,
    left: "50%",
    zIndex: 60,
    transform: "translateX(-50%) translateY(0)",
    maxWidth: "calc(100vw - 56px)",
    transition: "opacity 220ms ease-out, transform 220ms ease-out",
  },
  bar: {
    background: "var(--vb-bar)",
    borderRadius: 18,
    padding: "10px 14px",
    boxShadow: "0 20px 50px -22px rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    border: "1px solid var(--vb-hairline)",
    color: "var(--vb-txt)",
  },
  baseline: {
    borderRadius: 12,
    padding: "9px 16px",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--vb-mono)",
    fontSize: 13,
    letterSpacing: "0.01em",
    transition: "background 180ms ease, color 180ms ease",
  },
  divider: {
    width: 1,
    height: 22,
    background: "var(--vb-divider)",
    flexShrink: 0,
  },
  chipsRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 32,
    paddingInline: 14,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--vb-mono)",
    fontSize: 12,
    letterSpacing: "0.02em",
    transition: "background 180ms ease, color 180ms ease",
  },
  vgroup: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    height: 38,
    paddingInline: 10,
    background: "var(--vb-group)",
    borderRadius: 999,
    border: "1px solid var(--vb-hairline)",
  },
  vlabel: {
    fontFamily: "var(--vb-mono)",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--vb-accent)",
    paddingInline: 6,
    letterSpacing: "0.02em",
  },
  iter: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--vb-mono)",
    fontSize: 11,
    letterSpacing: "0.02em",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 180ms ease, color 180ms ease",
  },
  circle: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "var(--vb-circle)",
    border: "1px solid var(--vb-hairline)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 180ms ease, color 180ms ease",
    fontFamily: "var(--vb-ui)",
    fontSize: 14,
  },
  qMark: {
    fontFamily: "var(--vb-mono)",
    fontWeight: 700,
  },
  helpPopover: {
    position: "absolute",
    bottom: "100%",
    marginBottom: 10,
    left: "50%",
    transform: "translateX(-50%)",
    width: 320,
    maxWidth: "calc(100vw - 56px)",
    background: "var(--vb-bar)",
    border: "1px solid var(--vb-hairline)",
    borderRadius: 12,
    padding: "14px 16px",
    boxShadow: "0 20px 50px -22px rgba(0,0,0,0.7)",
    color: "var(--vb-txt)",
    boxSizing: "border-box",
  },
  helpTitle: {
    display: "block",
    fontFamily: "var(--vb-ui)",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
  },
  helpText: {
    margin: 0,
    fontFamily: "var(--vb-ui)",
    fontSize: 12,
    lineHeight: 1.5,
    color: "var(--vb-muted)",
  },
  helpHint: {
    margin: "8px 0 0",
    fontFamily: "var(--vb-mono)",
    fontSize: 11,
    lineHeight: 1.5,
    color: "var(--vb-muted)",
  },
};

const VB_STYLESHEET = `
.vb-focusable:focus-visible {
  outline: 2px solid #F4D63E;
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .vb-anim { transition: none !important; }
}
`;
