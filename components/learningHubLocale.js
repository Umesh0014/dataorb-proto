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

// Navigation chrome — module label + SideNav item labels. Used so the
// rail itself renders in the selected language when the whole app flips
// (e.g. Arabic). Keyed by the learningHubConfig item ids.
const NAV = {
  module:       { en: "Learning Hub",  es: "Centro de aprendizaje", de: "Lernzentrum",  fr: "Centre d’apprentissage", ar: "مركز التعلّم" },
  drill:        { en: "Drill",         es: "Práctica",      de: "Übung",         fr: "Exercice",     ar: "تدريب" },
  interactions: { en: "Interactions",  es: "Interacciones", de: "Interaktionen", fr: "Interactions", ar: "التفاعلات" },
  agents:       { en: "Agents",        es: "Agentes",       de: "Agenten",       fr: "Agents",       ar: "الوكلاء" },
  missions:     { en: "Missions",      es: "Misiones",      de: "Missionen",     fr: "Missions",     ar: "المهام" },
  guide:        { en: "Guide",         es: "Guía",          de: "Leitfaden",     fr: "Guide",        ar: "الدليل" },
  replay:       { en: "Replay",        es: "Repetición",    de: "Wiederholung",  fr: "Relecture",    ar: "إعادة التشغيل" },
};

export function lhNavLabel(id, key, fallback) {
  return NAV[key]?.[id] ?? fallback ?? NAV[key]?.en ?? fallback;
}

// localizeLearningConfig — return a copy of the Learning Hub SideNav config
// with module + item labels translated into `id`. Identity-returns the
// original for English so the common path allocates nothing.
export function localizeLearningConfig(config, id) {
  if (id === "en") return config;
  return {
    ...config,
    moduleLabel: lhNavLabel(id, "module", config.moduleLabel),
    displayName: lhNavLabel(id, "module", config.displayName),
    items: config.items.map((item) => ({
      ...item,
      label: lhNavLabel(id, item.id, item.label),
    })),
  };
}

