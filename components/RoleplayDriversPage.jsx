"use client";

import React from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Settings as SettingsCog,
  Waves,
} from "lucide-react";
import PageLayout from "./PageLayout";
import PageHeader from "./PageHeader";
import Card from "./Card";
import KebabMenu from "./KebabMenu";
import Toast from "./Toast";
import Tooltip from "./Tooltip";
import CreateDriverModal from "./CreateDriverModal";
import ArchiveDriverModal from "./ArchiveDriverModal";
import { ROLEPLAY_DRIVERS, DRIVER_CAP } from "./mocks/roleplayDrivers";

// RoleplayDriversPage — Settings → Learning Hub → Roleplay Drivers list
// (Figma "In review - V2"). Four overlapping states fold into one page:
//
//   • Default list (active drivers, 2-col grid)
//   • Filter dropdown — radio toggle between "Active only" (default) and
//     "Active + Archived" (badge "1" on the filter button when not the
//     default).
//   • Cap state — when active drivers >= DRIVER_CAP (20), the "+ Driver"
//     CTA disables and a Tooltip explains the cap on hover.
//   • Toast — "Driver {Name} archived successfully" pinned bottom-left
//     after a confirm-archive flow (5s auto-dismiss).
//
// Two modals (CreateDriverModal, ArchiveDriverModal) are owned here so
// their open state stays page-local. New / archived state for the demo
// lives in two Sets layered over the seed ROLEPLAY_DRIVERS list — no
// persistence; reset on page reload.

const SEARCH_PLACEHOLDER = "Search by name, description";
const CAP_MESSAGE = `No more than ${DRIVER_CAP} drivers can be created. Please archive one to create new.`;

export default function RoleplayDriversPage({ onBack }) {
  const [query, setQuery] = React.useState("");
  // Filter dropdown — "active" (default) hides archived; "all" mixes them
  // in with an Archived chip on the archived rows.
  const [filter, setFilter] = React.useState("active");
  const [filterMenuOpen, setFilterMenuOpen] = React.useState(false);
  const [archivedIds, setArchivedIds] = React.useState(() => new Set());
  // createdDrivers — session-local drivers appended by the Create modal.
  // They surface in the list, count toward DRIVER_CAP, and can be
  // archived like seed drivers.
  const [createdDrivers, setCreatedDrivers] = React.useState([]);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [archiveTarget, setArchiveTarget] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  // Cancel the auto-dismiss timer when the toast is replaced or unmounted.
  React.useEffect(() => () => { if (toast?.timer) clearTimeout(toast.timer); }, [toast]);

  // Compose seed drivers + session-created drivers + the archive overlay
  // into the unified list the rest of the page renders from.
  const allDrivers = React.useMemo(() => {
    const composed = [...ROLEPLAY_DRIVERS, ...createdDrivers].map((d) => ({
      ...d,
      archived: d.archived || archivedIds.has(d.id),
    }));
    return composed;
  }, [createdDrivers, archivedIds]);

  const activeCount = allDrivers.filter((d) => !d.archived).length;
  const atCap = activeCount >= DRIVER_CAP;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return allDrivers
      .filter((d) => (filter === "active" ? !d.archived : true))
      .filter((d) => {
        if (!q) return true;
        return (
          d.name.toLowerCase().includes(q)
          || d.description.toLowerCase().includes(q)
        );
      });
  }, [allDrivers, filter, query]);

  const filterActiveBadge = filter !== "active" ? 1 : 0;

  // --- Handlers --------------------------------------------------------

  const openCreate = () => {
    if (atCap) return;
    setCreateOpen(true);
  };

  const handleCreate = ({ name, description }) => {
    const id = `created-${Date.now()}`;
    const today = new Date();
    const month = today.toLocaleString("en-US", { month: "short" });
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    const createdAt = `${month} ${day}, ${year}`;
    setCreatedDrivers((prev) => [
      ...prev,
      {
        id,
        name,
        description,
        createdAt,
        // Session-created drivers default to a "C" initial — matches the
        // human-author affordance pattern in the spec.
        createdBy: { initial: "C" },
        archived: false,
      },
    ]);
    setCreateOpen(false);
  };

  const handleArchive = (driver) => setArchiveTarget(driver);

  const handleConfirmArchive = () => {
    if (!archiveTarget) return;
    const name = archiveTarget.name;
    setArchivedIds((prev) => {
      const next = new Set(prev);
      next.add(archiveTarget.id);
      return next;
    });
    setArchiveTarget(null);
    if (toast?.timer) clearTimeout(toast.timer);
    const timer = setTimeout(() => setToast(null), 5000);
    setToast({ message: `Driver ${name} archived successfully`, timer });
  };

  const handleToastDismiss = () => {
    if (toast?.timer) clearTimeout(toast.timer);
    setToast(null);
  };

  // --- Render ----------------------------------------------------------

  const FilterToolbarIcon = (
    <span style={iconStyles.filterIconWrap}>
      <SlidersHorizontal size={16} />
      {filterActiveBadge > 0 && (
        <span style={iconStyles.filterBadge} aria-hidden="true">
          {filterActiveBadge}
        </span>
      )}
    </span>
  );

  const PrimaryActionButton = (
    <PageHeader
      back={onBack}
      identifier={{
        icon: <Waves size={18} color="var(--tile-violet-fg)" />,
        label: "Roleplay Drivers",
        withDropdown: true,
        onClick: () => {},
        iconBg: "var(--tile-violet-bg)",
        iconColor: "var(--tile-violet-fg)",
      }}
      primaryAction={{
        label: "Driver",
        icon: <Plus size={16} />,
        onClick: openCreate,
        disabled: atCap,
        // The PageHeader Button renders this disabled state with the
        // standard greyed treatment; the Tooltip wrap below adds the
        // hover affordance described in the Figma spec.
      }}
      search={{
        value: query,
        onChange: setQuery,
        placeholder: SEARCH_PLACEHOLDER,
      }}
      toolbar={[{
        id: "filter",
        icon: FilterToolbarIcon,
        label: "Filter drivers",
        onClick: () => setFilterMenuOpen((o) => !o),
        active: filterMenuOpen,
      }]}
    />
  );

  return (
    <>
      <PageLayout
        header={
          // The disabled-CTA tooltip needs to wrap the +Driver button, but
          // PageHeader owns the button. The tooltip is delivered instead
          // as an absolutely-positioned overlay attached to the disabled
          // state — see CapTooltipOverlay below.
          <div style={layoutStyles.headerWrap}>
            {PrimaryActionButton}
            {atCap && <CapTooltipOverlay message={CAP_MESSAGE} />}
            {filterMenuOpen && (
              <FilterMenu
                value={filter}
                onChange={(v) => { setFilter(v); setFilterMenuOpen(false); }}
                onDismiss={() => setFilterMenuOpen(false)}
              />
            )}
          </div>
        }
      >
        <div style={layoutStyles.grid}>
          {filtered.map((driver) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              onArchive={() => handleArchive(driver)}
            />
          ))}
          {filtered.length === 0 && (
            <div style={layoutStyles.empty}>
              <Search size={20} color="var(--color-text-tertiary)" />
              <span style={layoutStyles.emptyText}>No drivers match your search.</span>
            </div>
          )}
        </div>
      </PageLayout>

      <CreateDriverModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
      <ArchiveDriverModal
        open={!!archiveTarget}
        driverName={archiveTarget?.name || ""}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleConfirmArchive}
      />
      {toast && (
        <Toast
          tone="info"
          message={toast.message}
          onDismiss={handleToastDismiss}
        />
      )}
    </>
  );
}

