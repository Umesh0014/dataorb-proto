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
const IconList = ({ size }) => (
  <Svg size={size}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </Svg>
);

export default function CommentLayer() {
  const path = useLocationPath();
  const [mounted, setMounted] = React.useState(false);
  const [comments, setComments] = React.useState([]);
  const [mode, setMode] = React.useState(false);
  const [draft, setDraft] = React.useState(null); // finalized selection { x, y, w, h }
  const [drag, setDrag] = React.useState(null); // live marquee while dragging { x0, y0, x1, y1 }
  const [openId, setOpenId] = React.useState(null);
  const [text, setText] = React.useState("");
  const [panelOpen, setPanelOpen] = React.useState(false);

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

  // Drag to draw a selection rectangle (marquee shows live); a tiny drag is
  // treated as a click → a point comment. Document coords so it scrolls along.
  const startDrag = (e) => {
    e.preventDefault();
    const x0 = e.clientX + window.scrollX;
    const y0 = e.clientY + window.scrollY;
    setOpenId(null);
    setDraft(null);
    setDrag({ x0, y0, x1: x0, y1: y0 });
    const onMove = (ev) => setDrag({ x0, y0, x1: ev.clientX + window.scrollX, y1: ev.clientY + window.scrollY });
    const onUp = (ev) => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      const x1 = ev.clientX + window.scrollX;
      const y1 = ev.clientY + window.scrollY;
      const w = Math.abs(x1 - x0);
      const h = Math.abs(y1 - y0);
      setDrag(null);
      setDraft(w < 6 && h < 6 ? { x: x0, y: y0, w: 0, h: 0 } : { x: Math.min(x0, x1), y: Math.min(y0, y1), w, h });
      setText("");
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  const post = () => {
    const t = text.trim();
    if (!t || !draft) return;
    setComments((cs) => [...cs, { id: `c-${cs.length}-${Math.round(draft.x)}x${Math.round(draft.y)}`, path, x: draft.x, y: draft.y, w: draft.w, h: draft.h, text: t, createdAt: stamp(), resolved: false }]);
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
  const jump = (c) => {
    setOpenId(c.id);
    window.scrollTo({ top: Math.max(0, c.y - 140), behavior: "smooth" });
  };
  const open = onPage.find((c) => c.id === openId) || null;

  return (
    <>
      {mode && <div style={styles.capture} onMouseDown={startDrag} aria-hidden="true" />}

      {createPortal(
        <div style={styles.pinLayer}>
          {mode && visible.map((c, i) => (
            <React.Fragment key={c.id}>
              {c.w > 0 && c.h > 0 && <Area x={c.x} y={c.y} w={c.w} h={c.h} active={openId === c.id} />}
              <Pin
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
            </React.Fragment>
          ))}
          {drag && <Marquee drag={drag} />}
          {draft && draft.w > 0 && draft.h > 0 && <Area x={draft.x} y={draft.y} w={draft.w} h={draft.h} draft />}
          {draft && (
            <span style={{ ...styles.draftPin, left: draft.x, top: draft.y }} aria-hidden="true">
              <span style={styles.draftRing} />
            </span>
          )}
          {open && <Thread c={open} onClose={() => setOpenId(null)} onResolve={() => toggleResolve(open.id)} onDelete={() => remove(open.id)} />}
          {draft && <Composer x={draft.x} y={draft.y} text={text} onText={setText} onPost={post} onCancel={() => setDraft(null)} />}
        </div>,
        document.body,
      )}

      {mode && (
        <div style={styles.modeBar}>
          <span style={styles.modeDot} />
          <span>Comment mode — drag to select an area, or click a spot</span>
          <button type="button" onClick={() => setMode(false)} style={styles.exitBtn}>Exit · Esc</button>
        </div>
      )}

      <div style={styles.dock}>
        <button
          type="button"
          onClick={() => {
            setMode((m) => !m);
            setDraft(null);
            setOpenId(null);
            setPanelOpen(false);
          }}
          aria-pressed={mode}
          aria-label="Toggle comment mode"
          style={{ ...styles.fab, ...(mode ? styles.fabActive : null) }}
        >
          <span style={{ ...styles.track, ...(mode ? styles.trackOn : null) }}>
            <span style={{ ...styles.knob, ...(mode ? styles.knobOn : null) }} />
          </span>
          <IconComment size={16} />
          <span>Comments</span>
          {visible.length > 0 && <span style={styles.badge}>{visible.length}</span>}
        </button>
        {mode && (
          <button type="button" onClick={() => setPanelOpen((o) => !o)} aria-pressed={panelOpen} style={{ ...styles.notesBtn, ...(panelOpen ? styles.notesBtnOn : null) }}>
            <IconList size={15} />
            <span>Notes</span>
          </button>
        )}
      </div>

      {mode &&
        panelOpen &&
        createPortal(
          <SidePanel comments={visible} onClose={() => setPanelOpen(false)} onJump={jump} onResolve={toggleResolve} onDelete={remove} />,
          document.body,
        )}

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

// The selection rectangle: a saved comment's area, the in-progress draft, or
// the live marquee while dragging. Purely visual (pointer-events none) so it
// never blocks a new drag started over it.
function Area({ x, y, w, h, active = false, draft = false }) {
  const tone = draft ? styles.areaDraft : active ? styles.areaActive : styles.areaSaved;
  return <div style={{ ...styles.area, ...tone, left: x, top: y, width: w, height: h }} aria-hidden="true" />;
}

function Marquee({ drag }) {
  return (
    <div
      style={{ ...styles.area, ...styles.areaMarquee, left: Math.min(drag.x0, drag.x1), top: Math.min(drag.y0, drag.y1), width: Math.abs(drag.x1 - drag.x0), height: Math.abs(drag.y1 - drag.y0) }}
      aria-hidden="true"
    />
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

// Side panel listing every open comment on the page; clicking one scrolls to
// and opens it. Rendered as a fixed overlay drawer so it never reflows the app.
function SidePanel({ comments, onClose, onJump, onResolve, onDelete }) {
  return (
    <div style={styles.panel} role="dialog" aria-label="Comments">
      <div style={styles.panelHead}>
        <span style={styles.panelTitle}>
          Comments<span style={styles.panelCount}>{comments.length}</span>
        </span>
        <button type="button" onClick={onClose} style={styles.iconBtn} aria-label="Close notes">
          <IconX size={16} />
        </button>
      </div>
      <div style={styles.panelList}>
        {comments.length === 0 && <p style={styles.panelEmpty}>No comments on this page yet. Drag to select an area and add one.</p>}
        {comments.map((c, i) => (
          <div key={c.id} style={styles.note}>
            <button type="button" onClick={() => onJump(c)} style={styles.noteMain}>
              <span style={styles.noteNum}>{i + 1}</span>
              <span style={styles.noteBody}>
                <span style={styles.noteText}>{c.text}</span>
                <span style={styles.noteMeta}>{c.createdAt}</span>
              </span>
            </button>
            <div style={styles.noteActions}>
              <button type="button" onClick={() => onResolve(c.id)} style={styles.iconBtn} aria-label="Resolve">
                <IconCheck size={14} />
              </button>
              <button type="button" onClick={() => onDelete(c.id)} style={styles.iconBtn} aria-label="Delete">
                <IconTrash size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const styles = {
  capture: { position: "fixed", inset: 0, zIndex: 9980, cursor: "crosshair", background: "rgba(37,99,235,0.05)", userSelect: "none" },
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
  dock: { position: "fixed", left: 24, bottom: 24, zIndex: 9996, display: "flex", alignItems: "center", gap: 8 },
  fab: {
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
  fabActive: { borderColor: BLUE, boxShadow: "0 0 0 3px rgba(37,99,235,0.18), 0 14px 34px -14px rgba(17,17,26,0.45)" },
  notesBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    height: 40,
    paddingInline: 14,
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
  notesBtnOn: { background: INK, color: "#FFFFFF", border: "1px solid transparent" },
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    height: "100%",
    width: 320,
    zIndex: 9997,
    background: "#FFFFFF",
    borderLeft: `1px solid ${BORDER}`,
    boxShadow: "-18px 0 48px -24px rgba(17,17,26,0.4)",
    display: "flex",
    flexDirection: "column",
    fontFamily: FONT,
  },
  panelHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 14px 12px 18px", borderBottom: `1px solid ${BORDER}` },
  panelTitle: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800, color: INK },
  panelCount: { minWidth: 20, height: 20, paddingInline: 6, borderRadius: 999, background: BLUE, color: "#FFFFFF", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" },
  panelList: { flex: 1, overflowY: "auto", padding: 8 },
  panelEmpty: { margin: 0, padding: "24px 12px", fontSize: 13, color: MUTED, lineHeight: "19px" },
  note: { display: "flex", alignItems: "flex-start", gap: 4, padding: 2, borderRadius: 10 },
  noteMain: { flex: 1, minWidth: 0, display: "flex", alignItems: "flex-start", gap: 10, border: "none", background: "transparent", cursor: "pointer", textAlign: "left", padding: 8, borderRadius: 8, fontFamily: FONT },
  noteNum: { flexShrink: 0, width: 22, height: 22, borderRadius: "50% 50% 50% 2px", background: BLUE, color: "#FFFFFF", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" },
  noteBody: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  noteText: { fontSize: 13, color: INK, lineHeight: "18px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" },
  noteMeta: { fontSize: 11, fontWeight: 600, color: MUTED },
  noteActions: { display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 },
  track: { width: 32, height: 18, borderRadius: 999, background: DIVIDER, position: "relative", flexShrink: 0, transition: "background 120ms ease" },
  trackOn: { background: BLUE },
  knob: { position: "absolute", top: 2, left: 2, width: 14, height: 14, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 1px 2px rgba(0,0,0,0.35)", transition: "left 120ms ease" },
  knobOn: { left: 16 },
  badge: { minWidth: 18, height: 18, paddingInline: 5, borderRadius: 999, background: BLUE, color: "#FFFFFF", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" },
  modeBar: {
    position: "fixed",
    top: 16,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9996,
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    height: 40,
    padding: "0 8px 0 16px",
    borderRadius: 999,
    background: INK,
    color: "#FFFFFF",
    fontFamily: FONT,
    fontSize: 13,
    fontWeight: 600,
    boxShadow: "0 16px 38px -12px rgba(17,17,26,0.55)",
  },
  modeDot: { width: 8, height: 8, borderRadius: "50%", background: "#37D67A", boxShadow: "0 0 0 4px rgba(55,214,122,0.25)", flexShrink: 0 },
  exitBtn: { border: "none", background: "rgba(255,255,255,0.16)", color: "#FFFFFF", fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "7px 14px", borderRadius: 999 },
  draftPin: {
    position: "absolute",
    transform: "translate(-50%, -100%)",
    width: 28,
    height: 28,
    borderRadius: "50% 50% 50% 2px",
    border: "2px solid #FFFFFF",
    background: BLUE,
    boxShadow: "0 6px 16px -4px rgba(37,99,235,0.6)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  draftRing: { width: 8, height: 8, borderRadius: "50%", background: "#FFFFFF" },
  area: { position: "absolute", pointerEvents: "none", borderRadius: 4, boxSizing: "border-box" },
  areaSaved: { border: `2px solid ${BLUE}`, background: "rgba(37,99,235,0.07)" },
  areaActive: { border: `2px solid ${INK}`, background: "rgba(37,99,235,0.10)" },
  areaDraft: { border: `2px solid ${BLUE}`, background: "rgba(37,99,235,0.10)" },
  areaMarquee: { border: `2px dashed ${BLUE}`, background: "rgba(37,99,235,0.10)" },
};