// Drill scenario content in Arabic, keyed by card id — title + description
// for the landing card, plus the full detail-page content (agent brief,
// persona, situation, goals, resolution). Gate 2 requires the Drill tab
// AND its detail view to read fully in Arabic, incl. transcript/eval-style
// copy (Umesh, Jun 13 — overrides the earlier "never translate" rule).
// Customer names stay Latin (proper nouns, dir="auto"); brand strings
// (iPhone 15, Zalando Plus, Samsung A52S) keep their own direction.
const DRILL_CONTENT_AR = {
  "david-evans": {
    title: "استفسار حول ترقية جهاز محمول",
    description:
      "أنت تتحدث مع ديفيد إيفانز، وهو عميل حالي. يتصل للاستفسار عن ترقية جهازه المحمول. يذكر أنه مع المشغّل منذ ست سنوات ويريد معرفة عروض الاستبدال التي يكون مؤهلاً لها.",
    agentBrief:
      "أنت تتحدث مع ديفيد إيفانز، وهو عميل حالي. يتصل للاستفسار عن ترقية جهازه المحمول. يذكر أنه شاهد بعض العروض ويريد معرفة ما إذا كانت لا تزال متاحة. تُظهر سجلاته أنه يمتلك حالياً جهاز Samsung A52S.",
    contactReason: "استفسار عن عرض ترقية جهاز محمول شاهده عبر الإنترنت",
    maxAllowedDuration: "5 دقائق",
    language: "الإنجليزية (المملكة المتحدة)",
    characterOverview:
      "عميل مطّلع وحريص على السعر، وقد بحث جيداً عن عرض محدد. يبدأ بأدب لكنه يصبح محبَطاً ورافضاً عندما لا تلتزم الشركة بإعلان خارجي. لا يتردد في الاستشهاد بعروض المنافسين وسيهدد سريعاً بالمغادرة إذا شعر بأنه يُتجاهَل.",
    currentSituation: [
      "يتصل العميل للاستفسار عن عرض لجهاز «Galaxy Stellar X Pro» شاهده على فيسبوك بسعر 4.90 جنيه إسترليني شهرياً.",
      "يمتلك حالياً جهاز Samsung A52S وهو عميل حالي لدى Acme.",
      "ذكر الإعلان الذي شاهده أن السعر ساري المفعول مع باقته الحالية البالغة 15 جيجابايت.",
      "إنه على دراية بعروض المنافسين، وذكر تحديداً عرض Movistar لجهاز Galaxy S25 بسعر 535 جنيهاً إسترلينياً.",
    ],
    goals: [
      "الحصول على جهاز Galaxy Stellar X Pro بسعر 4.90 جنيه إسترليني شهرياً كما رأى في الإعلان.",
      "الحصول على توضيح رسمي وواضح إذا تعذّر تنفيذ العرض.",
      "الحصول على عرض مضاد مماثل أو أفضل يمنعه من التحول إلى Movistar.",
      "إنهاء المكالمة وهو يشعر بأن الشركة تصرفت بحسن نية.",
    ],
    resolution: {
      ideal:
        "يجد الموظف طريقة لتنفيذ سعر 4.90 جنيه إسترليني شهرياً لجهاز Galaxy Stellar X Pro، ربما بتطبيق رصيد ولاء متكرر يخفّض تكلفة التمويل القياسية إلى ذلك المعدل الشهري الفعلي.",
      minimum:
        "يشرح الموظف سبب عدم صلاحية عرض فيسبوك (مثل: للعملاء الجدد فقط، أو خطأ تسويقي)، ويسجّل شكوى رسمية بشأن الإعلان المضلِّل، ويقدّم بادرة حسن نية ملموسة (مثل رصيد 50 جنيهاً إسترلينياً على الحساب) للاحتفاظ بالعميل.",
      compromised:
        "لا يستطيع الموظف مطابقة سعر 4.90 جنيه إسترليني لكنه يقدّم خصم ولاء كبيراً على التمويل القياسي البالغ 28.50 جنيهاً شهرياً لجهاز Stellar X Pro (مثل خصم 50%) أو يعرض جهازاً آخر راقياً بسعر مدعوم بشكل كبير.",
    },
  },
  "javier-sanz": {
    title: "نزاع على الفاتورة بسبب سعر غير صحيح بعد العرض الترويجي",
    description:
      "أنت تتحدث مع خافيير سانز، عميل يتصل بسبب اختلاف في فاتورته. يؤكد أنه جدّد عرضه قبل شهرين وأن السعر المحصَّل لا يطابق ما تم الاتفاق عليه. يريد توضيحاً واضحاً وتعديلاً بأثر رجعي.",
    agentBrief:
      "ستتحدث مع خافيير سانز، عميل منذ أربع سنوات. يتصل بشأن فاتورة مبلغها أعلى من اتفاق التجديد الموقّع قبل شهرين. يؤكد أنه تلقّى تأكيداً عبر البريد الإلكتروني ويطالب بتعديل بأثر رجعي مع توضيح واضح للخطأ.",
    contactReason: "تباين بين الفاتورة المستلمة واتفاق التجديد",
    maxAllowedDuration: "6 دقائق",
    language: "الإسبانية (إسبانيا)",
    characterOverview:
      "عميل دقيق يحتفظ برسائل البريد والإيصالات. يبدأ المكالمة بنبرة حازمة لكنها مهذبة. إذا شعر بالمماطلة، ينتقل سريعاً إلى نبرة باردة ويذكر إمكانية تغيير المشغّل وتقديم شكوى رسمية.",
    currentSituation: [
      "جدّد عرضه قبل شهرين برسم شهري متفق عليه قدره 29.90 يورو.",
      "تُظهر فاتورته الأخيرة 38.50 يورو دون تفصيل واضح للبند الإضافي.",
      "لديه بريد تأكيد التجديد يتضمّن السعر المتفق عليه.",
      "سبق أن تواصل مرتين دون الحصول على توضيح متماسك.",
    ],
    goals: [
      "الحصول على تعديل بأثر رجعي عن الفرق المحصَّل في آخر فاتورتين.",
      "تلقّي توضيح واضح وخطّي للخطأ.",
      "تأكيد السعر الشهري الصحيح خطّياً ابتداءً من الفاتورة التالية.",
      "تجنّب الاضطرار إلى الاتصال مجدداً للسبب نفسه.",
    ],
    resolution: {
      ideal:
        "يحدد الموظف خطأ الفوترة، ويطبّق التعديل الكامل بأثر رجعي، ويؤكد السعر المتفق عليه عبر البريد، ويقدّم تعويضاً إضافياً عن الإزعاج.",
      minimum:
        "يقرّ الموظف بالمشكلة، ويسجّل شكوى رسمية، ويطبّق التعديل بأثر رجعي، ويلتزم بمكالمة متابعة خلال 48 ساعة.",
      compromised:
        "لا يستطيع الموظف تطبيق التعديل خلال المكالمة لكنه يفتح شكوى رسمية برقم مرجعي والتزام بالرد خلال خمسة أيام، ما يمنع العميل من تنفيذ نقل الرقم فوراً.",
    },
  },
  "klaus-schmidt": {
    title: "تغيير مالك خط الهاتف المحمول",
    description:
      "أنت تتحدث مع كلاوس شميت، وهو عميل تواصل بعد تلقّيه مكالمة مشبوهة. إنه متحفّظ ويريد التحقق من طلب تغيير مالك خط هاتفه المحمول، ويتوقع شرح جميع خطوات الأمان بعناية.",
    agentBrief:
      "أنت تتحدث مع كلاوس شميت، عميل خاص منذ زمن طويل. يتواصل لأنه تلقّى مكالمة مشبوهة أُعلن فيها عن تغيير مالك خط هاتفه المحمول دون أن يطلب ذلك. إنه قلق ويتوقع فحصاً أمنياً دقيقاً.",
    contactReason: "تغيير مالك مشتبه بأنه غير مصرّح به",
    maxAllowedDuration: "8 دقائق",
    language: "الألمانية (ألمانيا)",
    characterOverview:
      "عميل واعٍ أمنياً وميّال إلى الرسمية. يستمع بدقة ويطلب شروحاً واضحة خطوة بخطوة. لا يقبل العبارات النمطية ويتوقع تبرير كل خطوة من خطوات التحقق من الهوية قبل أن يفصح عن بياناته.",
    currentSituation: [
      "مكالمة مشبوهة من شخص يدّعي أنه موظف يعلن عن تغيير المالك.",
      "لم يطلب كلاوس تغيير المالك ولم يتلقَّ أي تأكيد خطّي.",
      "تنتهي مدة عقده بعد أحد عشر شهراً فقط.",
      "إنه المالك الوحيد للخط وجهة الاتصال الوحيدة على الحساب.",
    ],
    goals: [
      "الحصول على تأكيد بعدم وجود طلب تغيير مالك قيد التنفيذ.",
      "وضع حظر أمني على الحساب إلى أن يتضح كل شيء.",
      "معرفة مسار تصعيد واضح في حال الاشتباه بالاحتيال.",
      "تأكيد خطّي بالخطوات التي تم اتخاذها.",
    ],
    resolution: {
      ideal:
        "يتحقّق الموظف من الهوية بدقة، ويفحص النظام بحثاً عن طلبات مفتوحة، ويضع حظراً أمنياً، ويفتح حالة احتيال برقم مرجعي، ويرسل التأكيد خطّياً.",
      minimum:
        "يؤكد الموظف بعد التحقق من الهوية عدم وجود طلب تغيير مالك مفتوح، ويدوّن الواقعة، ويشرح مسارات التصعيد في حال تكرار المحاولات.",
      compromised:
        "لا يستطيع الموظف وضع الحظر الأمني مباشرة لكنه يحيل الحالة إلى قسم الأمن ويضمن معاودة الاتصال خلال 24 ساعة برقم مرجعي.",
    },
  },
  "amelie-dubois": {
    title: "زيادة غير متوقعة في الفاتورة بعد انتهاء العرض",
    description:
      "أنت تتحدث مع أميلي دوبوا، عميلة تتصل بشأن فاتورتها الأخيرة. لاحظت زيادة في السعر لا تفهمها وتريد معرفة ما إذا كان عرض ترويجي قد انتهى للتو. تبقى مهذّبة ومنفتحة على التوضيح.",
    agentBrief:
      "ستتحدث مع أميلي دوبوا، عميلة وفية منذ أكثر من ثلاث سنوات. تتصل بشأن زيادة مفاجئة في فاتورتها الأخيرة لا تجد لها تفسيراً. تبقى مهذبة وتبحث قبل كل شيء عن توضيح واضح قبل أي إجراء آخر.",
    contactReason: "زيادة غير متوقعة في الفاتورة الأخيرة",
    maxAllowedDuration: "4 دقائق",
    language: "الفرنسية (فرنسا)",
    characterOverview:
      "عميلة هادئة وصبورة نسبياً، تفضّل توضيحاً واقعياً على بادرة تجارية فورية. إذا كان الرد متماسكاً، تقبل الوضع عادة. لكنها تكره أن تُحوَّل من قسم إلى آخر.",
    currentSituation: [
      "فاتورة الشهر الحالي أعلى بنحو 8 يورو مقارنة بالشهر السابق.",
      "لا تتذكّر أنها فعّلت أي خدمة إضافية.",
      "انتهى عرضها الترويجي المرتبط بالتزام 12 شهراً في الشهر الماضي.",
      "تبقى منفتحة على خيارات مختلفة ما دام يُشرح لها الوضع بوضوح.",
    ],
    goals: [
      "فهم سبب تغيّر المبلغ بدقة.",
      "تقييم ما إذا كان هناك عرض جديد يناسب استخدامها.",
      "تجنّب الانتقال إلى مشغّل آخر إذا قُدِّم لها حل معقول.",
      "الحصول على ملخص واضح للوضع التعريفي الجديد.",
    ],
    resolution: {
      ideal:
        "يشرح الموظف بوضوح انتهاء العرض الترويجي، ويقترح خصم ولاء جديداً يعيد الفاتورة إلى مستوى قريب من السابق، ويرسل ملخصاً خطّياً.",
      minimum:
        "يشرح الموظف انتهاء العرض، ويقترح على الأقل تعديلاً مؤقتاً أو خياراً تعريفياً جديداً، ويؤكد الوضع خطّياً.",
      compromised:
        "لا يستطيع الموظف تطبيق خصم فوراً لكنه يفتح طلب بادرة تجارية مع التزام بالرد خلال 48 ساعة، وهو ما يكفي لطمأنتها كي تبقى عميلة.",
    },
  },
  "oliver-sterling": {
    title: "تثبيت طابعة محطة العمل",
    description:
      "أنت تتحدث مع أوليفر ستيرلينغ، موظف منذ زمن طويل يواجه صعوبة في إعداد طابعة جديدة على محطة عمله. إنه صبور لكنه غير معتاد على تثبيت برامج التشغيل ويرغب في إرشادات خطوة بخطوة.",
    agentBrief:
      "أنت تتحدث مع أوليفر ستيرلينغ، موظف داخلي منذ زمن طويل. تلقّى للتو طابعة مكتبية جديدة لمحطة عمله لكنه لا يستطيع إكمال تثبيت برنامج التشغيل بمفرده. إنه صبور ومستعد لاتباع التعليمات ويفضّل إرشاداً موجّهاً خطوة بخطوة.",
    contactReason: "المساعدة في تثبيت برنامج تشغيل طابعة محطة العمل",
    maxAllowedDuration: "5 دقائق",
    language: "الإنجليزية (الولايات المتحدة)",
    characterOverview:
      "صبور وودود، ومرتاح للإفصاح عندما لا يفهم. يفضّل التعليمات خطوة بخطوة على المصطلحات التقنية. يتّبع الإرشادات بعناية لكنه يتوقع من الموظف التحقق من كل خطوة قبل الانتقال إلى التالية.",
    currentSituation: [
      "تلقّى طابعة HP LaserJet جديدة لمكتبه هذا الصباح.",
      "وصّل كابل USB لكن محطة العمل لا تكتشف الجهاز.",
      "لا يستطيع تثبيت برامج التشغيل من موقع الشركة المصنّعة بسبب قيود المسؤول.",
      "لديه اجتماع خلال 30 دقيقة ويرغب في طباعة جدول الأعمال قبله.",
    ],
    goals: [
      "تثبيت الطابعة وطباعة صفحة اختبار قبل اجتماعه.",
      "فهم الخطوات التي يمكنه القيام بها بنفسه في المرة القادمة دون الاتصال.",
      "تجنّب الحاجة إلى تصعيد المشكلة إلى قسم تقنية المعلومات في الموقع.",
      "الحصول على ملخص خطّي موجز لما تم تغييره على جهازه.",
    ],
    resolution: {
      ideal:
        "يدفع الموظف برنامج تشغيل الطابعة عن بُعد، ويتحقق من التثبيت بصفحة اختبار، ويرسل إلى أوليفر ملخصاً من صفحة واحدة بالتغيير لسجلاته.",
      minimum:
        "يرشد الموظف أوليفر إلى طلب صلاحيات تثبيت مرتفعة، ويحدد مكالمة متابعة خلال ساعة، ويؤكد وجود تذكرة الطلب في قائمة الانتظار.",
      compromised:
        "لا يستطيع الموظف التثبيت عن بُعد أو منح الصلاحيات لكنه ينشئ تذكرة عالية الأولوية لتقنية المعلومات في الموقع ويحدد توقعات صحيحة لوقت الاستجابة، مع وضع علامة عاجلة على الطابعة.",
    },
  },
  "lucia-martin-garcia": {
    title: "زيادة السعر بعد انتهاء العرض الترويجي",
    description:
      "ستتعامل مع لوسيا مارتن غارسيا، عميلة انتهى خصمها الترويجي لمدة عام، ما أدى إلى ارتفاع رسومها الشهرية. إنها منزعجة وتفكّر في تغيير المشغّل إن لم يُقدَّم لها بديل معقول.",
    agentBrief:
      "ستتعامل مع لوسيا مارتن غارسيا، عميلة منذ زمن طويل. انتهى للتو خصمها الترويجي لمدة اثني عشر شهراً، ما يعني زيادة كبيرة في رسمها الشهري. تتصل وهي منزعجة بوضوح وتفكّر في تغيير المشغّل إن لم يُقدَّم لها بديل.",
    contactReason: "انتهاء الخصم الترويجي وزيادة الرسم الشهري",
    maxAllowedDuration: "7 دقائق",
    language: "الإسبانية (إسبانيا)",
    characterOverview:
      "عميلة صارمة تعرف عروض السوق جيداً وتقارن بينها. تبدأ المكالمة بنبرة حادة. لا تتحمّل الإجابات المراوغة وتقدّر بشكل خاص أن يعترف الموظف بأقدميتها قبل اقتراح أي حل.",
    currentSituation: [
      "انتهى للتو خصمها الترويجي البالغ 50% بعد اثني عشر شهراً.",
      "ارتفع الرسم الشهري الجديد من 19.90 يورو إلى 39.80 يورو.",
      "لديها عرض محدد من منافس بسعر 27 يورو شهرياً بشروط مماثلة.",
      "إنها عميلة منذ أكثر من ست سنوات ولم يتخلّف عليها أي سداد.",
    ],
    goals: [
      "الحصول على تعرفة جديدة قريبة من أو مساوية لسعر العرض الترويجي السابق.",
      "الشعور بأن أقدميتها مُقدَّرة ومثمَّنة.",
      "تجنّب عناء نقل الرقم إلى مشغّل آخر.",
      "الحصول على تأكيد خطّي بالتعرفة الجديدة ومدة الميزة.",
    ],
    resolution: {
      ideal:
        "يطبّق الموظف خصم ولاء لمدة اثني عشر شهراً يساوي أو يحسّن عرض المنافس، ويؤكد التغيير خطّياً، ويشكرها صراحةً على أقدميتها كعميلة.",
      minimum:
        "يطبّق الموظف خصماً جزئياً كبيراً لمدة ستة أشهر، ويلتزم بمراجعة في منتصف المدة، ويترك العرض خطّياً.",
      compromised:
        "لا يستطيع الموظف مطابقة المنافس لكنه يقدّم خصماً مؤقتاً لثلاثة أشهر ويفتح طلب مراجعة مخصّصاً لمنع تنفيذ نقل الرقم في الأسبوع نفسه.",
    },
  },
  "andres-navarro": {
    title: "عميل بدأ نقل رقمه إلى مشغّل آخر",
    description:
      "أنت تتحدث مع أندريس نافارو، عميل منذ زمن طويل يعاود الاتصال بعد ملاحظته عدة مكالمات فائتة من الشركة. لقد بدأ بالفعل عملية نقل رقمه إلى مشغّل آخر ويريد فهم خياراته قبل أن يصبح التغيير سارياً.",
    agentBrief:
      "ستتعامل مع أندريس نافارو، عميل منذ سبع سنوات. بدأ نقل رقمه إلى مشغّل آخر ويعاود الاتصال بعد عدة مكالمات فائتة من الشركة. يريد فهم خياراته قبل أن يصبح التغيير سارياً خلال 48 ساعة.",
    contactReason: "نقل رقم بدأ بالفعل نحو مشغّل آخر",
    maxAllowedDuration: "7 دقائق",
    language: "الإسبانية (إسبانيا)",
    characterOverview:
      "عميل حاسم اتخذ قراره بعقلانية. مستعد للاستماع لكنه لا يريد إضاعة الوقت. يقدّر الاحترام والصراحة؛ وأي محاولة احتفاظ يراها تلاعباً ينهيها سريعاً.",
    currentSituation: [
      "وقّع على نقل الرقم قبل ثلاثة أيام، وتاريخ السريان خلال 48 ساعة.",
      "يستند قراره إلى عرض من منافس بسعر أقل وتغطية أفضل في منطقته.",
      "يهتم بالإبقاء على رقمه فقط إذا قدّمت الشركة عرضاً أفضل بوضوح.",
      "يؤكد عدم وجود مشكلات لديه في جودة الخدمة الحالية، بل في السعر فقط.",
    ],
    goals: [
      "مقارنة عرض الشركة بعرض المنافس بوضوح.",
      "اتخاذ قرار مستنير قبل أن يصبح نقل الرقم سارياً.",
      "تجنّب الضغط أو التلاعب العاطفي.",
      "الحصول على أي عرض جديد خطّياً خلال أقل من 24 ساعة.",
    ],
    resolution: {
      ideal:
        "يلغي الموظف نقل الرقم بموافقة صريحة من العميل بعد تقديم عرض مخصّص يتفوّق على سعر المنافس ويعترف بأقدميته.",
      minimum:
        "يقدّم الموظف أفضل عرض احتفاظ متاح خطّياً، ويترك العميل يقرّر دون ضغط، ويؤكد بوضوح المهل اللازمة لعكس نقل الرقم إذا قرّر البقاء.",
      compromised:
        "لا ينجح الموظف في الاحتفاظ بالعميل لكنه ينهي المحادثة بوداع لائق، ويسجّل سبب المغادرة للمراجعة الداخلية، ويترك الباب مفتوحاً لعودة مستقبلية بقسيمة ترحيب.",
    },
  },
  "gregory-vance": {
    title: "عدم تسليم طلب iPhone 15",
    description:
      "أنت تتحدث مع غريغوري فانس، عميل منذ زمن طويل يتصل بخصوص طلب أجهزة عالي القيمة (iPhone 15) كان من المفترض تسليمه قبل أربعة أيام. لا تزال صفحة التتبّع تعرض «قيد النقل»، وهو يريد إما بديلاً فورياً أو استرداداً كاملاً.",
    agentBrief:
      "أنت تتحدث مع غريغوري فانس، عميل منذ زمن طويل قدّم طلب أجهزة عالي القيمة (iPhone 15) قبل ثمانية أيام. وُعد بالتسليم قبل أربعة أيام، ولا يزال التتبّع يعرض «قيد النقل»، وقد اتصل عدة مرات دون حل. إنه غاضب ويطالب إما ببديل فوري أو استرداد كامل.",
    contactReason: "طلب أجهزة عالي القيمة لم يُسلَّم بعد ثمانية أيام من الشراء",
    maxAllowedDuration: "8 دقائق",
    language: "الإنجليزية (الولايات المتحدة)",
    characterOverview:
      "محبَط، بليغ التعبير، ونفد صبره بعد مكالمات متعددة دون حل. يستمع لكنه يتوقع التزامات حازمة لا اعتذارات. أي مماطلة أو لغة نمطية إضافية ستدفعه إلى التصعيد عبر وسائل التواصل أو ردّ المبلغ.",
    currentSituation: [
      "تم تقديم الطلب قبل ثمانية أيام لجهاز iPhone 15 مع شحن خلال يومين.",
      "كان تاريخ التسليم الموعود قبل أربعة أيام؛ ولا يزال التتبّع يعرض «قيد النقل».",
      "اتصل بالشركة أربع مرات؛ ووُعد في كل مرة بمعاودة اتصال لم تحدث.",
      "هاتفه الحالي معطّل، وقد بقي بلا جهاز عامل طوال الأسبوع.",
    ],
    goals: [
      "الحصول إما على جهاز بديل مؤكَّد بتاريخ تسليم مضمون، أو استرداد كامل يُنفَّذ اليوم.",
      "الحصول على جهة اتصال واحدة محدّدة بالاسم مسؤولة عن الحل.",
      "تجنّب الاضطرار إلى تكرار القصة كاملة في أي مكالمة مستقبلية.",
      "الحصول على اعتراف ملموس بالاضطراب (جهاز إعارة، رصيد، أو كليهما).",
    ],
    resolution: {
      ideal:
        "يصرّح الموظف فوراً ببديل iPhone 15 يُرسَل في اليوم نفسه بشحن بين عشية وضحاها، ويطبّق رصيد خدمة مجزياً، ويعيّن مسؤولاً بالاسم مع تفاصيل اتصال مباشرة.",
      minimum:
        "يعالج الموظف استرداداً كاملاً خلال المكالمة، ويؤكد جدول الاسترداد خطّياً، ويقدّم خصماً على شراء أجهزة مستقبلي للاحتفاظ بالعميل.",
      compromised:
        "لا يستطيع الموظف إرسال بديل في اليوم نفسه لكنه ينشئ تذكرة تصعيد ذات أولوية باتفاق مستوى خدمة 24 ساعة، ويفتح تحقيقاً رسمياً مع الناقل، ويقدّم رصيد خدمة مؤقتاً اعترافاً بالاضطراب.",
    },
  },
  "diana-sterling": {
    title: "تجاوز الذكاء الاصطناعي لتوثيق الضرر",
    description:
      "أنت تتعامل مع عضوة في Zalando Plus تلقّت قميصاً حريرياً عالي القيمة متضرراً. حاولت بالفعل استخدام مسار الإبلاغ الرقمي عن الضرر ورُفض طلبها عبر الفحص الآلي. تريد تصعيد الأمر إلى مراجِع بشري.",
    agentBrief:
      "أنت تتعامل مع ديانا ستيرلينغ، عضوة في Zalando Plus تلقّت قميصاً حريرياً عالي القيمة متضرراً. حاولت بالفعل مسار الإبلاغ الرقمي عن الضرر مرتين ورُفض في كلتيهما. إنها محبَطة وتريد التصعيد إلى مراجِع بشري للحصول على استرداد كامل.",
    contactReason: "رُفضت مطالبة الضرر الآلية على منتج عالي القيمة",
    maxAllowedDuration: "5 دقائق",
    language: "الإنجليزية (المملكة المتحدة)",
    characterOverview:
      "عضوة Plus بليغة، مرتاحة مع الأدوات الرقمية، ومحبَطة تحديداً من إعادتها إلى الحلقة الآلية نفسها. تكون متعاونة عند معاملتها كعميلة من فئة عالية لكنها تتفاعل بحدّة عندما يُطلب منها تكرار المسار الرقمي نفسه.",
    currentSituation: [
      "تلقّت قميصاً حريرياً بقيمة 180 جنيهاً إسترلينياً مع تمزّق واضح في الحياكة ظاهر في الصور المرسلة.",
      "استخدمت مسار الإبلاغ عن الضرر في التطبيق مرتين؛ ورُفضت كلتا المحاولتين عبر الفحص الآلي.",
      "كان المنتج هدية ومناسبة المُستلِم خلال ثلاثة أيام.",
      "اشتراك Plus قابل للتجديد الشهر المقبل وهي تشكّك علناً في قيمته.",
    ],
    goals: [
      "مراجعة مطالبة الضرر من قِبل مراجِع بشري خلال المكالمة.",
      "الحصول على قرار استرداد أو استبدال في اليوم نفسه.",
      "تجنّب الطلب منها تكرار المسار الرقمي مرة ثالثة.",
      "الحصول على اعتراف صريح بحالة عضويتها في Plus.",
    ],
    resolution: {
      ideal:
        "يتجاوز الموظف الرفض الآلي في الحال، ويعالج استرداداً كاملاً مع رصيد بادرة حسن نية من فئة Plus، ويؤكد الخطوات التالية عبر البريد الإلكتروني.",
      minimum:
        "يصعّد الموظف الحالة إلى مراجِع بشري باتفاق مستوى خدمة 24 ساعة، ويصدر استرداداً مؤقتاً كبادرة حسن نية، ويؤكد رقم الحالة عبر البريد الإلكتروني.",
      compromised:
        "لا يستطيع الموظف تجاوز القرار الآلي لكنه يوجّه الحالة إلى مراجِع كبير بأولوية ويقدّم قسيمة حسن نية من فئة Plus لتلطيف التجربة أثناء معالجة الحالة.",
    },
  },
};