// CapTooltipOverlay — when the +Driver CTA is disabled (cap reached), the
// PageHeader still renders a real <button disabled> which doesn't emit
// mouseenter events on all browsers. We overlay a transparent pointer
// catcher above the CTA's position to host the Tooltip. The CTA sits at
// the top-right of the header band (paddingInline 28, row1 minHeight 80),
// so we mirror that placement.
function CapTooltipOverlay({ message }) {
  return (
    <div style={capStyles.overlay}>
      <Tooltip content={message} placement="bottom">
        <span style={capStyles.target} aria-hidden="true" />
      </Tooltip>
    </div>
  );
}

const capStyles = {
  overlay: {
    position: "absolute",
    top: 16,
    right: 28,
    width: 132,
    height: 40,
    pointerEvents: "none",
    zIndex: 4,
  },
  target: {
    display: "block",
    width: "100%",
    height: "100%",
    pointerEvents: "auto",
    cursor: "not-allowed",
  },
};

// FilterMenu — small dropdown menu anchored to the bottom-right of the
// header band's filter icon. Radio-style 2-option toggle: Active only vs
// Active + Archived. Mirrors the menu chrome from SortControl in
// MissionsKanbanLayout but is local to this page (rule of three not yet
// triggered).
function FilterMenu({ value, onChange, onDismiss }) {
  return (
    <>
      <div style={filterStyles.scrim} onClick={onDismiss} aria-hidden="true" />
      <div role="menu" style={filterStyles.menu}>
        <span style={filterStyles.menuHeading}>Show</span>
        <button
          type="button"
          role="menuitemradio"
          aria-checked={value === "active"}
          onClick={() => onChange("active")}
          style={filterStyles.item}
        >
          <span style={filterStyles.radio(value === "active")} aria-hidden="true" />
          Active only
        </button>
        <button
          type="button"
          role="menuitemradio"
          aria-checked={value === "all"}
          onClick={() => onChange("all")}
          style={filterStyles.item}
        >
          <span style={filterStyles.radio(value === "all")} aria-hidden="true" />
          Active + Archived
        </button>
      </div>
    </>
  );
}

