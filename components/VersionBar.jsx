/* eslint-disable no-restricted-syntax, max-lines, max-lines-per-function --
   VersionBar is meta-tooling (a demo / preview affordance for switching
   between design versions), not product chrome. Same precedent as
   DarkPillSwitcher: raw <button> is intentional because Button.jsx's
   variants (primary blue pill / text / icon / ai) don't fit this dark
   floating bar's pill, baseline-block, iteration-circle, or ghost-circle
   styles. The component is a single cohesive unit; splitting across
   files would harm comprehension. */
"use client";

import React from "react";

// VersionBar — floating version → iteration switcher with a "Pop" morph
// animation. Collapsed = a 56px circle (component glyph + count badge)
// at bottom-right. Opening it stretches the same element horizontally
// into a bar; the chips inside pop in left→right with a small spring
// overshoot, and a separate × close button grows in beside the bar.
// Reverse on close (no stagger replay). (v3)

const DEFAULT_VERSIONS = [
  { id: "current", label: "Current design", iterations: [] },
  { id: "v1", label: "v1", iterations: ["i1", "i2"] },
  { id: "v2", label: "v2", iterations: ["i1", "i2"] },
  { id: "v3", label: "v3", iterations: ["i1"] },
];

// Baseline-block dropdown options. Picking one updates the baseline
// label and fires onChange with that id.
const BASELINE_OPTIONS = [
  { id: "current", label: "Current design" },
  { id: "updated", label: "Updated design" },
];

const COLLAPSED_SIZE = 56;
const CLOSE_SIZE = 52;