// lhDrillContent — localized scenario content for a Drill card, or null
// when the locale has no override (caller keeps the source strings).
export function lhDrillContent(id, cardId) {
  if (id === "ar") return DRILL_CONTENT_AR[cardId] ?? null;
  return null;
}

// Drill-detail chrome — static labels on the detail view. en + ar; other
// locales fall back to en (detail content currently localizes for Arabic).
const DETAIL = {
  detailTitle:    { en: "Drill Details",        ar: "تفاصيل التدريب" },
  back:           { en: "Back to Drill",        ar: "العودة إلى التدريب" },
  active:         { en: "Active",               ar: "نشط" },
  totalInteractions: { en: "Total Interactions", ar: "إجمالي التفاعلات" },
  averageDuration:{ en: "Average Duration",     ar: "متوسط المدة" },
  roleplayCategory:{ en: "Roleplay Category",   ar: "فئة تمثيل الأدوار" },
  source:         { en: "Source",               ar: "المصدر" },
  agentBrief:     { en: "Agent Brief",          ar: "موجز الوكيل" },
  contactReason:  { en: "Contact Reason",       ar: "سبب التواصل" },
  maxDuration:    { en: "Max Allowed Duration", ar: "الحد الأقصى للمدة المسموح بها" },
  languageField:  { en: "Language",             ar: "اللغة" },
  personaDetails: { en: "Persona Details",      ar: "تفاصيل الشخصية" },
  forManagers:    { en: "(For Managers Only)",  ar: "(للمديرين فقط)" },
  characterOverview: { en: "Character Overview", ar: "نظرة عامة على الشخصية" },
  tabCurrent:     { en: "Current situation",    ar: "الوضع الحالي" },
  tabGoals:       { en: "Goals",                ar: "الأهداف" },
  resolution:     { en: "Resolution",           ar: "الحل" },
  resIdeal:       { en: "Ideal",                ar: "مثالي" },
  resMinimum:     { en: "Minimum",              ar: "الحد الأدنى" },
  resCompromised: { en: "Compromised",          ar: "حل وسط" },
};

