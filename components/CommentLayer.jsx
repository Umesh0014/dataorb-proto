"use client";
/* eslint-disable no-restricted-syntax, react-hooks/set-state-in-effect --
   CommentLayer is review meta-tooling (a Figma-style comment overlay), not
   product chrome. Raw <button> + inline SVG are intentional so the file is a
   zero-dependency drop-in (React only); the mounted + localStorage hydration
   guard sets state on mount by design (client-only, avoids an SSR mismatch). */

import React from "react";
import { createPortal } from "react-dom";

// CommentLayer — a drop-in, Figma-style review overlay. ZERO dependencies
// beyond React (no router, no icon lib, no design tokens), so it pastes into
// any React/Next prototype. Mount it once at the app root. Toggle it on, then
// click anywhere to drop a numbered pin + comment bubble; the toggle shows how
// many open comments are on the current page. Pins anchor to document
// coordinates (scroll with content) and persist to localStorage, keyed per
// route. Meta-tooling for design review, not product chrome.
const STORE_KEY = "comment-layer-v1";
const BLUE = "#2563EB";
const INK = "#1A1A24";
const MUTED = "#6B6B78";
const BORDER = "#E6E6EC";
const DIVIDER = "#D9D9E0";

const stamp = () =>
  new Date().toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

// Framework-agnostic current-path hook: reads window.location.pathname and
// updates on browser nav + SPA pushState/replaceState (history patched once).
let historyPatched = false;
function patchHistory() {
  if (historyPatched || typeof window === "undefined") return;
  historyPatched = true;
  ["pushState", "replaceState"].forEach((m) => {
    const orig = window.history[m];
    window.history[m] = function patched(...args) {
      const r = orig.apply(this, args);
      window.dispatchEvent(new Event("locationchange"));
      return r;
    };
  });
}
function useLocationPath() {
  const [path, setPath] = React.useState(typeof window === "undefined" ? "/" : window.location.pathname);
  React.useEffect(() => {
    const update = () => setPath(window.location.pathname);
    patchHistory();
    window.addEventListener("popstate", update);
    window.addEventListener("locationchange", update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("locationchange", update);
    };
  }, []);
  return path;
}

function Svg({ size = 16, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}
const IconComment = ({ size }) => <Svg size={size}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Svg>;
const IconCheck = ({ size }) => <Svg size={size}><polyline points="20 6 9 17 4 12" /></Svg>;
const IconTrash = ({ size }) => (
  <Svg size={size}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Svg>
);
const IconX = ({ size }) => (
  <Svg size={size}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

export default function CommentLayer() {
  const path = useLocationPath();
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
        <IconComment size={17} />
        <span>{mode ? "Commenting" : "Comment"}</span>
        {visible.length > 0 && <span style={{ ...styles.badge, ...(mode ? styles.badgeOn : null) }}>{visible.length}</span>}
      </button>
      {mode && <div style={styles.hint}>Click anywhere to drop a comment · Esc to stop</div>}
      <EscClose active={mode} onEsc={() => setMode(false)} />
    </>
  );
}

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
          <IconX size={14} />
        </button>
      </div>
      <p style={styles.threadText}>{c.text}</p>
      <div style={styles.actions}>
        <button type="button" onClick={onDelete} style={styles.linkBtn}>
          <IconTrash size={13} /> Delete
        </button>
        <button type="button" onClick={onResolve} style={styles.resolveBtn}>
          <IconCheck size={13} /> Resolve
        </button>
      </div>
    </div>
  );
}

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
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
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    pointerEvents: "auto",
    boxShadow: "0 6px 16px -4px rgba(37,99,235,0.5)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pinActive: { background: INK, boxShadow: "0 8px 20px -4px rgba(17,17,26,0.5)" },
  bubble: {
    position: "absolute",
    transform: "translate(14px, -12px)",
    width: 268,
    pointerEvents: "auto",
    background: "#FFFFFF",
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    boxShadow: "0 18px 48px -16px rgba(17,17,26,0.4)",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    fontFamily: FONT,
  },
  textarea: {
    width: "100%",
    minHeight: 64,
    resize: "vertical",
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    padding: "8px 10px",
    fontFamily: FONT,
    fontSize: 13,
    color: INK,
    outline: "none",
    boxSizing: "border-box",
  },
  actions: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  linkBtn: { display: "inline-flex", alignItems: "center", gap: 5, border: "none", background: "transparent", color: MUTED, fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "6px 8px" },
  postBtn: { border: "none", background: BLUE, color: "#FFFFFF", fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "7px 14px", borderRadius: 999 },
  postDisabled: { background: DIVIDER, color: MUTED, cursor: "not-allowed" },
  resolveBtn: { display: "inline-flex", alignItems: "center", gap: 5, border: `1px solid ${BORDER}`, background: "#FFFFFF", color: INK, fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "6px 12px", borderRadius: 999 },
  threadHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  threadMeta: { fontSize: 11, fontWeight: 600, color: MUTED },
  iconBtn: { border: "none", background: "transparent", color: MUTED, cursor: "pointer", display: "inline-flex", padding: 2 },
  threadText: { margin: 0, fontSize: 13, lineHeight: "19px", color: INK, whiteSpace: "pre-wrap" },
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
    border: `1px solid ${BORDER}`,
    background: "#FFFFFF",
    color: INK,
    fontFamily: FONT,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 14px 34px -14px rgba(17,17,26,0.45)",
  },
  fabOn: { background: BLUE, color: "#FFFFFF", border: "1px solid transparent" },
  badge: { minWidth: 18, height: 18, paddingInline: 5, borderRadius: 999, background: BLUE, color: "#FFFFFF", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" },
  badgeOn: { background: "#FFFFFF", color: BLUE },
  hint: { position: "fixed", left: 24, bottom: 72, zIndex: 9996, padding: "7px 12px", borderRadius: 8, background: INK, color: "#FFFFFF", fontFamily: FONT, fontSize: 12, fontWeight: 600, boxShadow: "0 12px 30px -12px rgba(17,17,26,0.5)" },
};
