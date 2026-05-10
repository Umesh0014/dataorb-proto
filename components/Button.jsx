"use client";

import React from "react";

// Button — single primitive with four variants:
//
//   variant="primary"  Filled blue pill, white text, uppercase. Default
//                      CTA. Supports leadingIcon, fullWidth, disabled.
//   variant="text"     Transparent, medium-color text, no border. Used
//                      for Cancel / Previous / Pagination / View Sample.
//                      Pass uppercase=false for sentence-case copy.
//   variant="icon"     Square button with single icon child. Sizes
//                      "sm" 28px / "md" 32px / "lg" 36px (default 32).
//                      `bordered` adds a 1px outline (used for HeaderCard
//                      filter-button). Otherwise transparent ghost.
//   variant="ai"       Primary-color text + leading sparkle icon,
//                      uppercase. Signals AI-driven action (Skip and
//                      Generate with AI).
//
// All variants render a real <button>. Pass href to render <a> instead
// when a button-styled link is needed.
//
// Pagination buttons in tables (Adherence, Performance, ContactReason,
// SkillProficiency) currently use variant="text" + variant="icon".
// Promote a <Pagination> composite when a 3rd table appears.
export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  leadingIcon = null,
  trailingIcon = null,
  bordered = false,
  uppercase,
  disabled = false,
  type = "button",
  href,
  onClick,
  children,
  style,
  className,
  ...rest
}) {
  const upper = uppercase ?? (variant === "primary" || variant === "ai" || variant === "text");
  const baseStyle = buildStyle({ variant, size, fullWidth, bordered, disabled, upper });
  const finalStyle = { ...baseStyle, ...style };

  const content = (
    <>
      {variant === "ai" && <SparkleIcon />}
      {leadingIcon && <span style={iconWrap}>{leadingIcon}</span>}
      {variant === "icon" ? children : <span>{children}</span>}
      {trailingIcon && <span style={iconWrap}>{trailingIcon}</span>}
    </>
  );

  if (href) {
    return (
      <a href={href} style={finalStyle} className={className} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      style={finalStyle}
      className={className}
      {...rest}
    >
      {content}
    </button>
  );
}

function buildStyle({ variant, size, fullWidth, bordered, disabled, upper }) {
  const common = {
    fontFamily: '"Mulish", sans-serif',
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxSizing: "border-box",
    textTransform: upper ? "uppercase" : "none",
    letterSpacing: upper ? "0.06em" : "normal",
    textDecoration: "none",
  };

  if (variant === "primary") {
    return {
      ...common,
      width: fullWidth ? "100%" : undefined,
      height: 40,
      minWidth: 120,
      paddingInline: 24,
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 700,
      background: disabled
        ? "var(--color-divider-card)"
        : "var(--color-button-primary-bg)",
      color: disabled
        ? "var(--color-text-tertiary)"
        : "var(--color-button-primary-fg)",
    };
  }

  if (variant === "ai") {
    return {
      ...common,
      height: 32,
      paddingInline: 0,
      background: "transparent",
      color: disabled
        ? "var(--color-text-tertiary)"
        : "var(--color-button-primary-bg)",
      fontSize: 13,
      fontWeight: 700,
      flexShrink: 0,
    };
  }

  if (variant === "text") {
    return {
      ...common,
      height: 32,
      paddingInline: 0,
      background: "transparent",
      color: disabled
        ? "var(--color-text-tertiary)"
        : "var(--color-text-medium)",
      fontSize: 13,
      fontWeight: upper ? 700 : 500,
    };
  }

  if (variant === "icon") {
    const px = size === "sm" ? 28 : size === "lg" ? 36 : 32;
    return {
      ...common,
      width: px,
      height: px,
      minWidth: px,
      borderRadius: 8,
      paddingInline: 0,
      background: "transparent",
      border: bordered ? "1px solid var(--color-divider-card)" : "none",
      color: disabled
        ? "var(--color-text-tertiary)"
        : "var(--color-text-medium)",
    };
  }

  return common;
}

const iconWrap = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

function SparkleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={iconWrap}
    >
      <path
        d="M12 2.5l1.9 5.5 5.6.2-4.5 3.4 1.6 5.4L12 13.7l-4.6 3.3 1.6-5.4-4.5-3.4 5.6-.2L12 2.5z"
        fill="currentColor"
      />
    </svg>
  );
}