export function lhDetail(id, key) {
  const row = DETAIL[key];
  if (!row) return key;
  return row[id] ?? row.en;
}

// New Roleplay wizard (Step 1 persona + Step 2 context + breadcrumb).
// Full five-locale set, matching the rest of the engine: the wizard is GUI
// chrome (labels, placeholders, helper text), so it localizes everywhere,
// not just Arabic. Field VALUES (category, complexity, language) reuse the
// taxonomy maps / LANGUAGE_NAME below so the stored canonical key is stable
// while only the display label localizes.
const WIZARD = {
  bcPersona:    { en: "Enter Persona Details",        es: "Introducir detalles del perfil", de: "Persona-Details eingeben",      fr: "Saisir les détails du profil",    ar: "إدخال تفاصيل الشخصية" },
  bcContext:    { en: "Add Conversation Context",     es: "Añadir contexto de conversación", de: "Gesprächskontext hinzufügen",  fr: "Ajouter le contexte de conversation", ar: "إضافة سياق المحادثة" },
  viewSample:   { en: "View Sample",                  es: "Ver ejemplo",                de: "Beispiel ansehen",             fr: "Voir un exemple",                 ar: "عرض نموذج" },
  step1Subtitle:{ en: "Build intelligent customer personas to train and coach the agents", es: "Crea perfiles de cliente inteligentes para formar y orientar a los agentes", de: "Erstellen Sie intelligente Kundenpersonas, um Agenten zu schulen und zu coachen", fr: "Créez des profils clients intelligents pour former et coacher les agents", ar: "أنشئ شخصيات عملاء ذكية لتدريب الوكلاء وتوجيههم" },
  step2Title:   { en: "Add Supporting Information",    es: "Añadir información de apoyo", de: "Unterstützende Informationen hinzufügen", fr: "Ajouter des informations complémentaires", ar: "إضافة معلومات داعمة" },
  next:         { en: "Next",                          es: "Siguiente",                  de: "Weiter",                       fr: "Suivant",                         ar: "التالي" },
  previous:     { en: "Previous",                      es: "Anterior",                   de: "Zurück",                       fr: "Précédent",                       ar: "السابق" },
  cancel:       { en: "Cancel",                        es: "Cancelar",                   de: "Abbrechen",                    fr: "Annuler",                         ar: "إلغاء" },
  generate:     { en: "Generate",                      es: "Generar",                    de: "Generieren",                   fr: "Générer",                         ar: "إنشاء" },
  skipGenerate: { en: "Skip and Generate with AI",     es: "Omitir y generar con IA",    de: "Überspringen und mit KI generieren", fr: "Ignorer et générer avec l’IA", ar: "تخطٍّ والإنشاء بالذكاء الاصطناعي" },

  fldCategory:  { en: "Roleplay category",             es: "Categoría de juego de rol",  de: "Rollenspiel-Kategorie",        fr: "Catégorie de jeu de rôle",        ar: "فئة تمثيل الأدوار" },
  fldLanguage:  { en: "Persona language",              es: "Idioma del perfil",          de: "Persona-Sprache",              fr: "Langue du profil",                ar: "لغة الشخصية" },
  fldReason:    { en: "Why is the customer reaching out?", es: "¿Por qué contacta el cliente?", de: "Warum meldet sich der Kunde?", fr: "Pourquoi le client vous contacte-t-il ?", ar: "لماذا يتواصل العميل؟" },
  fldObjective: { en: "What is the customer’s overall objective from the contact?", es: "¿Cuál es el objetivo general del cliente con el contacto?", de: "Was ist das übergeordnete Ziel des Kunden beim Kontakt?", fr: "Quel est l’objectif global du client lors du contact ?", ar: "ما هو هدف العميل العام من التواصل؟" },
  fldComplexity:{ en: "Persona Complexity",            es: "Complejidad del perfil",     de: "Persona-Komplexität",          fr: "Complexité du profil",            ar: "تعقيد الشخصية" },
  fldDuration:  { en: "Max allowed duration",          es: "Duración máxima permitida",  de: "Maximal zulässige Dauer",      fr: "Durée maximale autorisée",        ar: "الحد الأقصى للمدة المسموح بها" },
  minutes:      { en: "Minutes",                       es: "Minutos",                    de: "Minuten",                      fr: "Minutes",                         ar: "دقيقة" },
  minShort:     { en: "min",                           es: "min",                        de: "Min.",                         fr: "min",                             ar: "دقيقة" },

  phCategory:   { en: "E.g. Sales",                    es: "P. ej. Ventas",              de: "Z. B. Vertrieb",               fr: "P. ex. Ventes",                   ar: "مثال: المبيعات" },
  phLanguage:   { en: "E.g. English (UK)",             es: "P. ej. Inglés (Reino Unido)", de: "Z. B. Englisch (UK)",         fr: "P. ex. Anglais (R.-U.)",          ar: "مثال: الإنجليزية (المملكة المتحدة)" },
  phReason:     { en: "E.g. Billing and payment issues", es: "P. ej. Problemas de facturación y pago", de: "Z. B. Probleme mit Abrechnung und Zahlung", fr: "P. ex. Problèmes de facturation et de paiement", ar: "مثال: مشكلات الفوترة والدفع" },
  phObjective:  { en: "E.g. Billing and payment issues", es: "P. ej. Problemas de facturación y pago", de: "Z. B. Probleme mit Abrechnung und Zahlung", fr: "P. ex. Problèmes de facturation et de paiement", ar: "مثال: مشكلات الفوترة والدفع" },

  fldObjections:{ en: "What are the key objections?",  es: "¿Cuáles son las objeciones clave?", de: "Was sind die wichtigsten Einwände?", fr: "Quelles sont les principales objections ?", ar: "ما هي الاعتراضات الرئيسية؟" },
  fldProducts:  { en: "What products or services will be discussed?", es: "¿Qué productos o servicios se tratarán?", de: "Welche Produkte oder Dienstleistungen werden besprochen?", fr: "Quels produits ou services seront abordés ?", ar: "ما المنتجات أو الخدمات التي ستتم مناقشتها؟" },
  fldContext:   { en: "Any additional context?",       es: "¿Algún contexto adicional?", de: "Zusätzlicher Kontext?",        fr: "Un contexte supplémentaire ?",    ar: "أي سياق إضافي؟" },
  phObjections: { en: "E.g. The customer is not interested in the product/service", es: "P. ej. El cliente no está interesado en el producto/servicio", de: "Z. B. Der Kunde ist nicht am Produkt/Service interessiert", fr: "P. ex. Le client n’est pas intéressé par le produit/service", ar: "مثال: العميل غير مهتم بالمنتج/الخدمة" },
  phProducts:   { en: "E.g. international roaming plan", es: "P. ej. plan de itinerancia internacional", de: "Z. B. internationaler Roaming-Tarif", fr: "P. ex. forfait d’itinérance internationale", ar: "مثال: باقة التجوال الدولي" },
  phContext:    { en: "E.g. The customer is a long term user and has been loyal to the company since 2 years.", es: "P. ej. El cliente es usuario desde hace tiempo y ha sido fiel a la empresa durante 2 años.", de: "Z. B. Der Kunde ist langjähriger Nutzer und seit 2 Jahren treu.", fr: "P. ex. Le client est un utilisateur de longue date, fidèle à l’entreprise depuis 2 ans.", ar: "مثال: العميل مستخدم منذ مدة طويلة وظل وفياً للشركة منذ عامين." },

  capLabel:     { en: "Per-roleplay monthly minute cap", es: "Límite mensual de minutos por juego de rol", de: "Monatliches Minutenlimit pro Rollenspiel", fr: "Plafond mensuel de minutes par jeu de rôle", ar: "حد الدقائق الشهري لكل تمثيل أدوار" },
  capHelper:    { en: "Optional. Caps the minutes this roleplay can consume each month. Off by default; existing sessions are never interrupted.", es: "Opcional. Limita los minutos que este juego de rol puede consumir cada mes. Desactivado por defecto; las sesiones existentes nunca se interrumpen.", de: "Optional. Begrenzt die Minuten, die dieses Rollenspiel pro Monat verbrauchen kann. Standardmäßig aus; laufende Sitzungen werden nie unterbrochen.", fr: "Facultatif. Limite les minutes que ce jeu de rôle peut consommer chaque mois. Désactivé par défaut ; les sessions en cours ne sont jamais interrompues.", ar: "اختياري. يحدّ من الدقائق التي يمكن أن يستهلكها تمثيل الأدوار هذا كل شهر. مُعطَّل افتراضياً؛ ولا تُقطَع الجلسات الجارية أبداً." },
  capSuffix:    { en: "min / month",                   es: "min / mes",                  de: "Min. / Monat",                 fr: "min / mois",                      ar: "دقيقة / شهر" },
  genTitle:     { en: "Roleplay Generation",           es: "Generación de juego de rol", de: "Rollenspiel-Generierung",      fr: "Génération de jeu de rôle",       ar: "إنشاء تمثيل الأدوار" },
};

