# Learning Ledgers

Per-agent and per-skill feedback logs. Each agent reads its own ledger before acting
and logs lessons after human feedback. When a pattern recurs 3 times, it promotes
into the agent's or skill's instruction file.

## Ledger files

| Ledger | Agent / Skill | Domain |
|--------|--------------|--------|
| `ux-researcher.md` | UX Researcher agent | Research quality, comparable relevance, anti-pattern accuracy |
| `product-manager.md` | Product Manager agent | Requirements completeness, direction quality, band variety |
| `head-of-product.md` | Head of Product agent | Context accuracy, Notion enrichment quality, JTBD framing |
| `product-owner.md` | Product Owner agent | Evaluation accuracy, minimalism calibration, self-evidence judgment |
| `design-evaluator.md` | Design Evaluator agent | Scoring calibration, gate accuracy, rubric interpretation |
| `product-brief.md` | /product-brief skill | Pipeline orchestration, handoff quality, checkpoint usefulness |
| `take-ticket.md` | /take-ticket skill | Build quality, variant fidelity, Notion sync reliability |

## Entry format

```markdown
### L-[NNN] · [Short title]
- **Date:** YYYY-MM-DD
- **Ticket:** [ticket slug or "general"]
- **What happened:** [specific mistake or missed pattern]
- **Root cause:** [why — the agent's blind spot, not just what went wrong]
- **Human feedback:** [exact quote or paraphrase of Umesh's correction]
- **Fix applied:** [what changed in behavior or output]
- **Recurrence count:** 1 | 2 | 3 → promoted
- **Status:** open | promoted | archived
```

## Promotion rules

1. Same root-cause pattern logged 3 times → promote into the agent/skill instruction file.
2. Promotion = add a concrete rule, constraint, or check to the agent's "Rules" or "How you work" section.
3. Mark all related entries `Status: promoted` with a link to the instruction change.
4. Quarterly: archive single-occurrence entries older than 90 days.
