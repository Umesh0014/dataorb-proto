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

// Localized short month names + meridiem markers. en is the default; other
// locales are provided so date strings convert with the GUI language
// (ticket: multilingual + RTL/Arabic). Day/year numerals stay Western to
// match the rest of the app under Arabic.
const MONTHS_BY_LOCALE = {
  en: MONTHS_SHORT,
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  de: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
  fr: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
};

const MERIDIEM = {
  en: { am: "AM", pm: "PM" },
  es: { am: "a. m.", pm: "p. m." },
  de: { am: "AM", pm: "PM" },
  fr: { am: "AM", pm: "PM" },
  ar: { am: "ص", pm: "م" },
};

function months(locale) {
  return MONTHS_BY_LOCALE[locale] || MONTHS_SHORT;
}

const EM_DASH = "—"; // —  (null / invalid fallback)
const EN_DASH = "–"; // –  (range separator)

/**
 * Format a single date.
 * @param {string|Date|number} input ISO string, Date, or epoch ms.
 * @param {string} [locale="en"] GUI locale for month names.
 * @returns {string} e.g. "Mar 23, 2026" or "—" if invalid.
 */
export function formatDate(input, locale = "en") {
  const d = toUtcDate(input);
  if (!d) return EM_DASH;
  return `${months(locale)[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/**
 * Format a date range.
 * @param {string|Date|number} start
 * @param {string|Date|number} end
 * @param {string} [locale="en"]
 * @returns {string} e.g. "Mar 23 – Apr 1, 2026" or "Dec 28, 2025 – Jan 4, 2026".
 */
export function formatDateRange(start, end, locale = "en") {
  const s = toUtcDate(start);
  const e = toUtcDate(end);
  if (!s || !e) return EM_DASH;
  const M = months(locale);
  const sYear = s.getUTCFullYear();
  const eYear = e.getUTCFullYear();
  const sStr = `${M[s.getUTCMonth()]} ${s.getUTCDate()}`;
  const eStr = `${M[e.getUTCMonth()]} ${e.getUTCDate()}, ${eYear}`;
  if (sYear === eYear) {
    return `${sStr} ${EN_DASH} ${eStr}`;
  }
  return `${sStr}, ${sYear} ${EN_DASH} ${eStr}`;
}

/**
 * Format a datetime — canonical date, then 12-hour time.
 * @param {string|Date|number} input
 * @param {string} [locale="en"]
 * @returns {string} e.g. "Mar 23, 2026, 3:45 PM" or "—" if invalid.
 */
export function formatDateTime(input, locale = "en") {
  const d = toUtcDate(input);
  if (!d) return EM_DASH;
  const date = formatDate(d, locale);
  let h = d.getUTCHours();
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const mer = MERIDIEM[locale] || MERIDIEM.en;
  const ampm = h >= 12 ? mer.pm : mer.am;
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

// Localized short-month array for callers that build their own date format
// (e.g. GuidePage uses a day-first layout) but still want localized months.
export function localizedMonths(locale = "en") {
  return MONTHS_BY_LOCALE[locale] || MONTHS_SHORT;
}

export { MONTHS_SHORT };