export function lhWizard(id, key) {
  const row = WIZARD[key];
  if (!row) return key;
  return row[id] ?? row.en;
}

// Interactions tab — table chrome, sentiment, skills popover, filters
// drawer, pagination, empty state. Full five-locale set (GUI chrome).
// Customer IDs, agent names and timestamps are data/proper nouns and stay
// in source. Composite keys (sent_*, ch_*, col_*, attr_*, fs_*, opt_*,
// skill_*) localize the data-driven cells while their stored id stays stable.
const INTERACTIONS = {
  title:        { en: "Interactions",   es: "Interacciones",  de: "Interaktionen",   fr: "Interactions",   ar: "التفاعلات" },
  searchBy:     { en: "Search by",      es: "Buscar por",     de: "Suchen nach",     fr: "Rechercher par", ar: "البحث حسب" },
  clearSearch:  { en: "Clear search",   es: "Borrar búsqueda", de: "Suche löschen",  fr: "Effacer la recherche", ar: "مسح البحث" },
  filterName:   { en: "Search by filter name", es: "Buscar por nombre de filtro", de: "Nach Filternamen suchen", fr: "Rechercher par nom de filtre", ar: "البحث باسم عامل التصفية" },
  deselectAll:  { en: "Deselect all",   es: "Deseleccionar todo", de: "Alle abwählen", fr: "Tout désélectionner", ar: "إلغاء تحديد الكل" },
  optionsPending:{ en: "Options pending", es: "Opciones pendientes", de: "Optionen ausstehend", fr: "Options en attente", ar: "الخيارات قيد الإعداد" },
  emptyMessage: { en: "No Interactions matched your search criteria.", es: "Ninguna interacción coincidió con tu búsqueda.", de: "Keine Interaktionen entsprachen deinen Suchkriterien.", fr: "Aucune interaction ne correspond à vos critères de recherche.", ar: "لا توجد تفاعلات تطابق معايير بحثك." },
  firstPage:    { en: "First page",     es: "Primera página", de: "Erste Seite",     fr: "Première page",  ar: "الصفحة الأولى" },
  prevPage:     { en: "Previous page",  es: "Página anterior", de: "Vorherige Seite", fr: "Page précédente", ar: "الصفحة السابقة" },
  nextPage:     { en: "Next page",      es: "Página siguiente", de: "Nächste Seite",  fr: "Page suivante",  ar: "الصفحة التالية" },
  skillsDetail: { en: "Skills detail",  es: "Detalle de habilidades", de: "Skill-Details", fr: "Détail des compétences", ar: "تفاصيل المهارات" },
  closeFilters: { en: "Close filters",  es: "Cerrar filtros", de: "Filter schließen", fr: "Fermer les filtres", ar: "إغلاق عوامل التصفية" },

  // Columns
  col_customerId: { en: "Customer ID", es: "ID de cliente", de: "Kunden-ID",   fr: "ID client",     ar: "معرّف العميل" },
  col_channel:    { en: "Channel",     es: "Canal",         de: "Kanal",        fr: "Canal",         ar: "القناة" },
  col_date:       { en: "Date",        es: "Fecha",         de: "Datum",        fr: "Date",          ar: "التاريخ" },
  col_agent:      { en: "Agent",       es: "Agente",        de: "Agent",        fr: "Agent",         ar: "الوكيل" },
  col_duration:   { en: "Duration",    es: "Duración",      de: "Dauer",        fr: "Durée",         ar: "المدة" },
  col_sentiment:  { en: "Sentiment",   es: "Sentimiento",   de: "Stimmung",     fr: "Sentiment",     ar: "المشاعر" },
  col_quality:    { en: "Quality",     es: "Calidad",       de: "Qualität",     fr: "Qualité",       ar: "الجودة" },
  col_skills:     { en: "Skills",      es: "Habilidades",   de: "Skills",       fr: "Compétences",   ar: "المهارات" },

  // Search attributes
  attr_customer: { en: "Customer ID",    es: "ID de cliente",   de: "Kunden-ID",      fr: "ID client",         ar: "معرّف العميل" },
  attr_agent:    { en: "Agent Name",     es: "Nombre del agente", de: "Agentenname",  fr: "Nom de l’agent",    ar: "اسم الوكيل" },
  attr_reason:   { en: "Contact Reason", es: "Motivo de contacto", de: "Kontaktgrund", fr: "Motif du contact", ar: "سبب التواصل" },

  // Sentiment
  sent_positive: { en: "Positive", es: "Positivo", de: "Positiv", fr: "Positif", ar: "إيجابي" },
  sent_neutral:  { en: "Neutral",  es: "Neutral",  de: "Neutral", fr: "Neutre",  ar: "محايد" },
  sent_negative: { en: "Negative", es: "Negativo", de: "Negativ", fr: "Négatif", ar: "سلبي" },
  sent_mixed:    { en: "Mixed",    es: "Mixto",    de: "Gemischt", fr: "Mitigé",  ar: "مختلط" },

  // Channels (a11y titles)
  ch_voice:    { en: "Voice call", es: "Llamada de voz", de: "Sprachanruf", fr: "Appel vocal", ar: "مكالمة صوتية" },
  ch_whatsapp: { en: "WhatsApp",   es: "WhatsApp",       de: "WhatsApp",    fr: "WhatsApp",    ar: "واتساب" },
  ch_sms:      { en: "SMS",        es: "SMS",            de: "SMS",         fr: "SMS",         ar: "رسالة نصية" },
  ch_email:    { en: "Email",      es: "Correo",         de: "E-Mail",      fr: "E-mail",      ar: "بريد إلكتروني" },

  // Skills popover
  sk_strengths: { en: "Strengths",        es: "Fortalezas",       de: "Stärken",            fr: "Points forts",      ar: "نقاط القوة" },
  sk_needs:     { en: "Needs Improvement", es: "Áreas de mejora", de: "Verbesserungsbedarf", fr: "À améliorer",       ar: "بحاجة إلى تحسين" },
  sk_coaching:  { en: "Coaching recommendation", es: "Recomendación de coaching", de: "Coaching-Empfehlung", fr: "Recommandation de coaching", ar: "توصية التدريب" },
  sk_top:       { en: "Top skill",        es: "Habilidad destacada", de: "Top-Skill",       fr: "Compétence clé",    ar: "أبرز مهارة" },
  sk_tracked:   { en: "Skills tracked",   es: "Habilidades seguidas", de: "Erfasste Skills", fr: "Compétences suivies", ar: "المهارات المتتبَّعة" },

  // Skill names (SKILL_REGISTRY)
  skill_building_rapport:        { en: "Building rapport",        es: "Generar confianza",        de: "Beziehung aufbauen",       fr: "Établir le lien",           ar: "بناء الألفة" },
  skill_uncovering_needs:        { en: "Uncovering needs",        es: "Descubrir necesidades",    de: "Bedürfnisse erkennen",     fr: "Cerner les besoins",        ar: "اكتشاف الاحتياجات" },
  skill_demonstrating_ownership: { en: "Demonstrating ownership", es: "Demostrar responsabilidad", de: "Verantwortung zeigen",     fr: "Faire preuve d’initiative", ar: "إظهار المسؤولية" },
  skill_expressing_empathy:      { en: "Expressing empathy",      es: "Expresar empatía",         de: "Empathie zeigen",          fr: "Exprimer de l’empathie",    ar: "التعبير عن التعاطف" },
  skill_communicating_clearly:   { en: "Communicating clearly",   es: "Comunicar con claridad",   de: "Klar kommunizieren",       fr: "Communiquer clairement",    ar: "التواصل بوضوح" },
  skill_problem_solving:         { en: "Problem solving",         es: "Resolución de problemas",  de: "Problemlösung",            fr: "Résolution de problèmes",   ar: "حل المشكلات" },

  // Filter sections
  fs_date:                 { en: "Date",                   es: "Fecha",                de: "Datum",                fr: "Date",                  ar: "التاريخ" },
  fs_coaching_recommendation: { en: "Coaching recommendation", es: "Recomendación de coaching", de: "Coaching-Empfehlung", fr: "Recommandation de coaching", ar: "توصية التدريب" },
  fs_business_category:    { en: "Business category",      es: "Categoría de negocio", de: "Geschäftskategorie",   fr: "Catégorie d’activité",  ar: "فئة العمل" },
  fs_strengths:            { en: "Strengths",              es: "Fortalezas",           de: "Stärken",              fr: "Points forts",          ar: "نقاط القوة" },
  fs_filter_name:          { en: "Filter name",            es: "Nombre de filtro",     de: "Filtername",           fr: "Nom de filtre",         ar: "اسم عامل التصفية" },
  fs_channel:              { en: "Channel",                es: "Canal",                de: "Kanal",                fr: "Canal",                 ar: "القناة" },
  fs_direction:            { en: "Direction",              es: "Dirección",            de: "Richtung",             fr: "Direction",             ar: "الاتجاه" },
  fs_workspaces:           { en: "Workspaces",             es: "Espacios de trabajo",  de: "Arbeitsbereiche",      fr: "Espaces de travail",    ar: "مساحات العمل" },
  fs_human_eval:           { en: "Human Eval",             es: "Evaluación humana",    de: "Manuelle Bewertung",   fr: "Évaluation humaine",    ar: "تقييم بشري" },

  // Filter options
  opt_today:         { en: "Today",          es: "Hoy",                de: "Heute",            fr: "Aujourd’hui",       ar: "اليوم" },
  opt_last_7_days:   { en: "Last 7 days",    es: "Últimos 7 días",     de: "Letzte 7 Tage",    fr: "7 derniers jours",  ar: "آخر 7 أيام" },
  opt_last_30_days:  { en: "Last 30 days",   es: "Últimos 30 días",    de: "Letzte 30 Tage",   fr: "30 derniers jours", ar: "آخر 30 يوماً" },
  opt_last_90_days:  { en: "Last 90 days",   es: "Últimos 90 días",    de: "Letzte 90 Tage",   fr: "90 derniers jours", ar: "آخر 90 يوماً" },
  opt_last_12_months:{ en: "Last 12 months", es: "Últimos 12 meses",   de: "Letzte 12 Monate", fr: "12 derniers mois",  ar: "آخر 12 شهراً" },
  opt_yes:           { en: "Yes",            es: "Sí",                 de: "Ja",               fr: "Oui",               ar: "نعم" },
  opt_no:            { en: "No",             es: "No",                 de: "Nein",             fr: "Non",               ar: "لا" },
};

