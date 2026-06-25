"use client";
/* eslint-disable no-restricted-syntax, react-hooks/set-state-in-effect --
   CommentLayer is review meta-tooling (a Figma-style comment overlay), not
   product chrome. Raw <button> is intentional, same precedent as VersionBar /
   IterationRail; the mounted + localStorage hydration guard sets state on mount
   by design (client-only, avoids an SSR mismatch). */

import React from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { MessageSquare, Check, Trash2, X } from "lucide-react";

// CommentLayer — a global, Figma-style review overlay. Toggle it on, then click
// anywhere to drop a numbered pin + comment bubble; the toggle shows how many
// open comments sit on the current page. Pins anchor to document coordinates so
// they scroll with the content, and everything persists to localStorage (keyed
// per route) so a reviewer's notes survive a refresh. Meta-tooling, not product.
const STORE_KEY = "do-comments-v1";

const stamp = () =>
  new Date().toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export default function CommentLayer() {
  const path = usePathname() || "/";
  const [mounted, setMounted] = React.useState(false);
  const [comments, setComments] = React.useState([]);
  const [mode, setMode] = React.useState(false);
  const [draft, setDraft] = React.useState(null); // { x, y } for a new pin
  const [openId, setOpenId] = React.useState(null);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) setComments(JSON.parse(raw));
    } catch {
      /* ignore corrupt store */
    }
  }, []);
  React.useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(comments));
    } catch {
      /* ignore quota */
    }
  }, [comments, mounted]);

  if (!mounted) return null;

  const onPage = comments.filter((c) => c.path === path);
  const visible = onPage.filter((c) => !c.resolved);

  const place = (e) => {
    setOpenId(null);
    setDraft({ x: e.clientX + window.scrollX, y: e.clientY + window.scrollY });
    setText("");
  };
  const post = () => {
    const t = text.trim();
    if (!t || !draft) return;
    setComments((cs) => [...cs, { id: `c-${cs.length}-${Math.round(draft.x)}x${Math.round(draft.y)}`, path, x: draft.x, y: draft.y, text: t, createdAt: stamp(), resolved: false }]);
    setDraft(null);
    setText("");
  };
  const remove = (id) => {
    setComments((cs) => cs.filter((c) => c.id !== id));
    setOpenId(null);
  };
  const toggleResolve = (id) => {
    setComments((cs) => cs.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c)));
    setOpenId(null);
  };
  const open = onPage.find((c) => c.id === openId) || null;

  return (
    <>
      {mode && <div style={styles.capture} onClick={place} aria-hidden="true" />}

      {createPortal(
        <div style={styles.pinLayer}>
          {visible.map((c, i) => (
            <Pin
              key={c.id}
              n={i + 1}
              x={c.x}
              y={c.y}
              active={openId === c.id}
              onClick={(e) => {
                e.stopPropagation();
                setDraft(null);
                setOpenId(openId === c.id ? null : c.id);
              }}
            />
          ))}
          {open && <Thread c={open} onClose={() => setOpenId(null)} onResolve={() => toggleResolve(open.id)} onDelete={() => remove(open.id)} />}
          {draft && <Composer x={draft.x} y={draft.y} text={text} onText={setText} onPost={post} onCancel={() => setDraft(null)} />}
        </div>,
        document.body,
      )}

      <button
        type="button"
        onClick={() => {
          setMode((m) => !m);
          setDraft(null);
          setOpenId(null);
        }}
        aria-pressed={mode}
        aria-label="Toggle comments"
        style={{ ...styles.fab, ...(mode ? styles.fabOn : null) }}
      >
        <MessageSquare size={17} />
        <span style={styles.fabText}>{mode ? "Commenting" : "Comment"}</span>
        {visible.length > 0 && <span style={{ ...styles.badge, ...(mode ? styles.badgeOn : null) }}>{visible.length}</span>}
      </button>
      {mode && <div style={styles.hint}>Click anywhere to drop a comment · Esc to stop</div>}
      <EscClose active={mode} onEsc={() => setMode(false)} />
    </>
  );
}

// Closes comment mode on Escape.
function EscClose({ active, onEsc }) {
  React.useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onEsc();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onEsc]);
  return null;
}

function Pin({ n, x, y, active, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label={`Comment ${n}`} style={{ ...styles.pin, left: x, top: y, ...(active ? styles.pinActive : null) }}>
      {n}
    </button>
  );
}

