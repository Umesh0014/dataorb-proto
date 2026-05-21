// Mock task dataset for the Ask Mira Pro Tasks page. A task is a single
// run of a skill (06-askmirapro.md: skill = template, task = execution).
// Generated deterministically so the table, tabs, and pagination have
// stable content across reloads. Replace with a real fetch once the
// Tasks backend lands.
import { SKILLS } from "./skills";

// People who run tasks.
const USERS = [
  { id: "u_1", name: "Alice Thompson" },
  { id: "u_2", name: "Marcus Lee" },
  { id: "u_3", name: "Priya Nair" },
  { id: "u_4", name: "Tod Blick" },
  { id: "u_5", name: "Sara Greene" },
  { id: "u_6", name: "Ravi Patel" },
  { id: "u_7", name: "Elena Cruz" },
  { id: "u_8", name: "Kenji Tanaka" },
  { id: "u_9", name: "Omar Haddad" },
  { id: "u_10", name: "Lena Fischer" },
];

// Deterministic 10-step status mix → completed 60, generating 45,
// failed 30, queued 15 across 150 tasks. The tab counts are derived from
// this distribution, never hard-coded.
const STATUS_CYCLE = [
  "completed", "generating", "completed", "failed", "queued",
  "completed", "generating", "failed", "completed", "generating",
];

// 32-char unambiguous alphabet (no I/O/0/1) for 6-char task ids.
const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// taskId — 6-char alphanumeric id, deterministic and collision-free per
// index (index → distinct 30-bit value → 6 base-32 digits).
function taskId(i) {
  let n = (i * 2654435761 + 12345) >>> 0;
  let out = "";
  for (let k = 0; k < 6; k += 1) {
    out += ID_ALPHABET[n % 32];
    n = Math.floor(n / 32);
  }
  return out;
}

function initialsOf(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const TASK_COUNT = 150;
const BASE_TIME = Date.UTC(2026, 4, 19, 10, 0, 0); // 2026-05-19 10:00 UTC

// TASKS — newest first (index 0 = most recent). Each entry is one run of
// a skill; `completedAt` is null until the task reaches a terminal state.
export const TASKS = Array.from({ length: TASK_COUNT }, (_, i) => {
  const skill = SKILLS[i % SKILLS.length];
  const user = USERS[i % USERS.length];
  const status = STATUS_CYCLE[i % STATUS_CYCLE.length];
  const created = BASE_TIME - i * 47 * 60 * 1000;
  const terminal = status === "completed" || status === "failed";
  return {
    id: taskId(i),
    skill: {
      id: skill.id,
      name: skill.name,
      category: skill.category,
      tint: skill.tint,
      iconName: skill.icon,
    },
    runBy: { id: user.id, name: user.name, initials: initialsOf(user.name) },
    status,
    createdAt: new Date(created).toISOString(),
    completedAt: terminal ? new Date(created + 6 * 60 * 1000).toISOString() : null,
  };
});