export default function VersionBar({
  versions = DEFAULT_VERSIONS,
  // discarded: retired versions parked behind a "Discarded" dropdown — still
  // selectable for comparison, just out of the main chip row. Each is
  // { id, label }; selecting one fires onChange like any other version.
  discarded = [],
  baselineOptions = BASELINE_OPTIONS,
  staticBaseline = false,
  defaultActiveId = "current",
  value,
  onChange,
  figmaHref,
  onOpenFigma,
  help,
  // baselineLabel: when set, the baseline dropdown trigger always shows this
  // text (e.g. "Bombed ideas") instead of the selected option's label — so
  // the dropdown reads as a labelled group rather than the active choice.
  baselineLabel,
  // tabsMode: drop the baseline dropdown and render every option as a chip
  // (single-axis switchers where a baseline + chips would just duplicate
  // the options). Default off so existing callers are unchanged.
  tabsMode = false,
}) {
  // The help (?) button is disabled until the consumer wires content.
  // Pass `help` as a React node (string / JSX) and it renders inside
  // the popover. Mirrors the Figma button's "no link → disabled" pattern.
  const helpEnabled = help !== undefined && help !== null && help !== false;
  const isControlled = value !== undefined;
  const [internalActiveId, setInternalActiveId] = React.useState(defaultActiveId);
  const activeId = isControlled ? value.versionId : internalActiveId;
  const setActiveId = (next) => {
    if (!isControlled) setInternalActiveId(next);
  };

  const [open, setOpen] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState(null);
  const [iterById, setIterById] = React.useState(() => {
    const m = {};
    versions.forEach((v) => {
      if (v.iterations.length) m[v.id] = v.iterations[0];
    });
    return m;
  });
  const [helpOpen, setHelpOpen] = React.useState(false);
  // Baseline-id default mirrors the controlled value if it points at a
  // baseline option, otherwise the first baseline option's id.
  const initialBaselineId = (() => {
    if (isControlled && baselineOptions.some((o) => o.id === value.versionId)) {
      return value.versionId;
    }
    return baselineOptions[0]?.id ?? "current";
  })();
  const [internalBaselineId, setInternalBaselineId] = React.useState(initialBaselineId);
  // When controlled and the value points at a baseline option, keep the
  // baseline label in sync with the controlled value.
  const controlledBaselineId = (() => {
    if (!isControlled) return null;
    if (baselineOptions.some((o) => o.id === value.versionId)) return value.versionId;
    return null;
  })();
  const baselineId = controlledBaselineId ?? internalBaselineId;
  const [baselineMenuOpen, setBaselineMenuOpen] = React.useState(false);
  const [discardedMenuOpen, setDiscardedMenuOpen] = React.useState(false);
  const [barWidth, setBarWidth] = React.useState(COLLAPSED_SIZE);

  const dockRef = React.useRef(null);
  const barInnerRef = React.useRef(null);
  const baselineBtnRef = React.useRef(null);
  const helpBtnRef = React.useRef(null);
  const helpRef = React.useRef(null);
  const baselineMenuRef = React.useRef(null);
  const discardedBtnRef = React.useRef(null);
  const discardedMenuRef = React.useRef(null);

  const fire = (versionId, iterationId) => {
    onChange?.({ versionId, iterationId });
  };

  // Measure the bar's natural content width once mounted + whenever
  // chip count / chip expansion changes the row's intrinsic size.
  React.useEffect(() => {
    const el = barInnerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.scrollWidth;
      if (w > 0) setBarWidth(w);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Re-measure on chip expansion change (vgroup width differs from chip).
  React.useEffect(() => {
    const el = barInnerRef.current;
    if (!el) return;
    // Defer one frame so the new chip/vgroup has laid out.
    const id = requestAnimationFrame(() => {
      const w = el.scrollWidth;
      if (w > 0) setBarWidth(w);
    });
    return () => cancelAnimationFrame(id);
  }, [expandedId, iterById]);

  // Outside-click closes inline expansion + help + baseline menu;
  // never the bar itself (use × close for that).
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const t = e.target;
      if (dockRef.current?.contains(t)) return;
      if (helpRef.current?.contains(t)) return;
      if (baselineMenuRef.current?.contains(t)) return;
      if (discardedMenuRef.current?.contains(t)) return;
      setExpandedId(null);
      setHelpOpen(false);
      setBaselineMenuOpen(false);
      setDiscardedMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Esc closes popovers + inline expansion.
  React.useEffect(() => {
    const handler = (e) => {
      if (e.key !== "Escape") return;
      if (helpOpen) setHelpOpen(false);
      if (expandedId) setExpandedId(null);
      if (baselineMenuOpen) setBaselineMenuOpen(false);
      if (discardedMenuOpen) setDiscardedMenuOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [helpOpen, expandedId, baselineMenuOpen, discardedMenuOpen]);

  // ←/→ step iterations when a version is expanded.
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

  // Popover anchor rects — refresh on open + scroll + resize so they
  // stay glued to their trigger as the bar morphs.
  const baselineRect = useAnchorRect(baselineBtnRef, baselineMenuOpen, barWidth, open);
  const discardedRect = useAnchorRect(discardedBtnRef, discardedMenuOpen, barWidth, open);
  const helpRect = useAnchorRect(helpBtnRef, helpOpen, barWidth, open);

  const expand = () => setOpen(true);
  const collapse = () => {
    setOpen(false);
    setExpandedId(null);
    setHelpOpen(false);
    setBaselineMenuOpen(false);
    setDiscardedMenuOpen(false);
  };
  // The Figma button is disabled until the consumer wires it — either
  // a custom onOpenFigma handler or a figmaHref URL. No fallback to
  // https://figma.com so a missing link reads as "not yet specced".
  const figmaEnabled = typeof onOpenFigma === "function" || typeof figmaHref === "string";
  const figma = () => {
    if (!figmaEnabled) return;
    if (onOpenFigma) onOpenFigma();
    else if (typeof window !== "undefined")
      window.open(figmaHref, "_blank", "noopener,noreferrer");
  };

  const selectVersion = (v) => {
    setBaselineMenuOpen(false);
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
    setBaselineMenuOpen(false);
    setIterById((m) => ({ ...m, [versionId]: iterId }));
    setActiveId(versionId);
    fire(versionId, iterId);
  };

  const selectBaseline = (id) => {
    setInternalBaselineId(id);
    setBaselineMenuOpen(false);
    setExpandedId(null);
    setActiveId(id);
    fire(id, null);
  };

  const selectDiscarded = (id) => {
    setDiscardedMenuOpen(false);
    setExpandedId(null);
    setActiveId(id);
    fire(id, null);
  };
  const activeDiscarded = discarded.find((d) => d.id === activeId);

  const baselineSelected =
    baselineOptions.find((o) => o.id === baselineId) || baselineOptions[0];
  // Empty versions array → no chips, no first divider. In tabsMode there is
  // no baseline block, so every version renders as a chip. Otherwise chips =
  // every version that isn't a baseline option (filtering on the full
  // baselineOptions set keeps the unpicked baseline out of the chips).
  const baselineIds = new Set(baselineOptions.map((o) => o.id));
  const chips = tabsMode ? versions : versions.filter((v) => !baselineIds.has(v.id));
  const hasChips = chips.length > 0;

  return (
    <div style={hostStyles} aria-live="polite">
      <style>{VB_STYLESHEET}</style>

      <div
        ref={dockRef}
        className={`vb-dock${open ? " is-open" : ""}`}
      >
        <div className="vb-wrap">
          <div
            className="vb-morph"
            style={{ width: open ? `${barWidth}px` : `${COLLAPSED_SIZE}px` }}
            role={!open ? "button" : undefined}
            tabIndex={!open ? 0 : -1}
            aria-label={!open ? "Open versions" : undefined}
            title={!open ? "Versions" : undefined}
            onClick={() => {
              if (!open) expand();
            }}
            onKeyDown={(e) => {
              if (open) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                expand();
              }
            }}
          >
            <div className="vb-m-bar" ref={barInnerRef}>
              {!tabsMode && baselineSelected && (
                <>
                  <Baseline
                    btnRef={baselineBtnRef}
                    selected={baselineSelected}
                    label={baselineLabel}
                    active={activeId === baselineSelected.id}
                    menuOpen={baselineMenuOpen}
                    onToggleMenu={() => setBaselineMenuOpen((v) => !v)}
                    isStatic={staticBaseline}
                  />
                  {hasChips && <span className="vb-divider" aria-hidden="true" />}
                </>
              )}
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
              {discarded.length > 0 && (
                <button
                  ref={discardedBtnRef}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={discardedMenuOpen}
                  className="vb-focusable"
                  onClick={() => setDiscardedMenuOpen((v) => !v)}
                  style={{
                    ...vbStyles.chip,
                    background: activeDiscarded ? "var(--vb-accent)" : "var(--vb-pill)",
                    color: activeDiscarded ? "var(--vb-accent-ink)" : "var(--vb-txt)",
                    fontWeight: activeDiscarded ? 700 : 500,
                  }}
                >
                  <span>{activeDiscarded ? `Discarded · ${activeDiscarded.label}` : "Discarded"}</span>
                  <span
                    style={{
                      ...vbStyles.baselineChev,
                      transform: discardedMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    <ChevronDownGlyph />
                  </span>
                </button>
              )}
              <span className="vb-divider" aria-hidden="true" />
              <CircleBtn
                btnRef={helpBtnRef}
                ariaLabel={helpEnabled ? "Help" : "Help not available"}
                pressed={helpOpen}
                disabled={!helpEnabled}
                onClick={() => { if (helpEnabled) setHelpOpen((v) => !v); }}
              >
                <span className="vb-q">?</span>
              </CircleBtn>
              <CircleBtn
                ariaLabel={figmaEnabled ? "Open in Figma" : "Figma link not set"}
                onClick={figma}
                disabled={!figmaEnabled}
              >
                <FigmaMark muted={!figmaEnabled} />
              </CircleBtn>
            </div>
            <div className="vb-m-icon" aria-hidden="true">
              <CompGlyph />
            </div>
          </div>
          <span className="vb-badge" aria-hidden="true">
            {(tabsMode || staticBaseline ? 0 : baselineOptions.length) + chips.length + discarded.length}
          </span>
        </div>
        <button
          type="button"
          className="vb-close vb-focusable"
          aria-label="Close versions"
          onClick={collapse}
          tabIndex={open ? 0 : -1}
        >
          <CollapseGlyph />
        </button>
      </div>

      {/* Popovers live outside the dock so they aren't clipped by the
          morph's overflow:hidden. Position:fixed anchored to the
          trigger button's rect. */}
      {helpOpen && helpRect && helpEnabled && (
        <div
          ref={helpRef}
          role="dialog"
          aria-label="Help"
          style={{
            ...vbStyles.helpPopover,
            top: helpRect.top - 10,
            left: helpRect.left + helpRect.width / 2,
            transform: "translate(-50%, -100%)",
          }}
        >
          {help}
        </div>
      )}

      {discardedMenuOpen && discardedRect && (
        <div
          ref={discardedMenuRef}
          role="menu"
          aria-label="Discarded iterations"
          style={{
            ...vbStyles.baselineMenu,
            top: discardedRect.top - 8,
            left: discardedRect.left,
            transform: "translateY(-100%)",
          }}
        >
          {discarded.map((o) => {
            const on = o.id === activeId;
            return (
              <button
                key={o.id}
                type="button"
                role="menuitemradio"
                aria-checked={on}
                className="vb-focusable"
                onClick={() => selectDiscarded(o.id)}
                style={{
                  ...vbStyles.baselineMenuItem,
                  color: on ? "var(--vb-accent)" : "var(--vb-txt)",
                  fontWeight: on ? 700 : 500,
                }}
              >
                {o.label}
                {on && <span aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {baselineMenuOpen && baselineRect && (
        <div
          ref={baselineMenuRef}
          role="menu"
          aria-label="Design phase"
          style={{
            ...vbStyles.baselineMenu,
            top: baselineRect.top - 8,
            left: baselineRect.left,
            transform: "translateY(-100%)",
          }}
        >
          {baselineOptions.map((o) => {
            const on = o.id === baselineSelected.id;
            return (
              <button
                key={o.id}
                type="button"
                role="menuitemradio"
                aria-checked={on}
                className="vb-focusable"
                onClick={() => selectBaseline(o.id)}
                style={{
                  ...vbStyles.baselineMenuItem,
                  color: on ? "var(--vb-accent)" : "var(--vb-txt)",
                  fontWeight: on ? 700 : 500,
                }}
              >
                {o.label}
                {on && <span aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Anchor-rect hook ----------------------------------------------------
function useAnchorRect(ref, active, ...deps) {
  const [rect, setRect] = React.useState(null);
  // Subscribe to scroll/resize while active. setRect is only called
  // from event-handler / RAF callbacks (allowed) — never from the
  // effect body. When active flips off we leave the previous rect
  // in state; consumers should guard with `active`.
  React.useEffect(() => {
    if (!active) return undefined;
    const update = () => {
      if (ref.current) setRect(ref.current.getBoundingClientRect());
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    // Initial measurement deferred to the next frame so it counts as
    // a callback rather than an in-effect setState.
    const raf = requestAnimationFrame(update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(raf);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ...deps]);
  return rect;
}

// ---- Bar children --------------------------------------------------------

function Baseline({ btnRef, selected, label, active, menuOpen, onToggleMenu, isStatic }) {
  const triggerText = label || selected.label;
  // Static mode (e.g. Credits & Usage): the baseline is a plain label,
  // not a design-phase dropdown — no chevron, no menu, not interactive.
  if (isStatic) {
    return (
      <span
        style={{
          ...vbStyles.baseline,
          background: "var(--vb-pill)",
          color: "var(--vb-txt)",
          fontWeight: 500,
          cursor: "default",
        }}
      >
        <span>{triggerText}</span>
      </span>
    );
  }
  return (
    <button
      ref={btnRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={menuOpen}
      className="vb-focusable"
      onClick={onToggleMenu}
      style={{
        ...vbStyles.baseline,
        background: active ? "var(--vb-accent)" : "var(--vb-pill)",
        color: active ? "var(--vb-accent-ink)" : "var(--vb-txt)",
        fontWeight: active ? 700 : 500,
      }}
    >
      <span>{triggerText}</span>
      <span
        style={{
          ...vbStyles.baselineChev,
          transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        <ChevronDownGlyph />
      </span>
    </button>
  );
}

function VChip({ version, active, onClick }) {
  const hasIter = version.iterations.length > 0;
  return (
    <button
      type="button"
      className="vb-focusable"
      onClick={onClick}
      title={version.preferred ? "Preferred direction" : undefined}
      style={{
        ...vbStyles.chip,
        background: active ? "var(--vb-accent)" : "var(--vb-pill)",
        color: active ? "var(--vb-accent-ink)" : "var(--vb-txt)",
        fontWeight: active ? 700 : 500,
      }}
    >
      {version.preferred && (
        <span aria-label="Preferred" style={{ color: active ? "var(--vb-accent-ink)" : "var(--vb-accent)", fontSize: 12 }}>
          ★
        </span>
      )}
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
            className="vb-focusable"
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

function CircleBtn({ btnRef, ariaLabel, pressed, disabled, onClick, children }) {
  return (
    <button
      ref={btnRef}
      type="button"
      aria-label={ariaLabel}
      aria-pressed={pressed}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      className="vb-focusable"
      onClick={onClick}
      style={{
        ...vbStyles.circle,
        // Disabled state matches FigmaMark's muted treatment: glyph
        // rendered at var(--vb-muted) over a transparent chrome. No
        // opacity layer — the Figma marks set fill directly, so they
        // and the ? both land at the same muted grey.
        color: disabled ? "var(--vb-muted)" : pressed ? "var(--vb-accent)" : "var(--vb-txt)",
        background: disabled ? "transparent" : "var(--vb-circle)",
        borderColor: disabled ? "transparent" : "var(--vb-hairline)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

// ---- Icons (inline SVG) --------------------------------------------------

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

function ChevronDownGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="12"
      height="12"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
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

function FigmaMark({ muted = false }) {
  // When muted, all five shapes desaturate to a single grey so the icon
  // reads as "not actionable" without losing the recognisable F mark.
  const fill = (c) => (muted ? "var(--vb-muted)" : c);
  return (
    <svg width="14" height="20" viewBox="0 0 38 57" fill="none" aria-hidden="true">
      <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0Z" fill={fill("#1ABCFE")} />
      <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0Z" fill={fill("#0ACF83")} />
      <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19Z" fill={fill("#FF7262")} />
      <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5Z" fill={fill("#F24E1E")} />
      <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5Z" fill={fill("#A259FF")} />
    </svg>
  );
}

// ---- Styles --------------------------------------------------------------

// Host scopes the dark CSS variables so the bar reads correctly over
// light-mode pages. Webfonts fall back to system if not loaded.
const hostStyles = {
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
};

const vbStyles = {
  baseline: {
    height: 36,
    borderRadius: 12,
    paddingInline: 14,
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--vb-mono)",
    fontSize: 13,
    letterSpacing: "0.01em",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
    whiteSpace: "nowrap",
    transition: "background 180ms ease, color 180ms ease",
  },
  baselineChev: {
    display: "inline-flex",
    transition: "transform 180ms ease",
    opacity: 0.85,
  },
  baselineMenu: {
    position: "fixed",
    zIndex: 70,
    minWidth: 180,
    background: "var(--vb-group)",
    border: "1px solid var(--vb-hairline)",
    borderRadius: 10,
    padding: 4,
    boxShadow: "0 20px 50px -22px rgba(0,0,0,0.7)",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    color: "var(--vb-txt)",
    fontFamily: "var(--vb-ui)",
  },
  baselineMenuItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingInline: 12,
    paddingBlock: 8,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    borderRadius: 8,
    fontFamily: "var(--vb-mono)",
    fontSize: 12,
    letterSpacing: "0.02em",
    textAlign: "left",
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
    flexShrink: 0,
    whiteSpace: "nowrap",
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
    flexShrink: 0,
  },
  vlabel: {
    fontFamily: "var(--vb-mono)",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--vb-accent)",
    paddingInline: 6,
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
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
    fontFamily: "var(--vb-ui)",
    fontSize: 14,
    flexShrink: 0,
    transition: "background 180ms ease, color 180ms ease",
  },
  helpPopover: {
    position: "fixed",
    zIndex: 70,
    width: 320,
    maxWidth: "calc(100vw - 56px)",
    background: "var(--vb-bar)",
    border: "1px solid var(--vb-hairline)",
    borderRadius: 12,
    padding: "14px 16px",
    boxShadow: "0 20px 50px -22px rgba(0,0,0,0.7)",
    color: "var(--vb-txt)",
    boxSizing: "border-box",
    fontFamily: "var(--vb-ui)",
  },
  helpTitle: {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
  },
  helpText: {
    margin: 0,
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

// Stylesheet for: the morph transitions, the Pop stagger (needs
// nth-child selectors), :focus-visible, prefers-reduced-motion. All
// `vb-` prefixed to keep this self-contained.
const VB_STYLESHEET = `
.vb-dock {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 4px;
}
.vb-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.vb-morph {
  position: relative;
  height: ${COLLAPSED_SIZE}px;
  border-radius: ${COLLAPSED_SIZE / 2}px;
  background: var(--vb-bar);
  border: 1px solid var(--vb-hairline);
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 16px 40px -16px rgba(0,0,0,0.7);
  transition:
    width .42s cubic-bezier(.2,.7,.2,1),
    border-radius .42s cubic-bezier(.2,.7,.2,1),
    box-shadow .3s ease;
  color: var(--vb-txt);
}
.vb-dock.is-open .vb-morph {
  border-radius: 18px;
  cursor: default;
  box-shadow: 0 20px 50px -22px rgba(0,0,0,0.7);
}
.vb-m-bar {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  height: ${COLLAPSED_SIZE}px;
  box-sizing: border-box;
  white-space: nowrap;
  width: max-content;
}
.vb-m-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: opacity .18s ease;
  opacity: 1;
}
.vb-dock.is-open .vb-m-icon {
  opacity: 0;
}
.vb-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--vb-accent);
  color: var(--vb-accent-ink);
  font-family: var(--vb-mono);
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--vb-bar);
  transition: opacity .15s ease;
  pointer-events: none;
}
.vb-dock.is-open .vb-badge {
  opacity: 0;
}
.vb-divider {
  width: 1px;
  height: 22px;
  background: var(--vb-divider);
  flex-shrink: 0;
}
.vb-q {
  font-family: var(--vb-mono);
  font-weight: 700;
}
.vb-close {
  width: 0;
  height: ${CLOSE_SIZE}px;
  border-radius: 50%;
  opacity: 0;
  overflow: hidden;
  padding: 0;
  background: var(--vb-circle);
  border: 1px solid var(--vb-hairline);
  color: var(--vb-txt);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: width .3s ease, opacity .25s ease;
  box-shadow: 0 8px 18px -6px rgba(0,0,0,0.6);
}
.vb-dock.is-open .vb-close {
  width: ${CLOSE_SIZE}px;
  opacity: 1;
}

/* Pop — chips hidden behind the circle while collapsed; pop in with
   a spring overshoot, staggered, when the dock is open. */
.vb-m-bar > * {
  opacity: 0;
  transform: scale(.4);
  transform-origin: center;
  transition: opacity .24s ease, transform .34s cubic-bezier(.34, 1.56, .64, 1);
}
.vb-dock.is-open .vb-m-bar > * {
  opacity: 1;
  transform: scale(1);
}
.vb-dock.is-open .vb-m-bar > *:nth-child(1) { transition-delay: .06s; }
.vb-dock.is-open .vb-m-bar > *:nth-child(2) { transition-delay: .11s; }
.vb-dock.is-open .vb-m-bar > *:nth-child(3) { transition-delay: .16s; }
.vb-dock.is-open .vb-m-bar > *:nth-child(4) { transition-delay: .21s; }
.vb-dock.is-open .vb-m-bar > *:nth-child(5) { transition-delay: .26s; }
.vb-dock.is-open .vb-m-bar > *:nth-child(6) { transition-delay: .31s; }
.vb-dock.is-open .vb-m-bar > *:nth-child(7) { transition-delay: .36s; }
.vb-dock.is-open .vb-m-bar > *:nth-child(8) { transition-delay: .41s; }
.vb-dock.is-open .vb-m-bar > *:nth-child(9) { transition-delay: .46s; }
.vb-dock.is-open .vb-m-bar > *:nth-child(10) { transition-delay: .51s; }

/* Focus ring */
.vb-focusable:focus-visible {
  outline: 2px solid var(--vb-accent);
  outline-offset: 2px;
}
.vb-morph[tabindex="0"]:focus-visible {
  outline: 2px solid var(--vb-accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .vb-morph,
  .vb-m-icon,
  .vb-badge,
  .vb-close,
  .vb-m-bar > * {
    transition: none !important;
  }
  .vb-m-bar > * {
    transform: scale(1);
    opacity: 1;
  }
}
`;
