"use client";

import React from "react";
import { AlertTriangle, AlertCircle, CheckCircle2, Info } from "lucide-react";
import Button from "./Button";

// Banner — tinted-background callout with leading icon + heading + body
// + optional trailing action buttons. Consolidates the per-state banners
// used in Missions: `AlertBanner` (active warning/danger), `SuccessBanner`
// (completed success/info with circular gauge), `SetupIncompleteBanner`,
// and `AlmostThereBanner` (draft sub-state banners).
//
// Props:
//   tone     "info" | "success" | "warning" | "danger" — drives bg / text colors + default icon
//   heading  string — required
//   body     string — required
//   leading  React node — overrides the tone-default icon (use to embed
//            a CircularProgress, custom icon, etc.)
//   actions  Array<{ label, onClick, variant }> — optional right-side
//            action group. `variant: "primary"` renders the primary button;
//            anything else uses Button's `text` variant.
//
// TODO: stories

const TONE_PALETTE = {
  info:    { bg: "var(--color-info-bg)",    accent: "var(--color-info)",    text: "var(--color-info-text)"    },
  success: { bg: "var(--color-success-bg)", accent: "var(--color-success)", text: "var(--color-success-text)" },
  warning: { bg: "var(--color-warning-bg)", accent: "var(--color-warning)", text: "var(--color-warning-text)" },
  danger:  { bg: "var(--color-error-bg)",   accent: "var(--color-error)",   text: "var(--color-error-text)"   },
};

const TONE_DEFAULT_ICON = {
  info:    Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger:  AlertTriangle,
};

export default function Banner({ tone = "info", heading, body, leading, actions }) {
  const palette = TONE_PALETTE[tone] || TONE_PALETTE.info;
  const DefaultIcon = TONE_DEFAULT_ICON[tone] || Info;
  const leadingNode = leading != null
    ? leading
    : <DefaultIcon size={20} color={palette.accent} style={{ flexShrink: 0 }} />;
  const hasActions = Array.isArray(actions) && actions.length > 0;

  return (
    <div style={{ ...wrapStyle, background: palette.bg, borderColor: palette.accent }}>
      <div style={contentStyle}>
        {leadingNode}
        <div style={{ minWidth: 0 }}>
          <p style={{ ...headingStyle, color: palette.accent }}>{heading}</p>
          <p style={{ ...bodyStyle,    color: palette.text   }}>{body}</p>
        </div>
      </div>
      {hasActions && (
        <div style={actionsStyle}>
          {actions.map((a) => (
            <Button
              key={a.label}
              variant={a.variant === "primary" ? "primary" : "text"}
              onClick={a.onClick}
              uppercase={false}
              style={a.variant === "primary" ? { height: 32, minWidth: 0, paddingInline: 16 } : { height: 32 }}
            >
              {a.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// Re-export the filled exclamation icon variant used by the draft
// incomplete state. Lucide ships `AlertCircle` outlined; we wrap it as
// a filled variant via an inline SVG so consumers don't reinvent it.
export function AlertCircleFilled({ size = 20, color = "var(--color-warning)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="10" fill={color} />
      <rect x="9" y="4.5" width="2" height="6.5" rx="1" fill="#FFFFFF" />
      <circle cx="10" cy="14" r="1.1" fill="#FFFFFF" />
    </svg>
  );
}

const wrapStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "16px 20px",
  borderRadius: 8,
  // 1px accent-color border on every Banner — separates the callout from
  // the lavender page canvas so the tinted fill can't blend into the
  // surface. Tone's accent token doubles as the border so no new hues
  // are introduced (system-wide tweak per Credits & Usage spec §4 #3).
  border: "1px solid",
  borderColor: "transparent",
  overflow: "hidden",
};
const contentStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flex: 1,
  minWidth: 0,
};
const headingStyle = {
  fontFamily: "var(--font-sans)",
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1.3,
  margin: 0,
};
const bodyStyle = {
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  fontWeight: 400,
  lineHeight: 1.5,
  margin: "2px 0 0",
};
const actionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexShrink: 0,
};
