"use client";

import React from "react";

/**
 * PageLayout — shared frame for everything to the right of <SideNav>.
 *
 * Horizontal rules (token-driven; see app/globals.css):
 *   - Min supported viewport: var(--page-min-width) = 1260px.
 *   - Side nav rail occupies var(--sidenav-width) on the left.
 *   - Content has max-width var(--page-content-max-width) = 1068px and
 *     is centered inside the main area via margin-inline auto.
 *   - Minimum gutter on either side of content is var(--page-gutter)
 *     = 64px (achieved at exactly 1260 viewport). Above 1260, gutters
 *     grow as a natural consequence of centering.
 *
 * Right panel rules:
 *   - When rightPanel is null, layout is sidebar + centered content.
 *   - When rightPanel is open AND viewport ≥ var(--page-right-panel-dock-min)
 *     = 1644px, the panel docks alongside content. The unit
 *     [content 1068 + gap 64 + panel 320 = 1452] centers in the main
 *     area; minimum gutter on either side is 64.
 *   - When rightPanel is open AND viewport < 1644, panel overlays the
 *     right edge of the viewport. Content stays at 1068 centered as if
 *     the panel were closed; panel pins to right via position: fixed.
 *   - Mode (dock vs overlay) is captured at the moment the panel opens
 *     and held until it closes — viewport changes mid-open do not flip.
 *
 * Vertical rules:
 *   - Root has min-height: 100vh — page background reaches window
 *     bottom on every viewport, even when content is short.
 *   - Content region uses flex: 1 so empty space below short content
 *     grows; cards keep their natural heights.
 *   - No fixed-height layout containers anywhere else.
 *
 * @param {{
 *   children: React.ReactNode,
 *   header?: React.ReactNode,            // optional header band above the card stack
 *   rightPanel?: React.ReactNode | null, // pass non-null to open the panel
 *   background?: string,                 // override page background
 * }} props
 */
export default function PageLayout({
  children,
  header = null,
  rightPanel = null,
  onPanelClose,
  background = "var(--surface-canvas)",
}) {
  const isOpen = Boolean(rightPanel);
  const [mode, setMode] = React.useState(null);
  const prevOpenRef = React.useRef(false);

  React.useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      const dockMin = readDockMin();
      setMode(window.innerWidth >= dockMin ? "dock" : "overlay");
    } else if (!isOpen && prevOpenRef.current) {
      setMode(null);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen]);

  // Escape closes any open right panel.
  React.useEffect(() => {
    if (!isOpen || !onPanelClose) return;
    const handler = (e) => { if (e.key === "Escape") onPanelClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onPanelClose]);

  const dockOpen = isOpen && mode === "dock";
  const overlayOpen = isOpen && mode === "overlay";

  return (
    <div
      style={{
        // Logical inline-start margin: clears the rail on the left in LTR
        // and on the right in RTL, matching SideNav's flipped position.
        marginInlineStart: "var(--sidenav-width)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background,
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <main
        style={{
          flex: 1,
          minWidth: 0,
          paddingInline: "var(--page-gutter)",
          paddingTop: "var(--page-padding-top)",
          paddingBottom: "var(--page-padding-bottom)",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        {dockOpen ? (
          <DockedRow header={header} rightPanel={rightPanel}>
            {children}
          </DockedRow>
        ) : (
          <CenteredColumn header={header}>{children}</CenteredColumn>
        )}
      </main>

      {overlayOpen && (
        <>
          <OverlayScrim onClick={onPanelClose} />
          <OverlayPanel>{rightPanel}</OverlayPanel>
        </>
      )}
    </div>
  );
}

function OverlayScrim({ onClick }) {
  return (
    <div
      onClick={onClick}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "transparent",
        zIndex: 39,
      }}
    />
  );
}

// CenteredColumn — content centered at max-width 1068. Used when panel
// is closed, or when panel is open in overlay mode (overlay floats over
// content; content layout is unchanged).
function CenteredColumn({ children, header }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "var(--page-content-max-width)",
        marginInline: "auto",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {header && (
        <div style={{ marginBottom: "var(--page-header-gap)", flexShrink: 0 }}>
          {header}
        </div>
      )}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "var(--page-card-gap)",
          minHeight: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// DockedRow — content + gap + panel as a centered row. Unit max-width
// is content (1068) + gap (64) + panel (320) = 1452. Min gutter 64
// each side at viewport 1644.
function DockedRow({ children, header, rightPanel }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth:
          "calc(var(--page-content-max-width) + var(--page-right-panel-gap) + var(--page-right-panel-width))",
        marginInline: "auto",
        flex: 1,
        display: "flex",
        flexDirection: "row",
        gap: "var(--page-right-panel-gap)",
        boxSizing: "border-box",
        minHeight: 0,
      }}
    >
      <div
        style={{
          width: "var(--page-content-max-width)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {header && (
          <div style={{ marginBottom: "var(--page-header-gap)", flexShrink: 0 }}>
            {header}
          </div>
        )}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "var(--page-card-gap)",
            minHeight: 0,
          }}
        >
          {children}
        </div>
      </div>
      <aside
        aria-label="Page side panel"
        style={{
          width: "var(--page-right-panel-width)",
          flexShrink: 0,
          background: "var(--surface-white)",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {rightPanel}
      </aside>
    </div>
  );
}

// OverlayPanel — panel pinned to the right edge of the viewport, with
// a click-to-dismiss scrim. Used when viewport < dock floor.
function OverlayPanel({ children }) {
  return (
    <aside
      aria-label="Page side panel"
      style={{
        position: "fixed",
        top: 0,
        insetInlineEnd: 0,
        bottom: 0,
        width: "var(--page-right-panel-width)",
        background: "var(--surface-white)",
        boxShadow: "var(--shadow-drawer)",
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
      }}
    >
      {children}
    </aside>
  );
}

// readDockMin — resolve --page-right-panel-dock-min from CSS, fall
// back to 1620 if it's not set yet (e.g. before fonts/styles load).
function readDockMin() {
  if (typeof window === "undefined") return 1620;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--page-right-panel-dock-min")
    .trim();
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : 1620;
}
