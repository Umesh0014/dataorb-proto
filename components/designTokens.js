// designTokens.js — DataOrb 2.0 Design System tokens (source of truth).
//
// Extracted from the "2.0 Design System" Figma file (f8tlkFkbmivXT1lKP92B2j),
// FOUNDATION → Fonts / Colors / Shadows. The CURRENT type ramp is Poppins
// (the Mulish "M3 (OLD)" set is archived). Charts use Lato. Prefer importing
// these tokens over hardcoding values so every component stays on-spec.
//
// NOTE: the running app's global --font-sans is still Mulish (legacy M3). The
// KPI / sidecar surfaces follow the 2.0 system (Poppins) per design direction.

export const FONT = "'Poppins', sans-serif";        // all UI text (2.0 ramp)
export const CHART_FONT = "'Lato', sans-serif";     // tiny chart/axis labels
export const MONO = "var(--font-mono)";             // interaction IDs

// Type ramp — { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing }.
const t = (size, weight, lh, ls = 0, family = FONT) => ({
  fontFamily: family, fontSize: size, fontWeight: weight, lineHeight: `${lh}px`, letterSpacing: `${ls}px`,
});
export const TYPE = {
  displayLarge:  t(24, 600, 36),
  displayMedium: t(22, 600, 34),
  displaySmall:  t(20, 600, 30),
  headlineLarge: t(20, 500, 30),
  headlineMedium:t(18, 600, 28),
  headlineSmall: t(18, 500, 28),
  titleLarge:    t(16, 600, 24),        // section/panel titles
  titleMedium:   t(16, 500, 24, 0.1),   // card titles (matches app sectionTitle)
  titleSmall:    t(14, 600, 22, 0.1),
  labelLarge:    t(14, 500, 22, 0.1),
  labelMedium:   t(12, 600, 18, 0.5),
  labelSmall:    t(11, 600, 18, 0.5),   // uppercase eyebrows
  bodyLarge:     t(16, 400, 24, 0.5),
  bodyMedium:    t(14, 400, 22, 0.25),
  bodySmall:     t(12, 400, 18, 0.4),   // subtitles / help
  chartXSmall:   t(11, 400, 14, 0.4, CHART_FONT),
};

// Colors (System palette).
export const COLORS = {
  primary: "#004BEF", primary20: "#002583", primary90: "#DDE1FF", primary95: "#EFEFFF", primary99: "#FEFBFF",
  onPrimary: "#FFFFFF", onPrimaryContainer: "#001453",
  tertiary: "#6650A5", tertiaryContainer: "#DDE1FF",
  // Secondary = the text ramp.
  textTitle: "#171B2C",   // secondary10 / headings
  textBody: "#2C2F42",    // secondary20 / values
  textMedium: "#5A5D72",  // secondary40 / body-medium
  textLight: "#72768B",   // secondary50
  textFaint: "#8C90A6",   // secondary60 / placeholders
  secondaryContainer: "#DEE1F9",
  success: "#00CE34", successText: "#00711D", successBg: "#F0FDF4",
  error: "#BA1A1A", errorBg: "#FFF5F9",
  surface: "#FCFBFF",     // tinted card surface (summary cards)
  panel: "#FFFFFF", white: "#FFFFFF", black: "#000000",
  divider: "#EEF1F8",
};

// Shadows (Effect tokens → CSS box-shadow).
export const SHADOWS = {
  card:  "0 10px 30px rgba(16,24,40,0.04)",                          // Card 200
  z100:  "0 1px 1px rgba(69,70,79,0.15), 0 0 1px rgba(69,70,79,0.25)",
  z200:  "0 2px 4px rgba(69,70,79,0.15), 0 0 1px rgba(69,70,79,0.25)",
  z300:  "0 8px 16px rgba(69,70,79,0.15), 0 0 1px rgba(69,70,79,0.25)",
  sm:    "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)",
  md:    "0 2px 4px -2px rgba(16,24,40,0.06), 0 4px 8px -2px rgba(16,24,40,0.10)",
  lg:    "0 4px 6px -2px rgba(16,24,40,0.03), 0 12px 16px -4px rgba(16,24,40,0.08)",
};

export const RADIUS = { sm: 6, md: 8, lg: 12, xl: 16, pill: 999 };