function Composer({ x, y, text, onText, onPost, onCancel }) {
  return (
    <div style={{ ...styles.bubble, left: x, top: y }} role="dialog" aria-label="New comment">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => onText(e.target.value)}
        placeholder="Add a comment"
        style={styles.textarea}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onPost();
        }}
      />
      <div style={styles.actions}>
        <button type="button" onClick={onCancel} style={styles.linkBtn}>Cancel</button>
        <button type="button" onClick={onPost} disabled={!text.trim()} style={{ ...styles.postBtn, ...(text.trim() ? null : styles.postDisabled) }}>
          Comment
        </button>
      </div>
    </div>
  );
}

function Thread({ c, onClose, onResolve, onDelete }) {
  return (
    <div style={{ ...styles.bubble, left: c.x, top: c.y }} role="dialog" aria-label="Comment">
      <div style={styles.threadHead}>
        <span style={styles.threadMeta}>{c.createdAt}</span>
        <button type="button" onClick={onClose} style={styles.iconBtn} aria-label="Close">
          <X size={14} />
        </button>
      </div>
      <p style={styles.threadText}>{c.text}</p>
      <div style={styles.actions}>
        <button type="button" onClick={onDelete} style={styles.linkBtn}>
          <Trash2 size={13} /> Delete
        </button>
        <button type="button" onClick={onResolve} style={styles.resolveBtn}>
          <Check size={13} /> Resolve
        </button>
      </div>
    </div>
  );
}

const BLUE = "var(--do-brand-blue)";
const styles = {
  capture: { position: "fixed", inset: 0, zIndex: 9980, cursor: "crosshair", background: "rgba(37,99,235,0.03)" },
  pinLayer: { position: "absolute", top: 0, left: 0, zIndex: 9990, pointerEvents: "none" },
  pin: {
    position: "absolute",
    transform: "translate(-50%, -100%)",
    width: 28,
    height: 28,
    borderRadius: "50% 50% 50% 2px",
    border: "2px solid #FFFFFF",
    background: BLUE,
    color: "#FFFFFF",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    pointerEvents: "auto",
    boxShadow: "0 6px 16px -4px rgba(37,99,235,0.5)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pinActive: { background: "var(--color-text-deep)", boxShadow: "0 8px 20px -4px rgba(17,17,26,0.5)" },
  bubble: {
    position: "absolute",
    transform: "translate(14px, -12px)",
    width: 268,
    pointerEvents: "auto",
    background: "#FFFFFF",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 12,
    boxShadow: "0 18px 48px -16px rgba(17,17,26,0.4)",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  textarea: {
    width: "100%",
    minHeight: 64,
    resize: "vertical",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    padding: "8px 10px",
    fontFamily: "inherit",
    fontSize: 13,
    color: "var(--color-text-deep)",
    outline: "none",
    boxSizing: "border-box",
  },
  actions: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  linkBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    border: "none",
    background: "transparent",
    color: "var(--color-text-tertiary)",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    padding: "6px 8px",
  },
  postBtn: {
    border: "none",
    background: BLUE,
    color: "#FFFFFF",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    padding: "7px 14px",
    borderRadius: 999,
  },
  postDisabled: { background: "var(--color-divider-card)", color: "var(--color-text-tertiary)", cursor: "not-allowed" },
  resolveBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    border: "1px solid var(--color-border-card-soft)",
    background: "#FFFFFF",
    color: "var(--color-text-medium)",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    padding: "6px 12px",
    borderRadius: 999,
  },
  threadHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  threadMeta: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)" },
  iconBtn: { border: "none", background: "transparent", color: "var(--color-text-tertiary)", cursor: "pointer", display: "inline-flex", padding: 2 },
  threadText: { margin: 0, fontSize: 13, lineHeight: "19px", color: "var(--color-text-deep)", whiteSpace: "pre-wrap" },
  fab: {
    position: "fixed",
    left: 24,
    bottom: 24,
    zIndex: 9996,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 40,
    paddingInline: 16,
    borderRadius: 999,
    border: "1px solid var(--color-border-card-soft)",
    background: "#FFFFFF",
    color: "var(--color-text-medium)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 14px 34px -14px rgba(17,17,26,0.45)",
  },
  fabOn: { background: BLUE, color: "#FFFFFF", border: "1px solid transparent" },
  fabText: { letterSpacing: "0.01em" },
  badge: {
    minWidth: 18,
    height: 18,
    paddingInline: 5,
    borderRadius: 999,
    background: BLUE,
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeOn: { background: "#FFFFFF", color: BLUE },
  hint: {
    position: "fixed",
    left: 24,
    bottom: 72,
    zIndex: 9996,
    padding: "7px 12px",
    borderRadius: 8,
    background: "var(--color-text-deep)",
    color: "#FFFFFF",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 600,
    boxShadow: "0 12px 30px -12px rgba(17,17,26,0.5)",
  },
};
