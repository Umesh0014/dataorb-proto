# Agent login — project knowledge

Drop-in knowledge pack for the DataOrb **Agent login** project: sign-in and password recovery for Learning
Hub users who hold a **login ID instead of an email address** (MasOrange / Konecta contact-centre agents).

**Design file:** Figma *Learning Hub* → page **🔥 Agent login** → section *Agent login — 2026-09-23*
<https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137981-627> — 47 screens across 8
journey rows, in the house journey-map format.

## What's in here

| File | What it is |
|---|---|
| `AGENT-LOGIN-KNOWLEDGE.md` | **Everything in one file.** Use this one if the project takes a single knowledge document. |
| `requirements.md` | The contract — R1–R23 functional, V1–V11 visual, D1–D5 content, C1–C10 constraints |
| `journeys.md` | The eight journeys, a screen-by-screen inventory with Figma node links, the deliberate blanks, and the open questions |
| `prototype-v4.md` | What the v4 prototype settles — chrome, type scale, layout patterns, tokens, sample data, extra states |
| `prototype-v4.html` | The prototype itself. Open in a browser; `←` / `→` step through every state |
| `production-reference.md` | What production does today, from the CEH admin user manual, and where it contradicts the brief |
| `handoff-v3.md` | Source 1, verbatim — the UX handoff with the full copy inventory |
| `user-manual-ceh-onboarding.md` | Source 3, text only (screenshots stripped) |

## The one-paragraph version

Agents are bulk-imported and handed a login ID and temporary password by a supervisor, never by email. No
inbox means no emailed verification code, so recovery runs on **eight one-time recovery codes** issued at
first sign-in (S4). When an agent runs out, the only way back is an admin **issuing a temporary password**
out of band (A1 → A2 → A3), which kills their current password and every remaining code. Email-user
journeys are untouched.

## Three sources, and which wins

1. **UX handoff v3** — authoritative for journeys, screens and the copy inventory / translation keys.
2. **Prototype v4** — authoritative for presentation. Newer than the handoff, so it wins on anything visual.
3. **CEH user manual** — what production does today. Where it contradicts 1 or 2, that is a **contradiction to
   resolve**, not a design decision.

## Before anyone builds from this

Twelve open questions are listed at the end of `journeys.md` and on the Open questions board in Figma. The
four that block work:

- **Which Users table is the truth** — three versions exist across the three sources, and the new status
  sub-labels and filters only work on a table that has a Status column.
- **How long a temporary password is valid** — never stated, yet three screens print it.
- **How an admin creates a single agent-login user** — production's New User requires an email address, and
  the bulk-import screen is designed nowhere.
- **CAPTCHA** — the manual says every user completes a CAPTCHA; the handoff says the hidden reCAPTCHA needs
  nothing from the user.

## Referencing this from a project's CLAUDE.md

```md
## Agent login
Knowledge lives in `knowledge/agent-login/`. Read `AGENT-LOGIN-KNOWLEDGE.md` before touching anything
auth-related; `requirements.md` is the contract and `journeys.md` maps every screen to its Figma node.
Do not resolve a contradiction between the three sources silently — they are listed as open questions.
```
