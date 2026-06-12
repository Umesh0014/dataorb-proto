// learningHubLocale — GUI localization model for the Learning Hub Drill
// page (ticket: GUI multilingual + RTL/Arabic). Carries the Insights
// approach: UI strings, taxonomy/master-data (role-play categories +
// difficulty), filters/search and tab labels localize into the selected
// language; Arabic additionally flips the surface to right-to-left.
//
// Scope is deliberate per the brief:
//   - Localized:  interface text, placeholders, taxonomy, filters/search.
//   - NOT localized: the eval language, the raw transcript, and
//     user-defined content (scorecards) — ground truth stays in its
//     source language. The Drill card body is rendered dir="auto" so each
//     scenario keeps its own direction regardless of the GUI language.
//
// English, Español, Deutsch, Français are the proven LTR path; Deutsch is
// kept as the worst-case expansion length. العربية is the RTL case driving
// the PMI UAE + Kuwait readiness work.

export const LH_LOCALES = [
  { id: "en", label: "English",  native: "English",  dir: "ltr", region: "Global" },
  { id: "es", label: "Spanish",  native: "Español",  dir: "ltr", region: "Global" },
  { id: "de", label: "German",   native: "Deutsch",  dir: "ltr", region: "Global" },
  { id: "fr", label: "French",   native: "Français", dir: "ltr", region: "Global" },
  { id: "ar", label: "Arabic",   native: "العربية",  dir: "rtl", region: "UAE · Kuwait" },
];

export function lhLocale(id) {
  return LH_LOCALES.find((l) => l.id === id) || LH_LOCALES[0];
}

export function lhDir(id) {
  return lhLocale(id).dir;
}

// Region / direction display values for the Ribbon (B) + Modal (C).
export function lhRegion(id) {
  return lhLocale(id).region;
}
export function lhDirectionLabel(id) {
  return lhDir(id) === "rtl" ? "RTL — right to left" : "LTR — left to right";
}

const STRINGS = {
  pageTitle:    { en: "Drill",        es: "Práctica",     de: "Übung",            fr: "Exercice",         ar: "تدريب" },
  roleplay:     { en: "Roleplay",     es: "Juego de rol", de: "Rollenspiel",      fr: "Jeu de rôle",      ar: "تمثيل الأدوار" },
  search:       { en: "Search",       es: "Buscar",       de: "Suchen",           fr: "Rechercher",       ar: "بحث" },
  filters:      { en: "Filters",      es: "Filtros",      de: "Filter",           fr: "Filtres",          ar: "عوامل التصفية" },
  tabActive:    { en: "Active",       es: "Activo",       de: "Aktiv",            fr: "Actif",            ar: "نشط" },
  tabLibrary:   { en: "Library",      es: "Biblioteca",   de: "Bibliothek",       fr: "Bibliothèque",     ar: "المكتبة" },
  viewDetails:  { en: "View Details", es: "Ver detalles", de: "Details anzeigen", fr: "Voir les détails", ar: "عرض التفاصيل" },
  language:     { en: "Language",     es: "Idioma",       de: "Sprache",          fr: "Langue",           ar: "اللغة" },
  region:       { en: "Region",       es: "Región",       de: "Region",           fr: "Région",           ar: "المنطقة" },
  direction:    { en: "Direction",    es: "Dirección",    de: "Richtung",         fr: "Direction",        ar: "الاتجاه" },
  langRegion:   { en: "Language & region", es: "Idioma y región", de: "Sprache & Region", fr: "Langue et région", ar: "اللغة والمنطقة" },
  coverageTitle:{ en: "What gets translated", es: "Qué se traduce", de: "Was übersetzt wird", fr: "Ce qui est traduit", ar: "ما تتم ترجمته" },
  apply:        { en: "Apply",        es: "Aplicar",      de: "Übernehmen",       fr: "Appliquer",        ar: "تطبيق" },
  cancel:       { en: "Cancel",       es: "Cancelar",     de: "Abbrechen",        fr: "Annuler",          ar: "إلغاء" },
};