const filterStyles = {
  scrim: {
    position: "fixed",
    inset: 0,
    zIndex: 39,
  },
  menu: {
    position: "absolute",
    top: "100%",
    right: 28,
    marginTop: 4,
    minWidth: 192,
    background: "#FFFFFF",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 8,
    boxShadow: "var(--shadow-8)",
    padding: "8px 0",
    zIndex: 40,
    fontFamily: "var(--font-sans)",
  },
  menuHeading: {
    display: "block",
    padding: "4px 16px 8px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    appearance: "none",
    border: "none",
    background: "transparent",
    textAlign: "left",
    padding: "8px 16px",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    cursor: "pointer",
  },
  radio: (active) => ({
    width: 14,
    height: 14,
    borderRadius: 999,
    border: `1.5px solid ${active ? "var(--do-brand-blue)" : "var(--color-border-card-soft)"}`,
    background: active
      ? "radial-gradient(circle, var(--do-brand-blue) 0 4px, #FFFFFF 5px 14px)"
      : "#FFFFFF",
    flexShrink: 0,
  }),
};

// DriverCard — one grid cell. Header carries the title and the row kebab
// (Edit / Archive). Body shows the description (clamped to 2 lines). The
// footer carries the authored-by affordance (cog for AI, lettered avatar
// for human), the creation date, and the inline Archived chip when the
// driver is archived.
function DriverCard({ driver, onArchive }) {
  return (
    <Card padding={16} style={cardStyles.card}>
      <div style={cardStyles.headerRow}>
        <h3 style={cardStyles.title}>{driver.name}</h3>
        <span onClick={(e) => e.stopPropagation()} style={cardStyles.kebabAnchor}>
          <KebabMenu
            ariaLabel={`Actions for ${driver.name}`}
            items={[
              {
                label: "Edit",
                onClick: () => {
                  // Edit not in scope for this branch (Figma covers only
                  // the affordance, no editor flow). Stub to console so
                  // reviewers can confirm the wire-up.
                  // eslint-disable-next-line no-console
                  console.log("edit driver →", driver.id);
                },
              },
              { label: "Archive", onClick: onArchive },
            ]}
          />
        </span>
      </div>
      <p style={cardStyles.desc}>{driver.description}</p>
      <div style={cardStyles.footer}>
        <AuthorBadge author={driver.createdBy} />
        <span style={cardStyles.date}>{driver.createdAt}</span>
        {driver.archived && (
          <>
            <span style={cardStyles.footerDot} aria-hidden="true">·</span>
            <span style={cardStyles.archivedChip}>Archived</span>
          </>
        )}
      </div>
    </Card>
  );
}

// AuthorBadge — cog when the driver was authored by Ask Mira Pro (AI),
// circular avatar with the human author's initial otherwise. Sized to
// match the date row's text cap-height.
function AuthorBadge({ author }) {
  if (author === "ai") {
    return (
      <span style={authorStyles.cogWrap} aria-label="Created by Ask Mira Pro">
        <SettingsCog size={14} color="var(--do-brand-blue)" />
      </span>
    );
  }
  const initial = (author && author.initial) || "?";
  return (
    <span
      style={authorStyles.initialWrap}
      aria-label={`Created by ${initial}`}
    >
      {initial}
    </span>
  );
}

const iconStyles = {
  filterIconWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--color-text-medium)",
  },
  filterBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    padding: "0 4px",
    borderRadius: 999,
    background: "var(--do-brand-blue)",
    color: "#FFFFFF",
    fontFamily: "var(--font-sans)",
    fontSize: 10,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
};

const layoutStyles = {
  headerWrap: {
    position: "relative",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
    width: "100%",
  },
  empty: {
    gridColumn: "1 / -1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "40px 0",
    color: "var(--color-text-tertiary)",
    fontFamily: "var(--font-sans)",
  },
  emptyText: {
    fontSize: 13,
    fontWeight: 500,
  },
};

const cardStyles = {
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minHeight: 140,
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  kebabAnchor: {
    flexShrink: 0,
    marginTop: -4,
  },
  desc: {
    margin: 0,
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-medium)",
    lineHeight: 1.5,
    flex: 1,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  footerDot: {
    color: "var(--color-text-tertiary)",
    fontSize: 13,
  },
  date: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    fontVariantNumeric: "tabular-nums",
  },
  archivedChip: {
    display: "inline-flex",
    alignItems: "center",
    height: 20,
    padding: "0 8px",
    borderRadius: 4,
    background: "var(--pill-bg)",
    color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 500,
  },
};

const authorStyles = {
  cogWrap: {
    width: 20,
    height: 20,
    borderRadius: 999,
    background: "var(--color-info-bg)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  initialWrap: {
    width: 20,
    height: 20,
    borderRadius: 999,
    background: "var(--color-info-bg)",
    color: "var(--color-info)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
};
