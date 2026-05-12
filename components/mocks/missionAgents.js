// Mission Agents fixture — roster for the Recruit step (step 4) of
// the Create Mission wizard. Each agent has a team, active-mission
// count (max 3), last-active date, and a QA score (0-100).

export const AGENTS = [
  { id: "ag-malik",    name: "Malik Jones",      team: "Sales",              missions: 1, lastActive: "2026-03-31", qaScore: 95 },
  { id: "ag-ingrid",   name: "Ingrid Baum",      team: "Call Channel",       missions: 1, lastActive: "2026-03-31", qaScore: 92 },
  { id: "ag-priya",    name: "Priya Patel",       team: "Customer Success",   missions: 1, lastActive: "2026-03-30", qaScore: 88 },
  { id: "ag-kenji",    name: "Kenji Tanaka",      team: "Chat Channel",       missions: 2, lastActive: "2026-03-29", qaScore: 76 },
  { id: "ag-omar",     name: "Omar Hassan",       team: "Customer Support",   missions: 2, lastActive: "2026-03-29", qaScore: 72 },
  { id: "ag-nia",      name: "Nia Sharma",        team: "Customer Outreach",  missions: 2, lastActive: "2026-03-29", qaScore: 68 },
  { id: "ag-anya",     name: "Anya Petrova",      team: "Billing",            missions: 3, lastActive: "2026-03-28", qaScore: 63 },
  { id: "ag-lucas",    name: "Lucas Chen",        team: "Sales",              missions: 0, lastActive: "2026-03-27", qaScore: 91 },
  { id: "ag-fatima",   name: "Fatima Al-Rashid",  team: "Customer Success",   missions: 1, lastActive: "2026-03-27", qaScore: 85 },
  { id: "ag-derek",    name: "Derek Williams",    team: "Call Channel",       missions: 0, lastActive: "2026-03-26", qaScore: 79 },
  { id: "ag-sofia",    name: "Sofia Martinez",    team: "Chat Channel",       missions: 1, lastActive: "2026-03-26", qaScore: 74 },
  { id: "ag-raj",      name: "Raj Gupta",         team: "Billing",            missions: 2, lastActive: "2026-03-25", qaScore: 82 },
  { id: "ag-elena",    name: "Elena Volkov",      team: "Customer Outreach",  missions: 3, lastActive: "2026-03-25", qaScore: 58 },
  { id: "ag-james",    name: "James O'Brien",     team: "Customer Support",   missions: 0, lastActive: "2026-03-24", qaScore: 93 },
  { id: "ag-mei",      name: "Mei Lin",           team: "Sales",              missions: 1, lastActive: "2026-03-24", qaScore: 70 },
  { id: "ag-carlos",   name: "Carlos Rivera",     team: "Call Channel",       missions: 2, lastActive: "2026-03-23", qaScore: 66 },
  { id: "ag-aisha",    name: "Aisha Mensah",      team: "Customer Success",   missions: 0, lastActive: "2026-03-23", qaScore: 97 },
  { id: "ag-tom",      name: "Tom Kowalski",      team: "Chat Channel",       missions: 3, lastActive: "2026-03-22", qaScore: 61 },
  { id: "ag-lena",     name: "Lena Fischer",      team: "Billing",            missions: 1, lastActive: "2026-03-22", qaScore: 84 },
  { id: "ag-david",    name: "David Nakamura",    team: "Customer Outreach",  missions: 0, lastActive: "2026-03-21", qaScore: 90 },
  { id: "ag-sarah",    name: "Sarah Thompson",    team: "Customer Support",   missions: 1, lastActive: "2026-03-21", qaScore: 77 },
  { id: "ag-yusuf",    name: "Yusuf Diallo",      team: "Sales",              missions: 2, lastActive: "2026-03-20", qaScore: 55 },
  { id: "ag-clara",    name: "Clara Johansson",   team: "Call Channel",       missions: 0, lastActive: "2026-03-20", qaScore: 86 },
  { id: "ag-ravi",     name: "Ravi Krishnan",     team: "Chat Channel",       missions: 3, lastActive: "2026-03-19", qaScore: 64 },
  { id: "ag-hannah",   name: "Hannah Park",       team: "Customer Success",   missions: 1, lastActive: "2026-03-19", qaScore: 81 },
];

export const MISSION_CAP = 3;

export const TEAMS = [...new Set(AGENTS.map((a) => a.team))].sort();