export function lhI(id, key) {
  const row = INTERACTIONS[key];
  if (!row) return key;
  return row[id] ?? row.en;
}

// "Total {n} Interactions" — word order differs by locale, so build per id.
export function lhTotalInteractions(id, n) {
  // Western digits kept under Arabic to match the rest of the app's numerals.
  const num = n.toLocaleString(id === "ar" ? "en-US" : id);
  const T = {
    en: `Total ${num} Interactions`,
    es: `Total ${num} interacciones`,
    de: `Insgesamt ${num} Interaktionen`,
    fr: `Total ${num} interactions`,
    ar: `إجمالي ${num} تفاعل`,
  };
  return T[id] ?? T.en;
}

// "Page {p} of {total}".
export function lhPageOf(id, p, total) {
  const T = {
    en: `Page ${p} of ${total}`,
    es: `Página ${p} de ${total}`,
    de: `Seite ${p} von ${total}`,
    fr: `Page ${p} sur ${total}`,
    ar: `صفحة ${p} من ${total}`,
  };
  return T[id] ?? T.en;
}

// Agents tab — list table chrome + agent profile. Agent names, ids, emails
// and dates are data/proper nouns and stay in source.
const AGENTS = {
  title:            { en: "Agents",          es: "Agentes",            de: "Agenten",            fr: "Agents",             ar: "الوكلاء" },
  searchById:       { en: "Agent ID",        es: "ID de agente",       de: "Agenten-ID",         fr: "ID d’agent",         ar: "معرّف الوكيل" },
  searchByName:     { en: "Agent name",      es: "Nombre del agente",  de: "Agentenname",        fr: "Nom de l’agent",     ar: "اسم الوكيل" },
  searchPlaceholder:{ en: "Search by ID and name", es: "Buscar por ID y nombre", de: "Nach ID und Name suchen", fr: "Rechercher par ID et nom", ar: "البحث بالمعرّف والاسم" },
  sort:             { en: "Sort",            es: "Ordenar",            de: "Sortieren",          fr: "Trier",              ar: "ترتيب" },
  filter:           { en: "Filter",          es: "Filtrar",            de: "Filtern",            fr: "Filtrer",            ar: "تصفية" },
  col_agent:        { en: "Agents",          es: "Agentes",            de: "Agenten",            fr: "Agents",             ar: "الوكلاء" },
  col_lastRoleplay: { en: "Last Roleplay",   es: "Último juego de rol", de: "Letztes Rollenspiel", fr: "Dernier jeu de rôle", ar: "آخر تمثيل أدوار" },
  col_roleplays:    { en: "Roleplays",       es: "Juegos de rol",      de: "Rollenspiele",       fr: "Jeux de rôle",       ar: "تمثيلات الأدوار" },
  col_qaScore:      { en: "QA Score",        es: "Puntuación QA",      de: "QA-Score",           fr: "Score QA",           ar: "درجة الجودة" },
  col_missions:     { en: "Missions",        es: "Misiones",           de: "Missionen",          fr: "Missions",           ar: "المهام" },
  noAgents:         { en: "No agents found", es: "No se encontraron agentes", de: "Keine Agenten gefunden", fr: "Aucun agent trouvé", ar: "لم يُعثر على وكلاء" },
  na:               { en: "N/A",             es: "N/D",                de: "k. A.",              fr: "N/D",                ar: "غير متاح" },
  belowTarget:      { en: "Below target",    es: "Por debajo del objetivo", de: "Unter Ziel",    fr: "Sous l’objectif",    ar: "دون الهدف" },
  onTarget:         { en: "On target",       es: "En objetivo",        de: "Im Ziel",            fr: "Dans l’objectif",    ar: "ضمن الهدف" },
  readinessProfile: { en: "Readiness Profile", es: "Perfil de preparación", de: "Bereitschaftsprofil", fr: "Profil de préparation", ar: "ملف الجاهزية" },
  productionProfile:{ en: "Production Profile", es: "Perfil de producción", de: "Produktionsprofil", fr: "Profil de production", ar: "ملف الإنتاج" },
  agentProfile:     { en: "Agent Profile",   es: "Perfil del agente",  de: "Agentenprofil",      fr: "Profil de l’agent",  ar: "ملف الوكيل" },
};

