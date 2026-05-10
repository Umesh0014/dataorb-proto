/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "icon-tertiary-bg": "var(--color-icon-tertiary-bg)",
        "icon-tertiary-fg": "var(--color-icon-tertiary-fg)",
        "surface-header-tinted": "var(--color-surface-header-tinted)",
        "border-tab": "var(--color-border-tab)",
        "tab-inactive": "var(--color-text-tab-inactive)",
        "tab-active": "var(--color-text-tab-active)",
        "card-emoji-bg": "var(--color-card-emoji-bg)",
        "divider-card": "var(--color-divider-card)",
        "chip-bg": "var(--color-chip-bg)",
        "chip-text": "var(--color-chip-text)",
        "button-primary-bg": "var(--color-button-primary-bg)",
        "button-primary-fg": "var(--color-button-primary-fg)",
        "text-deep": "var(--color-text-deep)",
        "text-medium": "var(--color-text-medium)",
        "text-tertiary": "var(--color-text-tertiary)",
        "text-placeholder": "var(--color-text-placeholder)",
      },
      fontFamily: {
        sans: ['"Mulish"', '"Inter"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
