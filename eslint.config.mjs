import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const sharedRules = {
  "max-lines": [
    "warn",
    { max: 600, skipBlankLines: true, skipComments: true },
  ],
  "max-lines-per-function": [
    "warn",
    { max: 200, skipBlankLines: true, skipComments: true, IIFEs: true },
  ],
  "no-restricted-syntax": [
    "error",
    {
      selector: "JSXOpeningElement[name.name='button']",
      message:
        "Use <Button variant='…'> from components/Button.jsx instead of raw <button>. See CONVENTIONS.md and CLAUDE.md.",
    },
    {
      selector:
        "Property[key.name='height'] > Literal[value='100vh']",
      message:
        "Layout containers must use min-height: 100vh, not height: 100vh. Element-level fixed-overlays are exceptions — keep but justify in a comment.",
    },
  ],
};

export default [
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: sharedRules,
  },
  // Canonical primitives that wrap raw <button> by design. Each is a
  // standard component with semantics other code consumes via props.
  {
    files: [
      "components/Button.jsx",
      "components/Toggle.jsx",
      "components/TabsRow.jsx",
      "components/StatCard.jsx",
    ],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  // SideNav internals predate the lint rules and are slated for a
  // separate audit. Demote react-hooks/refs to warn there.
  {
    files: ["components/SideNav/**"],
    rules: {
      "react-hooks/refs": "warn",
    },
  },
  // Sub-systems carrying legacy patterns. <button> remains in:
  //   - SideNav (separate brief)
  //   - InteractionsPage internal (separate composite pass)
  //   - In-card table tabs (Adherence, ContactReason, Performance) —
  //     migrate to <TabsRow> when those cards are next touched
  //   - NewRoleplayPage Dropdown trigger + PillGroup pill —
  //     promote to shared Dropdown / PillGroup primitives
  // Each kept as warn (visible in lint) instead of error so build passes.
  {
    files: [
      "components/SideNav/**",
      "components/InteractionsPage.jsx",
      "components/AdherenceCard.jsx",
      "components/ContactReasonCard.jsx",
      "components/PerformanceCard.jsx",
      "components/NewRoleplayPage.jsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "JSXOpeningElement[name.name='button']",
          message:
            "Migrate to <Button variant='…'> (or shared TabsRow / Dropdown / PillGroup) when this component is next touched.",
        },
      ],
    },
  },
];
