// drillCards — mock data for the Drill page (Learning Hub) and the
// Drill Details page. Each card carries both list-view fields (mood,
// customer, title, description, category, difficulty) and detail-view
// fields (stats, agentBrief, persona, resolution).
//
// Body text intentionally written in the customer's likely native
// language; UI clamps long copy with ellipsis at the bottom of the card.

export const DRILL_CARDS = [
  {
    id: "david-evans",
    mood: "🙂",
    customer: "David Evans",
    title: "Inquiry about a mobile device upgrade",
    description:
      "You are speaking with David Evans, an existing customer. He is calling to inquire about upgrading his mobile device. He mentions he has been with the carrier for six years and wants to know which trade-in deals he qualifies for.",
    category: "Sales",
    difficulty: "Complex",

    totalInteractions: 1,
    averageDuration: "1m 51s",
    source: "A48AEB",
    agentBrief:
      "You are speaking with David Evans, an existing customer. He is calling to inquire about upgrading his mobile device. He mentions he has seen some offers and wants to know if they are still available. His records show he currently has a Samsung A52S.",
    contactReason: "Inquiry about a mobile device upgrade offer seen online",
    maxAllowedDuration: "5 mins",
    language: "English (UK)",
    characterOverview:
      "An informed and price-savvy customer who has done his research on a specific offer. He starts politely but becomes frustrated and dismissive when the company doesn't seem to honor an external advertisement. He is not afraid to quote competitors and will quickly threaten to churn if he feels he's being stonewalled.",
    currentSituation: [
      "Customer is calling to inquire about an offer for a 'Galaxy Stellar X Pro' that he saw advertised on Facebook for £4.90/month.",
      "He currently owns a Samsung A52S and is an existing Acme customer.",
      "The advert he saw mentioned the price was valid with his existing 15GB mobile tariff.",
      "He is aware of competitor offers, specifically mentioning a Movistar deal for a Galaxy S25 for £535.",
    ],
    goals: [
      "Secure the Galaxy Stellar X Pro at the £4.90/month price he saw advertised.",
      "Receive a clear, formal explanation if the offer cannot be honored.",
      "Obtain a comparable or better counter-offer that prevents him from switching to Movistar.",
      "Leave the call feeling the company has acted in good faith.",
    ],
    resolution: {
      ideal:
        "The agent finds a way to honor the £4.90/month price for the Galaxy Stellar X Pro, perhaps by applying a recurring loyalty credit that brings the standard financing cost down to that effective monthly rate.",
      minimum:
        "The agent explains why the Facebook offer is invalid (e.g., new customers only, marketing error), logs a formal complaint about misleading advertising, and offers a concrete gesture of goodwill (e.g., a £50 credit on the account) to retain the customer.",
      compromised:
        "The agent cannot match the £4.90 price but offers a significant loyalty discount on the standard £28.50/month financing for the Stellar X Pro (e.g., 50% off) OR offers a different, but still high-end, device at a heavily subsidized rate.",
    },
  },

  {
    id: "javier-sanz",
    mood: "😞",
    customer: "Javier Sanz",
    title: "Billing dispute over incorrect price after promotion",
    description:
      "Vas a hablar con Javier Sanz, un cliente que llama por una discrepancia en su factura. Afirma que renovó su oferta hace dos meses y que el precio cobrado no coincide con lo acordado. Quiere una explicación clara y un ajuste retroactivo.",
    category: "Retention",
    difficulty: "Complex",

    totalInteractions: 3,
    averageDuration: "3m 12s",
    source: "B71CDA",
    agentBrief:
      "Vas a hablar con Javier Sanz, cliente desde hace cuatro años. Llama por una factura cuyo importe es superior al acuerdo de renovación firmado hace dos meses. Afirma haber recibido confirmación por correo y exige un ajuste retroactivo más una explicación clara del error.",
    contactReason: "Discrepancia entre factura recibida y acuerdo de renovación",
    maxAllowedDuration: "6 mins",
    language: "Spanish (ES)",
    characterOverview:
      "Cliente meticuloso, conserva correos y justificantes. Empieza la llamada con tono firme pero correcto. Si percibe que se le está dando largas, pasa rápidamente a tono frío y menciona la posibilidad de cambiar de operador y de presentar reclamación formal.",
    currentSituation: [
      "Renovó su oferta hace dos meses con un cargo mensual acordado de €29,90.",
      "Su última factura muestra €38,50 sin un detalle claro del concepto adicional.",
      "Tiene el correo de confirmación de la renovación con el precio acordado.",
      "Ya ha contactado dos veces antes sin recibir una explicación coherente.",
    ],
    goals: [
      "Obtener un ajuste retroactivo por la diferencia cobrada en las dos últimas facturas.",
      "Recibir una explicación clara y por escrito del error.",
      "Confirmar por escrito el precio mensual correcto a partir de la próxima factura.",
      "Evitar tener que volver a llamar por el mismo motivo.",
    ],
    resolution: {
      ideal:
        "El agente identifica el error de facturación, aplica el ajuste retroactivo completo, confirma por correo el precio acordado y ofrece una compensación adicional por las molestias.",
      minimum:
        "El agente reconoce la incidencia, registra una reclamación formal, aplica el ajuste retroactivo y se compromete a una llamada de seguimiento dentro de 48 horas.",
      compromised:
        "El agente no puede aplicar el ajuste en la llamada pero abre una reclamación formal con número de referencia y compromiso de respuesta en cinco días, evitando que el cliente curse la portabilidad de inmediato.",
    },
  },

  {
    id: "klaus-schmidt",
    mood: "😞",
    customer: "Klaus Schmidt",
    title: "Inhaberwechsel für Mobilfunkleitung",
    description:
      "Sie sprechen mit Klaus Schmidt, einem Kunden, der sich meldet, nachdem er einen verdächtigen Anruf erhalten hat. Er ist zurückhaltend, möchte den Inhaberwechsel seiner Mobilfunkleitung prüfen und erwartet, dass alle Sicherheitsschritte sorgfältig erklärt werden.",
    category: "Service",
    difficulty: "Complex",

    totalInteractions: 2,
    averageDuration: "4m 03s",
    source: "C92EFB",
    agentBrief:
      "Sie sprechen mit Klaus Schmidt, einem langjährigen Privatkunden. Er meldet sich, weil er einen verdächtigen Anruf erhalten hat, in dem ein Inhaberwechsel seiner Mobilfunkleitung angekündigt wurde, den er nicht beauftragt hat. Er ist beunruhigt und erwartet eine sorgfältige Sicherheitsprüfung.",
    contactReason: "Mutmaßlich nicht autorisierter Inhaberwechsel",
    maxAllowedDuration: "8 mins",
    language: "German (DE)",
    characterOverview:
      "Sicherheitsbewusster Kunde, eher förmlich. Hört genau zu und verlangt klare, schrittweise Erklärungen. Akzeptiert keine Standardfloskeln und erwartet, dass jeder Identitätsschritt sauber begründet wird, bevor er Daten herausgibt.",
    currentSituation: [
      "Verdächtiger Anruf eines angeblichen Mitarbeiters mit Ankündigung eines Inhaberwechsels.",
      "Klaus hat keinen Inhaberwechsel beauftragt und keine schriftliche Bestätigung erhalten.",
      "Seine Vertragslaufzeit endet erst in elf Monaten.",
      "Er ist alleiniger Inhaber der Leitung und alleinige Kontaktperson auf dem Konto.",
    ],
    goals: [
      "Bestätigung erhalten, dass kein laufender Inhaberwechsel-Auftrag existiert.",
      "Sicherheitssperre auf dem Konto setzen lassen, bis alles geklärt ist.",
      "Klaren Eskalationsweg im Betrugsverdachtsfall genannt bekommen.",
      "Schriftliche Bestätigung der eingeleiteten Schritte.",
    ],
    resolution: {
      ideal:
        "Der Agent verifiziert die Identität sauber, prüft das System auf offene Aufträge, setzt eine Sicherheitssperre, eröffnet einen Betrugsfall mit Referenznummer und sendet die Bestätigung schriftlich.",
      minimum:
        "Der Agent bestätigt nach Identitätsprüfung, dass kein Inhaberwechsel-Auftrag offen ist, vermerkt den Vorfall und erklärt die Eskalationswege bei erneuten Versuchen.",
      compromised:
        "Der Agent kann die Sicherheitssperre nicht direkt setzen, leitet den Fall aber an die Sicherheitsabteilung weiter und stellt einen Rückruf innerhalb von 24 Stunden mit Referenznummer sicher.",
    },
  },

  {
    id: "amelie-dubois",
    mood: "🙂",
    customer: "Amélie Dubois",
    title: "Unexpected bill increase after promotion",
    description:
      "Vous allez parler à Amélie Dubois, une cliente qui appelle au sujet de sa dernière facture. Elle a remarqué une augmentation de prix qu'elle ne comprend pas et souhaite savoir si une promotion vient de se terminer. Elle reste polie et ouverte à une explication.",
    category: "Retention",
    difficulty: "Simple",

    totalInteractions: 0,
    averageDuration: "1m 28s",
    source: "D43FAC",
    agentBrief:
      "Vous allez parler à Amélie Dubois, cliente fidèle depuis plus de trois ans. Elle appelle au sujet d'une augmentation soudaine sur sa dernière facture qu'elle ne s'explique pas. Elle reste polie et cherche surtout une explication claire avant toute autre démarche.",
    contactReason: "Augmentation inattendue sur la dernière facture",
    maxAllowedDuration: "4 mins",
    language: "French (FR)",
    characterOverview:
      "Cliente posée, plutôt patiente, qui privilégie une explication factuelle à un geste commercial immédiat. Si la réponse est cohérente, elle accepte généralement la situation. En revanche, elle déteste être renvoyée d'un service à l'autre.",
    currentSituation: [
      "La facture du mois en cours est plus élevée d'environ 8 € par rapport au mois précédent.",
      "Elle ne se souvient pas d'avoir activé d'option supplémentaire.",
      "Sa promotion d'engagement de 12 mois s'est terminée le mois dernier.",
      "Elle reste ouverte à différentes options tant qu'on lui explique clairement la situation.",
    ],
    goals: [
      "Comprendre précisément pourquoi le montant a changé.",
      "Évaluer s'il existe une nouvelle offre adaptée à son usage.",
      "Éviter de passer à un autre opérateur si une solution raisonnable lui est proposée.",
      "Recevoir un récapitulatif clair de la nouvelle situation tarifaire.",
    ],
    resolution: {
      ideal:
        "L'agent explique clairement la fin de la promotion, propose une nouvelle remise fidélité ramenant la facture à un niveau proche du précédent, et envoie un récapitulatif écrit.",
      minimum:
        "L'agent explique la fin de la promotion, propose au moins un ajustement ponctuel ou une nouvelle option tarifaire, et confirme la situation par écrit.",
      compromised:
        "L'agent ne peut pas appliquer immédiatement de remise mais ouvre une demande de geste commercial avec engagement de réponse sous 48 h, ce qui suffit à la rassurer pour rester cliente.",
    },
  },

  {
    id: "oliver-sterling",
    mood: "🙂",
    customer: "Oliver Sterling",
    title: "Install workstation printer",
    description:
      "You are speaking with Oliver Sterling, a long-term employee who is struggling to set up a new printer on his company workstation. He is patient but unfamiliar with driver installation and would like step-by-step guidance.",
    category: "Technical Support",
    difficulty: "Simple",

    totalInteractions: 1,
    averageDuration: "2m 47s",
    source: "E58GHK",
    agentBrief:
      "You are speaking with Oliver Sterling, a long-term internal employee. He has just received a new desktop printer for his workstation but cannot complete the driver installation on his own. He is patient, willing to follow instructions, and prefers a guided walkthrough.",
    contactReason: "Workstation printer driver installation assistance",
    maxAllowedDuration: "5 mins",
    language: "English (US)",
    characterOverview:
      "Patient and friendly, comfortable saying when he doesn't understand. Prefers step-by-step instructions over technical jargon. Will follow guidance carefully but expects the agent to verify each step before moving on.",
    currentSituation: [
      "Received a new HP LaserJet printer for his desk this morning.",
      "Connected the USB cable but the workstation does not detect the device.",
      "Cannot install drivers from the manufacturer's site due to admin restrictions.",
      "Has a meeting in 30 minutes and would like to print the agenda before then.",
    ],
    goals: [
      "Get the printer installed and a test page printed before his meeting.",
      "Understand which steps he can take himself next time without calling.",
      "Avoid having to escalate the issue to on-site IT.",
      "Receive a brief written summary of what was changed on his machine.",
    ],
    resolution: {
      ideal:
        "The agent remotely pushes the printer driver, validates the installation with a test page, and emails Oliver a one-page summary of the change for his records.",
      minimum:
        "The agent walks Oliver through requesting elevated installation rights, schedules a follow-up call within the hour, and confirms the request ticket is in queue.",
      compromised:
        "The agent cannot install remotely or grant elevation but creates a high-priority on-site IT ticket and sets correct expectations on response time, with the printer flagged as urgent.",
    },
  },

  {
    id: "lucia-martin-garcia",
    mood: "😞",
    customer: "Lucía Martín García",
    title: "Price increase after promotion ended",
    description:
      "Atenderás a Lucía Martín García, una clienta cuyo descuento promocional de un año ha finalizado, resultando en un aumento de su cuota mensual. Está molesta y considera cambiar de operador si no se le ofrece una alternativa razonable.",
    category: "Retention",
    difficulty: "Complex",

    totalInteractions: 2,
    averageDuration: "3m 41s",
    source: "F22JKM",
    agentBrief:
      "Atenderás a Lucía Martín García, clienta de larga duración. Su descuento promocional de doce meses acaba de finalizar, lo que supone un aumento significativo en su cuota mensual. Llama claramente molesta y considera cambiar de operador si no se le ofrece una alternativa.",
    contactReason: "Fin del descuento promocional y aumento de cuota mensual",
    maxAllowedDuration: "7 mins",
    language: "Spanish (ES)",
    characterOverview:
      "Clienta exigente, conoce muy bien las ofertas del mercado y compara. Empieza la llamada con tono cortante. No tolera respuestas evasivas y valora especialmente que el agente reconozca su antigüedad antes de proponer cualquier solución.",
    currentSituation: [
      "Su descuento promocional del 50 % acaba de finalizar tras doce meses.",
      "El nuevo cargo mensual ha aumentado de €19,90 a €39,80.",
      "Tiene una oferta concreta de un competidor por €27 al mes con condiciones similares.",
      "Lleva más de seis años como clienta y nunca ha tenido impagos.",
    ],
    goals: [
      "Obtener una nueva tarifa cercana o igual al precio promocional anterior.",
      "Sentir que su antigüedad es reconocida y valorada.",
      "Evitar la fricción de portar el número a otro operador.",
      "Recibir confirmación escrita de la nueva tarifa y duración del beneficio.",
    ],
    resolution: {
      ideal:
        "El agente aplica un descuento de fidelización a doce meses que iguala o mejora la oferta del competidor, confirma el cambio por escrito y agradece explícitamente su antigüedad como clienta.",
      minimum:
        "El agente aplica un descuento parcial significativo durante seis meses, compromete una revisión a mitad de período y deja la propuesta por escrito.",
      compromised:
        "El agente no puede igualar el competidor pero ofrece un descuento puntual de tres meses y abre una solicitud de revisión personalizada para evitar que la portabilidad se ejecute esa misma semana.",
    },
  },

  {
    id: "andres-navarro",
    mood: "😞",
    customer: "Andrés Navarro",
    title: "Customer initiated portability to another carrier",
    description:
      "You are speaking with Andrés Navarro, a long-term customer who is calling back after noticing several missed calls from Acme. He has already initiated portability to another operator and wants to understand his options before the change becomes effective.",
    category: "Retention",
    difficulty: "Complex",

    totalInteractions: 4,
    averageDuration: "3m 55s",
    source: "G07LNP",
    agentBrief:
      "Atenderás a Andrés Navarro, cliente desde hace siete años. Ha iniciado la portabilidad a otro operador y devuelve la llamada tras varias llamadas perdidas de Acme. Quiere entender qué opciones tiene antes de que el cambio se haga efectivo en 48 horas.",
    contactReason: "Portabilidad ya iniciada hacia otro operador",
    maxAllowedDuration: "7 mins",
    language: "Spanish (ES)",
    characterOverview:
      "Cliente decidido, ya ha tomado la decisión racionalmente. Está dispuesto a escuchar pero no a perder tiempo. Valora el respeto y la franqueza; cualquier intento de retención percibido como manipulación lo cierra rápidamente.",
    currentSituation: [
      "Ha firmado la portabilidad hace tres días, fecha efectiva en 48 horas.",
      "Su decisión se basa en una oferta del competidor con menor precio y mejor cobertura en su zona.",
      "Le interesa mantener la portabilidad solo si Acme presenta una oferta claramente superior.",
      "Confirma que no tiene incidencias con la calidad del servicio actual, solo con el precio.",
    ],
    goals: [
      "Comparar de manera clara la oferta de Acme con la del competidor.",
      "Tomar una decisión informada antes de que la portabilidad sea efectiva.",
      "Evitar ser presionado o manipulado emocionalmente.",
      "Recibir cualquier oferta nueva por escrito en menos de 24 horas.",
    ],
    resolution: {
      ideal:
        "El agente cancela la portabilidad con consentimiento expreso del cliente tras presentar una oferta personalizada que mejora el precio del competidor y reconoce su antigüedad.",
      minimum:
        "El agente presenta la mejor oferta de retención disponible por escrito, deja al cliente decidir sin presión y confirma claramente los plazos para revertir la portabilidad si decide quedarse.",
      compromised:
        "El agente no logra retener al cliente pero cierra la conversación con una despedida correcta, registra el motivo de baja para revisión interna y deja la puerta abierta a un retorno futuro con un cupón de bienvenida.",
    },
  },

  {
    id: "gregory-vance",
    mood: "😠",
    customer: "Gregory Vance",
    title: "Missing iPhone 15 Delivery",
    description:
      "You are speaking with Gregory Vance, a long-term customer who is calling regarding a high-value hardware order (iPhone 15) that was supposed to be delivered four days ago. The tracking page still shows 'in transit' and he wants either an immediate replacement or a full refund.",
    category: "Service",
    difficulty: "Complex",

    totalInteractions: 5,
    averageDuration: "4m 18s",
    source: "H64QRS",
    agentBrief:
      "You are speaking with Gregory Vance, a long-term customer who placed a high-value hardware order (iPhone 15) eight days ago. Delivery was promised four days ago, tracking still shows 'in transit', and he has called multiple times without resolution. He is angry and demanding either immediate replacement or a full refund.",
    contactReason: "Undelivered high-value hardware order eight days after purchase",
    maxAllowedDuration: "8 mins",
    language: "English (US)",
    characterOverview:
      "Frustrated, articulate, and at the end of his patience after multiple unresolved calls. He listens but expects firm commitments, not apologies. Any further deflection or scripted language will make him escalate to social media or chargeback.",
    currentSituation: [
      "Order placed eight days ago for an iPhone 15 with two-day shipping.",
      "Promised delivery date was four days ago; tracking still shows 'in transit'.",
      "Has called Acme four times; each call promised a callback that did not happen.",
      "His existing phone is broken; he has been without a working device for the entire week.",
    ],
    goals: [
      "Receive either a confirmed replacement device on a guaranteed delivery date, or a full refund processed today.",
      "Get a single named point of contact accountable for the resolution.",
      "Avoid having to repeat the full story on any future call.",
      "Receive a tangible acknowledgment of the disruption (loaner device, credit, or both).",
    ],
    resolution: {
      ideal:
        "The agent immediately authorizes a replacement iPhone 15 dispatched same-day with overnight shipping, applies a meaningful service credit, and assigns a named owner with direct contact details.",
      minimum:
        "The agent processes a full refund within the call, confirms the refund timeline in writing, and offers a discount on a future hardware purchase to retain the customer.",
      compromised:
        "The agent cannot dispatch a same-day replacement but creates a priority escalation ticket with a 24-hour SLA, files a formal carrier investigation, and offers an interim service credit to acknowledge the disruption.",
    },
  },

  {
    id: "diana-sterling",
    mood: "😠",
    customer: "Diana Sterling",
    title: "Bypass AI for damage documentation",
    description:
      "You are dealing with a Zalando Plus member who received a damaged high-value silk shirt. She has already attempted to use the digital damage flow and was rejected by the automated check. She wants to escalate to a human reviewer.",
    category: "Service",
    difficulty: "Moderate",

    totalInteractions: 2,
    averageDuration: "3m 06s",
    source: "I11TVW",
    agentBrief:
      "You are dealing with Diana Sterling, a Zalando Plus member who received a damaged high-value silk shirt. She has already attempted the automated digital damage flow twice and was rejected both times. She is frustrated and wants to escalate to a human reviewer for a full refund.",
    contactReason: "Automated damage claim rejected on a high-value item",
    maxAllowedDuration: "5 mins",
    language: "English (UK)",
    characterOverview:
      "Articulate Plus member, comfortable with digital tools, frustrated specifically by being routed back into the same automated loop. She is reasonable when treated as a high-tier customer but reacts strongly to being told to retry the same digital flow.",
    currentSituation: [
      "Received a £180 silk shirt with a clear seam tear visible in submitted photos.",
      "Used the in-app damage flow twice; both attempts rejected by the automated check.",
      "Item was a gift purchase and the recipient's event is in three days.",
      "Plus membership is up for renewal next month and she is openly questioning its value.",
    ],
    goals: [
      "Have the damage claim reviewed by a human reviewer within the call.",
      "Receive a same-day refund or replacement decision.",
      "Avoid being asked to repeat the digital flow a third time.",
      "Get explicit acknowledgment of her Plus membership status.",
    ],
    resolution: {
      ideal:
        "The agent overrides the automated rejection on the spot, processes a full refund with a small Plus-tier goodwill credit, and confirms next steps via email.",
      minimum:
        "The agent escalates the case to a human reviewer with a 24-hour SLA, issues a provisional refund as a goodwill measure, and confirms the case reference by email.",
      compromised:
        "The agent cannot override the automated decision but routes the case to a senior reviewer with priority and offers a Plus-tier goodwill voucher to soften the experience while the case is processed.",
    },
  },
];
