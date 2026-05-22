// formatDate — single source of truth for every date string in DataOrb.
//
// Canonical formats:
//   formatDate      → "Mar 23, 2026"
//   formatDateRange → "Mar 23 – Apr 1, 2026" (same year, en-dash, year once)
//                     "Dec 28, 2025 – Jan 4, 2026" (cross-year, year both sides)
//   formatDateTime  → "Mar 23, 2026, 3:45 PM"
//
// All date components read in UTC (getUTCFullYear / getUTCMonth / getUTCDate)
// so midnight-boundary off-by-ones can't drift between callers. Wire format
// stays ISO (YYYY-MM-DD) everywhere — these helpers are display-only.
//
// Null / missing → "—" (em-dash). Invalid ISO → "—" + console.warn (no throw).

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const EM_DASH = "—"; // —  (null / invalid fallback)
const EN_DASH = "–"; // –  (range separator)

/**
 * Format a single date.
 * @param {string|Date|number} input ISO string, Date, or epoch ms.
 * @returns {string} e.g. "Mar 23, 2026" or "—" if invalid.
 */
export function formatDate(input) {
  const d = toUtcDate(input);
  if (!d) return EM_DASH;
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/**
 * Format a date range.
 * @param {string|Date|number} start
 * @param {string|Date|number} end
 * @returns {string} e.g. "Mar 23 – Apr 1, 2026" or "Dec 28, 2025 – Jan 4, 2026".
 */
export function formatDateRange(start, end) {
  const s = toUtcDate(start);
  const e = toUtcDate(end);
  if (!s || !e) return EM_DASH;
  const sYear = s.getUTCFullYear();
  const eYear = e.getUTCFullYear();
  const sStr = `${MONTHS_SHORT[s.getUTCMonth()]} ${s.getUTCDate()}`;
  const eStr = `${MONTHS_SHORT[e.getUTCMonth()]} ${e.getUTCDate()}, ${eYear}`;
  if (sYear === eYear) {
    return `${sStr} ${EN_DASH} ${eStr}`;
  }
  return `${sStr}, ${sYear} ${EN_DASH} ${eStr}`;
}

/**
 * Format a datetime — canonical date, then 12-hour time.
 * @param {string|Date|number} input
 * @returns {string} e.g. "Mar 23, 2026, 3:45 PM" or "—" if invalid.
 */
export function formatDateTime(input) {
  const d = toUtcDate(input);
  if (!d) return EM_DASH;
  const date = formatDate(d);
  let h = d.getUTCHours();
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${date}, ${h}:${min} ${ampm}`;
}

// Accept ISO date strings, ISO datetimes, Date instances, and epoch ms.
// Returns a Date for component access (UTC) or null on invalid input.
function toUtcDate(input) {
  if (input == null) return null;
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }
  if (typeof input === "number") {
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof input === "string") {
    // Date-only ISO ("2026-03-23"): parse as UTC midnight.
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      const [y, m, day] = input.split("-").map(Number);
      const d = new Date(Date.UTC(y, m - 1, day));
      return Number.isNaN(d.getTime()) ? null : d;
    }
    // Full ISO datetime — Date parses it directly.
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) {
      if (typeof console !== "undefined") {
        console.warn(`formatDate: unparseable date input "${input}"`);
      }
      return null;
    }
    return d;
  }
  return null;
}

export { MONTHS_SHORT };
