# Prototype v4 — what it settles

**File:** [prototype-v4.html](prototype-v4.html) (`dataorb_agent_login_v4.html`, supplied 2026-09-23)
**Relationship to the handoff:** the v3 handoff named `dataorb_agent_login_v3.html` as its companion but did
not ship it. v4 is the first prototype actually in hand, and it is **newer than the handoff**, so where the two
disagree on presentation, v4 wins; where they disagree on copy, the handoff's copy inventory is still the
translation source.

Open it in a browser: a left rail lists every state, `←` / `→` step through them, and each state is tagged
**existing / changed / new**.

## What it covers

| Journey | States in v4 |
|---|---|
| J1 · First sign-in | `s1-empty` · `s1-filled` · `s2t` · `s2t-expired` · `s3` · `s4` · `lh` |
| J2 · Returning sign-in | `s2` · `s2-fail` · `s1-denied` |
| J3 · Forgot password (recovery code) | `s5` · `s6r` · `s6r-invalid` · `s6r-ok` |
| J5 · Lost or used all codes | `s6r-exhausted` · `a1` · `a2` · `a3` · `a1-issued` · `s1-reset` · `s2t-reset` · `s8r` · `s4-reset` · `lh-reset` |
| J6 · 90-day expiry | `s8` · `s8-last3` |

**Not in v4:** J0 and J7 (the email-user journeys), J4 (email-code reset), the tenant picker, and the
"generate new codes from your profile" screen. The first three are unchanged existing flows; the last two
remain undesigned.

## Decisions it fixes (now reflected in Figma)

**Chrome**
- Login background is the production gradient — three soft radial washes (violet, blue, violet) over `#F6F5FB`, not a flat surface.
- Card: 400px wide, 460px for S4, 12px radius, soft drop shadow, no border. Padding 34 / 30 / 28.
- Heading and sub-header are centred; helpers, section labels and inline errors are left-aligned.
- The hidden reCAPTCHA badge sits bottom-right on every identifier/password screen.

**Type scale** (this is the real production scale — the first Figma pass was roughly twice as large)

| Role | v4 |
|---|---|
| Heading | 15px SemiBold |
| Sub-header, identifier line, links | 12px |
| Section label ("New Password") | 12px Medium, sentence case — **not** an uppercase eyebrow |
| Helper / note | 11px / 11.5px |
| Field value | 13px · field label 10.5px |
| Recovery code | 13.5px SemiBold mono, 1px letter-spacing, white chip on a `#F6F7FA` panel |

**Layout patterns**
- Single-action screens (S1, S2, S2-T, S5, S4) use a **full-width primary button**.
- Screens that also carry "Back to login" (S3, S6-R, S6-E, S8, S8-R) use an **actions row**: link left, compact button right.
- S3 puts First Name and Last Name **side by side**.
- Password Requirements is a **tooltip card beside the field** with green ticks, not an inline paragraph.

**Tokens**

`--blue #0B5CFF` · `--ink #1B1D29` · `--muted #6B7080` · `--line #D5D8E0` · `--err #D93025` · `--ok #1E8E5A` ·
`--toast #2B2D38` · disabled `#E4E6EB` on `#A3A8B5`.

**Sample data** — Konecta tenant, replacing the MasOrange placeholders used in the first pass:
`KON-AGT-10284`, Maria Rodriguez, workspace *Infancia_sevilla*, temporary password expiring *24 Sep 2026 at 18:00*.
Other rows: Diego Ruiz `-10285`, Lucia Fernández `-10286`, Ana García `-10287`.

## States v4 adds that the handoff did not describe

| State | What it adds |
|---|---|
| `s1-empty` | The landing state — empty field, **Continue disabled**. The disabled button is the only pre-submit validation signal. |
| `s8-last3` | Reused-password rejection on the expiry screen: field in error + "Password cannot be same as your last 3 passwords." Tagged *existing*. |
| `s6r-exhausted` note | Spells out that the agent contacts their admin through Slack or a supervisor — there is no in-app request. |
| `a1` note | **"Issue temporary password" is always in the row menu for agent-login users, because lost codes cannot be detected** — it only appears inline in red once the sub-label is red. |
| `a1` table | A Users table **with a Status column**: Name · Login ID / Email · Role · Status (pill + sub-label) · action, and the flagged row tinted amber. Filters are **chips above the table**, not a dropdown. |
| `s6r-ok` | The success toast counts **7** codes left (8 issued, 1 spent) — the arithmetic the handoff leaves implicit. |

## Where v4 and the design system disagree

- **Toast styling.** v4 splits failures (light red `#FDECEA`, red border, warning glyph) from successes (dark `#2B2D38`, green tick). The DataOrb `Snackbar` component used across the Figma file is the dark one only. Either the system gains an error variant or the prototype loses one.
- **A3 copy affordance.** v4 puts a copy icon inside the read-only field; the Figma screen uses an explicit **Copy** button next to it. The button is clearer at handoff size; not reconciled.
- **Users table.** v4's table is a clean mock, not the Users landing that exists in Figma. Both are now in the file (row 08) so the choice is visible rather than assumed.
