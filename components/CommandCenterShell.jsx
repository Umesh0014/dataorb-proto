"use client";

import React from "react";
import DarkPillSwitcher from "./DarkPillSwitcher";
import CommandCenterQueue from "./CommandCenterQueue";
import CommandCenterBoard from "./CommandCenterBoard";
import CommandCenterFocus from "./CommandCenterFocus";
import AttentionItemDrawer from "./AttentionItemDrawer";
import Modal from "./Modal";
import Toast from "./Toast";
import { ATTENTION_ITEMS, RESOLVED_ITEMS } from "./mocks/commandCenter";

// CommandCenterShell — the Team Leader Command Center entry point. Hosts the
// three switcher variants behind a floating 3-way DarkPillSwitcher (Queue /
// Board / Focus) and owns the shared, in-memory triage state so the loop is
// consistent across variants: launch → Acted, snooze / dismiss / mark
// handled drop the item, Undo restores it. The shared sidecar drawer, the
// confirm/dismiss Modal, and the Toast live here once and are reused by every
// variant. All state resets on reload — no persistence by design (G5).
//
// Placement note: this is mounted on a Learning Hub route for the preview.
// Whether the production home is a dedicated rail item or a role-aware
// default route is a product decision flagged to Akash/Neil, not settled here.

const VARIANTS = ["Queue", "Board", "Focus"];
const HIDDEN = new Set(["snoozed", "dismissed", "handled"]);

export default function CommandCenterShell({ onOpenAgent }) {
  const [variant, setVariant] = React.useState("Queue");
  // statusById: id → "acted" | "snoozed" | "dismissed" | "handled".
  // Absent means the item is still Open.
  const [statusById, setStatusById] = React.useState({});
  const [selectedId, setSelectedId] = React.useState(null);
  const [pending, setPending] = React.useState(null); // { type: "launch" | "dismiss", id }
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => () => { if (toast?.timer) clearTimeout(toast.timer); }, [toast]);

  const visibleItems = React.useMemo(
    () =>
      ATTENTION_ITEMS.filter((it) => !HIDDEN.has(statusById[it.id])).map((it) => ({
        ...it,
        status: statusById[it.id] === "acted" ? "acted" : "open",
      })),
    [statusById],
  );

  const selectedItem = selectedId
    ? visibleItems.find((it) => it.id === selectedId) || null
    : null;
  const selectedStatus = selectedItem ? selectedItem.status : "open";

  const nameOf = (id) => ATTENTION_ITEMS.find((it) => it.id === id)?.agent.name || "this item";

  const showToast = (message, undoId) => {
    if (toast?.timer) clearTimeout(toast.timer);
    const timer = setTimeout(() => setToast(null), 5000);
    setToast({
      message,
      timer,
      action: undoId
        ? { label: "Undo", onClick: () => restore(undoId) }
        : undefined,
    });
  };

  const setStatus = (id, status) => setStatusById((prev) => ({ ...prev, [id]: status }));

  const restore = (id) => {
    setStatusById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setToast((t) => { if (t?.timer) clearTimeout(t.timer); return null; });
  };

  // ---- Actions ----------------------------------------------------------
  const onLaunch = (id) => setPending({ type: "launch", id });
  const onDismiss = (id) => setPending({ type: "dismiss", id });

  const onSnooze = (id) => {
    setStatus(id, "snoozed");
    if (selectedId === id) setSelectedId(null);
    showToast(`Snoozed ${nameOf(id)} for 7 days`, id);
  };
  const onMarkHandled = (id) => {
    setStatus(id, "handled");
    if (selectedId === id) setSelectedId(null);
    showToast(`Marked ${nameOf(id)} handled`, id);
  };

  const confirmPending = () => {
    if (!pending) return;
    const { type, id } = pending;
    if (type === "launch") {
      setStatus(id, "acted");
      showToast(`Intervention launched for ${nameOf(id)} — tracking the result`);
    } else {
      setStatus(id, "dismissed");
      if (selectedId === id) setSelectedId(null);
      showToast(`Dismissed item for ${nameOf(id)}`, id);
    }
    setPending(null);
  };

  const variantProps = {
    items: visibleItems,
    resolved: RESOLVED_ITEMS,
    onLaunch,
    onOpenDetail: setSelectedId,
    onOpenAgent: (agentId) => { setSelectedId(null); onOpenAgent?.(agentId); },
    onSnooze,
    onDismiss,
    onMarkHandled,
  };

  return (
    <div style={shellStyles.wrap}>
      {variant === "Queue" && <CommandCenterQueue {...variantProps} />}
      {variant === "Board" && <CommandCenterBoard {...variantProps} />}
      {variant === "Focus" && <CommandCenterFocus {...variantProps} />}

      <AttentionItemDrawer
        item={selectedItem}
        status={selectedStatus}
        onClose={() => setSelectedId(null)}
        onLaunch={() => selectedItem && onLaunch(selectedItem.id)}
        onOpenAgent={variantProps.onOpenAgent}
        onSnooze={() => selectedItem && onSnooze(selectedItem.id)}
        onDismiss={() => selectedItem && onDismiss(selectedItem.id)}
      />

      <Modal
        open={Boolean(pending)}
        onDismiss={() => setPending(null)}
        title={pending?.type === "dismiss" ? "Dismiss this attention item?" : "Launch this intervention?"}
        body={
          pending?.type === "dismiss"
            ? `It will drop off your queue. We'll re-surface the signal if it gets worse. You can undo for a few seconds.`
            : `This records the intervention against ${nameOf(pending?.id)}'s history and starts tracking whether the metric moves.`
        }
        confirmLabel={pending?.type === "dismiss" ? "Dismiss" : "Launch"}
        confirmTone={pending?.type === "dismiss" ? "danger" : "primary"}
        onConfirm={confirmPending}
      />

      {toast && (
        <Toast
          tone="info"
          message={toast.message}
          action={toast.action}
          onDismiss={() => { if (toast.timer) clearTimeout(toast.timer); setToast(null); }}
        />
      )}

      <div style={shellStyles.switcher}>
        <DarkPillSwitcher
          ariaLabel="Command Center layout variant"
          value={variant}
          options={VARIANTS}
          onChange={setVariant}
        />
      </div>
    </div>
  );
}

const shellStyles = {
  wrap: { position: "relative" },
  switcher: {
    position: "fixed",
    right: 28,
    bottom: 28,
    zIndex: 55,
  },
};
