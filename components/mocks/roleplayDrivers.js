// Mock Roleplay Drivers — single source for the Settings → Learning Hub
// → Roleplay Drivers list (Figma "In review - V2" Part F). 10 drivers
// available out of a 20-driver hard cap (DRIVER_CAP). createdBy values
// gate the card footer affordance:
//   "ai"          — empty cog (gear) icon, driver was authored by Ask
//                   Mira Pro
//   { initial:X } — circle avatar with the human author's initial
//
// archived=true cards render the "Archived" inline status chip and are
// filtered out by the default "Active" tab.

export const DRIVER_CAP = 20;

export const ROLEPLAY_DRIVERS = [
  {
    id: "lapsed-member-winback",
    name: "Lapsed Member Winback",
    description:
      "Outbound recovery of former socios who cancelled or lapsed via repeated impago",
    createdAt: "Mar 09, 2026",
    createdBy: "ai",
    archived: false,
  },
  {
    id: "contribution-upgrade",
    name: "Contribution Upgrade",
    description:
      "Outbound asks to existing socios to raise contribution amount or shift annual to monthly frequency.",
    createdAt: "Mar 09, 2026",
    createdBy: { initial: "C" },
    archived: false,
  },
  {
    id: "retention-and-cancellation",
    name: "Retention And Cancellation",
    description:
      "Baja, suspensión, and impago recovery — preserving membership before it ends.",
    createdAt: "Mar 09, 2026",
    createdBy: { initial: "C" },
    archived: false,
  },
  {
    id: "payment-and-banking-updates",
    name: "Payment And Banking Updates",
    description:
      "IBAN changes, frequency adjustments, and SEPA mandate maintenance outside cancellation context.",
    createdAt: "Mar 09, 2026",
    createdBy: "ai",
    archived: false,
  },
  {
    id: "tax-and-certificates",
    name: "Tax And Certificates",
    description:
      "Annual certificado de donación issuance and IRPF deduction queries.",
    createdAt: "Mar 09, 2026",
    createdBy: { initial: "C" },
    archived: false,
  },
  {
    id: "member-administration",
    name: "Member Administration",
    description:
      "Address, phone, email, name, communication preferences, and member card replacements.",
    createdAt: "Mar 09, 2026",
    createdBy: { initial: "C" },
    archived: false,
  },
  {
    id: "program-and-impact-information",
    name: "Program And Impact Information",
    description:
      "Program detail, partner NGO outcomes, and impact reporting requests.",
    createdAt: "Mar 09, 2026",
    createdBy: "ai",
    archived: false,
  },
  {
    id: "data-privacy-and-consent",
    name: "Data Privacy And Consent",
    description:
      "GDPR access, rectification, deletion, and consent management for members.",
    createdAt: "Mar 09, 2026",
    createdBy: { initial: "C" },
    archived: false,
  },
  {
    id: "welcome-onboarding",
    name: "Welcome Onboarding",
    description:
      "First-90-day welcome cadence for newly enrolled socios — orientation and engagement.",
    createdAt: "Mar 09, 2026",
    createdBy: "ai",
    archived: false,
  },
  {
    id: "cancellation-save",
    name: "Cancellation Save",
    description:
      "Inbound save attempts for socios actively requesting to cancel their membership.",
    createdAt: "Mar 09, 2026",
    createdBy: { initial: "C" },
    archived: false,
  },
];

// AFFECTED_AREAS — static demo list rendered inside the Archive confirm
// modal body. Real impl pulls per-driver dependencies; for now the same
// three areas appear for every driver.
export const AFFECTED_AREAS = [
  "Roleplay missions",
  "Coaching briefs",
  "Tasks",
];