export function lhA(id, key) {
  const row = AGENTS[key];
  if (!row) return key;
  return row[id] ?? row.en;
}

export function lhTotalAgents(id, n) {
  const num = n.toLocaleString(id === "ar" ? "en-US" : id);
  const T = {
    en: `Total ${num} Agents`, es: `Total ${num} agentes`, de: `Insgesamt ${num} Agenten`,
    fr: `Total ${num} agents`, ar: `إجمالي ${num} وكيل`,
  };
  return T[id] ?? T.en;
}

export function lhAssignedTo(id, name) {
  const T = {
    en: `Assigned to ${name}.`, es: `Asignado a ${name}.`, de: `Zugewiesen an ${name}.`,
    fr: `Attribué à ${name}.`,  ar: `تم التعيين إلى ${name}.`,
  };
  return T[id] ?? T.en;
}

export function lhMissionsSummary(id, below, total) {
  const T = {
    en: `Missions: ${below} of ${total} below target`,
    es: `Misiones: ${below} de ${total} por debajo del objetivo`,
    de: `Missionen: ${below} von ${total} unter Ziel`,
    fr: `Missions : ${below} sur ${total} sous l’objectif`,
    ar: `المهام: ${below} من ${total} دون الهدف`,
  };
  return T[id] ?? T.en;
}