export function lhText(id, key) {
  const row = STRINGS[key];
  if (!row) return key;
  return row[id] ?? row.en;
}

// Taxonomy / master data — DB-sourced role-play categories + difficulty
// bands. Keyed on the English source value (also the semantic key used for
// difficulty color in DrillCard) so the palette lookup stays stable while
// the display label localizes.
const CATEGORY = {
  "Sales":             { en: "Sales",             es: "Ventas",          de: "Vertrieb",            fr: "Ventes",            ar: "المبيعات" },
  "Retention":         { en: "Retention",         es: "Retención",       de: "Kundenbindung",       fr: "Rétention",         ar: "الاحتفاظ بالعملاء" },
  "Service":           { en: "Service",           es: "Servicio",        de: "Service",             fr: "Service",           ar: "الخدمة" },
  "Technical Support": { en: "Technical Support", es: "Soporte técnico", de: "Technischer Support", fr: "Support technique", ar: "الدعم الفني" },
};

const DIFFICULTY = {
  "Simple":   { en: "Simple",   es: "Simple",   de: "Einfach", fr: "Simple",   ar: "بسيط" },
  "Moderate": { en: "Moderate", es: "Moderado", de: "Mittel",  fr: "Modéré",   ar: "متوسط" },
  "Complex":  { en: "Complex",  es: "Complejo", de: "Komplex", fr: "Complexe", ar: "معقّد" },
};

export function lhCategory(id, value) {
  return CATEGORY[value]?.[id] ?? value;
}
export function lhDifficulty(id, value) {
  return DIFFICULTY[value]?.[id] ?? value;
}

// Coverage map for the Language & region modal (variant C). Mirrors the
// brief's five buckets, honestly flagging the two that stay in source
// language by design.
export const LH_COVERAGE = [
  { key: "ui",       translated: true },
  { key: "taxonomy", translated: true },
  { key: "filters",  translated: true },
  { key: "eval",     translated: false },
  { key: "userdata", translated: false },
];

const COVERAGE_LABEL = {
  ui:       { en: "Interface text & placeholders",      es: "Texto de interfaz y marcadores",  de: "Oberflächentext & Platzhalter",    fr: "Texte d’interface et libellés",    ar: "نصوص الواجهة والعناصر النائبة" },
  taxonomy: { en: "Role-play categories (taxonomy)",    es: "Categorías de roles (taxonomía)", de: "Rollenspiel-Kategorien (Taxonomie)", fr: "Catégories de jeux de rôle",      ar: "فئات تمثيل الأدوار (التصنيف)" },
  filters:  { en: "Filters & search",                   es: "Filtros y búsqueda",              de: "Filter & Suche",                   fr: "Filtres et recherche",             ar: "عوامل التصفية والبحث" },
  eval:     { en: "Eval language & transcripts",        es: "Idioma de evaluación y transcripciones", de: "Bewertungssprache & Transkripte", fr: "Langue d’évaluation et transcriptions", ar: "لغة التقييم والنصوص" },
  userdata: { en: "User-defined content (scorecards)",  es: "Contenido del usuario (scorecards)", de: "Benutzerinhalte (Scorecards)",  fr: "Contenu utilisateur (scorecards)", ar: "محتوى المستخدم (بطاقات الأداء)" },
};

const COVERAGE_STATE = {
  yes: { en: "Localized",       es: "Traducido",       de: "Übersetzt",       fr: "Traduit",        ar: "مُترجَم" },
  no:  { en: "Source language", es: "Idioma original", de: "Originalsprache", fr: "Langue source",  ar: "اللغة الأصلية" },
};

export function lhCoverageLabel(id, key) {
  return COVERAGE_LABEL[key]?.[id] ?? COVERAGE_LABEL[key]?.en ?? key;
}
export function lhCoverageState(id, translated) {
  const row = translated ? COVERAGE_STATE.yes : COVERAGE_STATE.no;
  return row[id] ?? row.en;
}
