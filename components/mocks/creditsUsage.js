// creditsUsage.js — sample data for the Credits & Usage admin surface
// (3-variant design exploration). Team-level quota model per the Jun 11
// brief: credit is committed at the tenant level, quota is distributed
// per team, and cadence (day/week/month) is a per-team variable because
// tenured vs new agents consume very differently. All mock; no backend.

import { CREDITS_USAGE_SAMPLE } from "../SettingsPage";

export const TENANT_SAMPLE = {
  allocatedCap: CREDITS_USAGE_SAMPLE.poolMinutes, // 24,000 min committed
  additionalCap: 4000, // additional minutes allowed on top, also capped
  usedThisPeriod: CREDITS_USAGE_SAMPLE.consumedMTD, // 14,880 min
  activeAgents: 18,
  totalAgents: 22,
  periodLabel: "This month",
};

export const CADENCES = [
  { id: "day", label: "Per day", short: "/day" },
  { id: "week", label: "Per week", short: "/wk" },
  { id: "month", label: "Per month", short: "/mo" },
];

// Teams are inherited from the Contact Center side (same workspace/teams
// hierarchy). tenured vs new split drives why cadence/per-agent quota
// differ team to team.
export const TEAMS_SAMPLE = [
  { id: "onboarding", name: "Onboarding cohort", composition: "New", tenured: 0, newAgents: 6, cadence: "day", perAgent: 40, allocated: 6000, used: 4980 },
  { id: "billing", name: "Billing Support", composition: "Mixed", tenured: 2, newAgents: 3, cadence: "week", perAgent: 120, allocated: 5400, used: 3320 },
  { id: "tech", name: "Tech Support", composition: "Mixed", tenured: 3, newAgents: 2, cadence: "week", perAgent: 120, allocated: 5400, used: 2870 },
  { id: "sales", name: "Sales — Tenured", composition: "Tenured", tenured: 4, newAgents: 0, cadence: "month", perAgent: 480, allocated: 3200, used: 1910 },
  { id: "retention", name: "Retention", composition: "Mixed", tenured: 2, newAgents: 1, cadence: "month", perAgent: 600, allocated: 4000, used: 1800 },
];

export const TREND_DATA = [
  { label: "W1", value: 1200 },
  { label: "W2", value: 1800 },
  { label: "W3", value: 2100 },
  { label: "W4", value: 1950 },
  { label: "W5", value: 2400 },
];

// Per-agent overrides. team links each agent to a TEAMS_SAMPLE id so the
// override table can show which team default a custom limit departs from.
export const AGENTS_SAMPLE = [
  { id: 1, name: "Priya Sharma", email: "priya.sharma@eci.com", team: "billing", hasCustom: false, limit: 120 },
  { id: 2, name: "Rahul Verma", email: "rahul.verma@eci.com", team: "billing", hasCustom: true, limit: 200 },
  { id: 3, name: "Anita Desai", email: "anita.desai@eci.com", team: "tech", hasCustom: false, limit: 120 },
  { id: 4, name: "Vikram Patel", email: "vikram.patel@eci.com", team: "sales", hasCustom: true, limit: 600 },
  { id: 5, name: "Meera Joshi", email: "meera.joshi@eci.com", team: "onboarding", hasCustom: false, limit: 40 },
  { id: 6, name: "Arjun Nair", email: "arjun.nair@eci.com", team: "onboarding", hasCustom: false, limit: 40 },
  { id: 7, name: "Kavita Singh", email: "kavita.singh@eci.com", team: "tech", hasCustom: true, limit: 80 },
  { id: 8, name: "Deepak Gupta", email: "deepak.gupta@eci.com", team: "billing", hasCustom: false, limit: 120 },
  { id: 9, name: "Sneha Reddy", email: "sneha.reddy@eci.com", team: "retention", hasCustom: false, limit: 600 },
  { id: 10, name: "Karan Mehta", email: "karan.mehta@eci.com", team: "sales", hasCustom: true, limit: 720 },
  { id: 11, name: "Pooja Iyer", email: "pooja.iyer@eci.com", team: "onboarding", hasCustom: false, limit: 40 },
  { id: 12, name: "Sanjay Rao", email: "sanjay.rao@eci.com", team: "tech", hasCustom: false, limit: 120 },
  { id: 13, name: "Neha Kulkarni", email: "neha.kulkarni@eci.com", team: "billing", hasCustom: true, limit: 160 },
  { id: 14, name: "Amit Choudhary", email: "amit.choudhary@eci.com", team: "retention", hasCustom: false, limit: 600 },
  { id: 15, name: "Divya Menon", email: "divya.menon@eci.com", team: "onboarding", hasCustom: false, limit: 40 },
  { id: 16, name: "Rohit Saxena", email: "rohit.saxena@eci.com", team: "tech", hasCustom: true, limit: 90 },
  { id: 17, name: "Ananya Bose", email: "ananya.bose@eci.com", team: "billing", hasCustom: false, limit: 120 },
  { id: 18, name: "Manish Agarwal", email: "manish.agarwal@eci.com", team: "sales", hasCustom: false, limit: 480 },
  { id: 19, name: "Shreya Pillai", email: "shreya.pillai@eci.com", team: "retention", hasCustom: true, limit: 800 },
  { id: 20, name: "Gaurav Bhat", email: "gaurav.bhat@eci.com", team: "onboarding", hasCustom: false, limit: 40 },
  { id: 21, name: "Ritu Malhotra", email: "ritu.malhotra@eci.com", team: "tech", hasCustom: false, limit: 120 },
  { id: 22, name: "Varun Khanna", email: "varun.khanna@eci.com", team: "billing", hasCustom: true, limit: 140 },
];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