// Persona-language option labels (Step 1 dropdown). Keyed on the canonical
// English value that stays in the wizard's stored state.
const LANGUAGE_NAME = {
  "English (UK)": { en: "English (UK)", es: "Inglés (Reino Unido)", de: "Englisch (UK)",  fr: "Anglais (R.-U.)",  ar: "الإنجليزية (المملكة المتحدة)" },
  "English (US)": { en: "English (US)", es: "Inglés (EE. UU.)",     de: "Englisch (USA)", fr: "Anglais (É.-U.)",  ar: "الإنجليزية (الولايات المتحدة)" },
  "Spanish":      { en: "Spanish",      es: "Español",              de: "Spanisch",       fr: "Espagnol",         ar: "الإسبانية" },
  "German":       { en: "German",       es: "Alemán",               de: "Deutsch",        fr: "Allemand",         ar: "الألمانية" },
  "French":       { en: "French",       es: "Francés",              de: "Französisch",    fr: "Français",         ar: "الفرنسية" },
};
export function lhLanguageName(id, value) {
  return LANGUAGE_NAME[value]?.[id] ?? value;
}

// Per-roleplay cap inline error (Step 2 §5). Localized template with the
// consumed/cap minutes interpolated; Western digits kept across locales.
export function lhCapError(id, cap, consumed) {
  const T = {
    en: `Cap (${cap} min) is below already-consumed (${consumed} min) for this month. Choose ≥${consumed} or wait until the next cycle.`,
    es: `El límite (${cap} min) es inferior a lo ya consumido (${consumed} min) este mes. Elija ≥${consumed} o espere al próximo ciclo.`,
    de: `Das Limit (${cap} Min.) liegt unter dem bereits verbrauchten Wert (${consumed} Min.) für diesen Monat. Wählen Sie ≥${consumed} oder warten Sie auf den nächsten Zyklus.`,
    fr: `Le plafond (${cap} min) est inférieur à ce qui est déjà consommé (${consumed} min) ce mois-ci. Choisissez ≥${consumed} ou attendez le prochain cycle.`,
    ar: `الحد (${cap} دقيقة) أقل من المستهلَك بالفعل (${consumed} دقيقة) لهذا الشهر. اختر ≥${consumed} أو انتظر حتى الدورة التالية.`,
  };
  return T[id] ?? T.en;
}
