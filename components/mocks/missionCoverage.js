// Mission Coverage fixtures — drivers + contact-reasons catalogue.
//
// Drivers are the high-level business areas an agent can be coached on.
// Contact reasons are the granular call/chat topics within a mission.
// In the prototype these come from a fixture file; later the real
// catalogue will be fetched from the platform.

export const COVERAGE_DRIVERS = [
  { id: "billing",   label: "Billing and payment" },
  { id: "retention", label: "Retention and Churn" },
  { id: "digital",   label: "Digital Support" },
  { id: "utility",   label: "Utility Services" },
  { id: "sales",     label: "Sales and Acquisition" },
  { id: "technical", label: "Technical Support" },
  { id: "delivery",  label: "Logistics and Delivery" },
];

// 49 reasons total — first 11 mirror the design reference, remaining
// 38 are plausible telco/utility/customer-service fillers so the
// "Contact Reasons (49)" counter in the side panel is real.
export const CONTACT_REASONS = [
  { id: "cr-001", label: "Request Payment Extension" },
  { id: "cr-002", label: "Resolve Billing Discrepancy" },
  { id: "cr-003", label: "Inquire About Billing Charge" },
  { id: "cr-004", label: "Cancel Mobile and Internet" },
  { id: "cr-005", label: "Lower Monthly Bill" },
  { id: "cr-006", label: "Cancel a Phone Line" },
  { id: "cr-007", label: "Resolve Digital Signature Issue" },
  { id: "cr-008", label: "Portal Login Assistance" },
  { id: "cr-009", label: "Inquire About Electricity Service" },
  { id: "cr-010", label: "New Connection Inquiry" },
  { id: "cr-011", label: "Check Data Usage" },
  { id: "cr-012", label: "Update Payment Method" },
  { id: "cr-013", label: "Dispute Late Fee" },
  { id: "cr-014", label: "Activate New SIM" },
  { id: "cr-015", label: "Port In Existing Number" },
  { id: "cr-016", label: "Port Out Existing Number" },
  { id: "cr-017", label: "Renew Service Plan" },
  { id: "cr-018", label: "Upgrade Service Plan" },
  { id: "cr-019", label: "Downgrade Service Plan" },
  { id: "cr-020", label: "International Roaming Setup" },
  { id: "cr-021", label: "Report Network Outage" },
  { id: "cr-022", label: "Schedule Technician Visit" },
  { id: "cr-023", label: "Track Service Order" },
  { id: "cr-024", label: "Reset Account Password" },
  { id: "cr-025", label: "Update Contact Information" },
  { id: "cr-026", label: "Add Authorized User" },
  { id: "cr-027", label: "Remove Authorized User" },
  { id: "cr-028", label: "Reactivate Suspended Service" },
  { id: "cr-029", label: "Pause Service Temporarily" },
  { id: "cr-030", label: "Refund Request" },
  { id: "cr-031", label: "Equipment Return" },
  { id: "cr-032", label: "Replace Damaged Device" },
  { id: "cr-033", label: "Track Replacement Shipment" },
  { id: "cr-034", label: "Inquire About Loyalty Rewards" },
  { id: "cr-035", label: "Redeem Promo Code" },
  { id: "cr-036", label: "Apply Discount or Offer" },
  { id: "cr-037", label: "Modify Auto-Pay" },
  { id: "cr-038", label: "Set Up Paperless Billing" },
  { id: "cr-039", label: "Update Billing Address" },
  { id: "cr-040", label: "Request Itemized Invoice" },
  { id: "cr-041", label: "Service Speed Complaint" },
  { id: "cr-042", label: "Coverage Map Question" },
  { id: "cr-043", label: "Suspected Fraud on Account" },
  { id: "cr-044", label: "Account Closure Request" },
  { id: "cr-045", label: "Bundle and Save Inquiry" },
  { id: "cr-046", label: "Transfer Service to New Address" },
  { id: "cr-047", label: "Business Account Setup" },
  { id: "cr-048", label: "Family Plan Adjustment" },
  { id: "cr-049", label: "Smart Home Add-On" },
];
