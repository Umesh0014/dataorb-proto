"use client";

// Card.jsx — Product-level card primitive.
//
// Props:
//   padX, padY  Inline padding (default 28 / 24).
//   shadow      Boolean — adds the standard product shadow (used by
//               DrillCard list tiles). Off by default.
//   tone        Surface treatment:
//                 "default" (white #FFFFFF, 12px radius — standard card)
//                 "muted"   (tinted bg --color-card-emoji-bg, 8px radius
//                            — used for nested info / bullet panels)
//                 "outline" (white surface, 1px divider border, 8px
//                            radius — used for bordered side panels)
//   style       Escape hatch for one-off layout overrides.

const TONES = {
  default: {
    background: "#FFFFFF",
    borderRadius: 12,
    border: "none",
  },
  muted: {
    background: "var(--color-card-emoji-bg)",
    borderRadius: 8,
    border: "none",
  },
  outline: {
    background: "#FFFFFF",
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
  },
};

export default function Card({
  children,
  style,
  padX = 28,
  padY = 24,
  shadow = false,
  tone = "default",
}) {
  const toneStyle = TONES[tone] || TONES.default;
  return (
    <div
      style={{
        ...toneStyle,
        padding: `${padY}px ${padX}px`,
        boxSizing: "border-box",
        boxShadow: shadow ? "var(--shadow-card)" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
