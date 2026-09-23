# Agent login — journeys and screen inventory

**Design file:** Figma *Learning Hub* → page **🔥 Agent login** → section **Agent login — 2026-09-23**
<https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137981-627>
**Requirements contract:** [requirements.md](requirements.md) · **Source handoff:** [handoff-v3.md](handoff-v3.md)

The section follows the house journey-map format used on the *Assign drill* and
*Groups, Workspaces & Users* pages: a dark **Phase** banner per journey, a blue **Guard** card on the
left stating that journey's rule, 1440×900 screens laid left to right in the order the user meets
them, a `◀ IN / ▶ OUT` flow label above each screen, and a **WHAT HAPPENS / WHY** dev note below it.

Two deviations, both deliberate:

- **No connector arrows.** The Figma plugin API cannot create connector nodes, so routes are carried
  by the `◀ IN / ▶ OUT` flow labels. Draw the arrows by hand if the file needs them.
- **Amber IDEA / OPEN QUESTION notes** replace the dev note wherever the handoff does not specify the
  screen. Those screens are deliberately **blank dashed frames** carrying the idea of what belongs
  there, not a design.

---

## Journeys

| # | Journey | Who | Path | Phase |
|---|---|---|---|---|
| J1 | First sign-in with a temporary password | Agent (new) | S1 → S2-T → S3 → S4 → Learning Hub | [01](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137981-634) |
| J2 | Returning sign-in | Agent + email users | S1 → S2 → Learning Hub (tenant picker if multi-tenant) | [02](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137981-641) |
| J3 | Forgot password — recovery code | Agent | S2 → S5 → S6-R → signed in | [03](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137981-648) |
| J4 | Forgot password — email code | Email users | S2 → S5 → S6-E → signed in (existing; S5 copy only) | [04](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137981-655) |
| J5 | Lost or used all recovery codes | Agent + Admin | S6-R → (out of platform) → A1 → A2 → A3 → S1 → S2-T reset → S8-R → S4 → Learning Hub | [05](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137981-662) |
| J6 | 90-day password expiry | Agent | S1 → S2 → S8 → signed in | [06](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137981-669) |
| J0 / J7 | Email invitation, and 90-day expiry for email users | Email users | Existing, unchanged — reference only | [07](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137981-676) |
| — | Admin: Users page states and filters | Admin | A1 variants + the three new status filters | [08](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137981-683) |

J0 and J7 share one phase because neither is changed by this project; they are drawn as blanks so
the agent journeys can be read against them.

---

## Screen inventory

Status is the handoff's own label. **Existing** screens drawn here are reconstructions from the copy
tables — verify against the QA environment before building from them.

### J1 — First sign-in with a temporary password

| Screen | Status | Figma |
|---|---|---|
| S1 · Sign in — identifier | Changed | [137985:1658](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-1658) |
| S1a · No active account — Access Denied | Changed (toast copy) | [137985:1705](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-1705) |
| S2-T · Temporary password — first sign-in | New | [137985:1726](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-1726) |
| S2-Ta · Temporary password expired | New | [137985:1795](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-1795) |
| S3 · Welcome to DataOrb Hub! — create password | Changed | [137985:1858](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-1858) |
| S4 · Save your recovery codes | New | [137985:1968](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-1968) |
| S4a · Recovery codes copied — toast | New | [137985:2034](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-2034) |
| Learning Hub landing | **Blank — existing elsewhere** | [137985:2070](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-2070) |

### J2 — Returning sign-in

| Screen | Status | Figma |
|---|---|---|
| S1 · Sign in — identifier (same screen as J1) | Changed | [137985:127496](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-127496) |
| S2 · Sign in — password | Changed | [137985:127512](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-127512) |
| S2a · Wrong password — Login failed | Changed (toast copy) | [137985:127580](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-127580) |
| Tenant picker | **Blank — not specified** | [137985:127603](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-127603) |

### J3 — Forgot password with a recovery code

| Screen | Status | Figma |
|---|---|---|
| S2 · Forgot password? (entry) | Changed | [137985:127617](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-127617) |
| S5 · Forgot password — identifier | Changed | [137985:127635](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-127635) |
| S6-R · Reset password — recovery code | New | [137985:127683](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-127683) |
| S6-Ra · Invalid recovery code | New | [137985:127774](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-127774) |
| S6-Rb · All recovery codes used | New | [137985:127847](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-127847) |
| S6-Rc · Too many attempts | New | [137985:127940](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-127940) |
| Signed in — 4 or more codes left | **Blank + toast** | [137985:128028](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-128028) |
| Signed in — 3 or fewer codes left | **Blank + toast** | [137985:128044](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-128044) |

### J4 — Forgot password with an email code (existing)

| Screen | Status | Figma |
|---|---|---|
| S5 · Forgot password — email address entered | Changed | [137990:1075](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1075) |
| S6-E · Reset password — email verification code | Existing | [137990:1125](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1125) |
| S6-Ea · Invalid verification code | Existing | [137990:1219](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1219) |
| Signed in — password reset | **Blank + toast** | [137990:1288](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1288) |

### J5 — Lost or used all recovery codes (agent + admin)

| Screen | Status | Figma |
|---|---|---|
| S6-Rb · Dead end — all codes used | New | [137992:1239](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137992-1239) |
| A1 · Users page — No recovery codes left | Changed | [137992:1261](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137992-1261) |
| A2 · Issue a temporary password? — confirm | New | [137992:1580](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137992-1580) |
| A3 · Temporary password — shown once | New | [137992:1894](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137992-1894) |
| A3a · Temporary password copied — toast | New | [137992:2232](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137992-2232) |
| S2-T (reset) · Admin has reset your password | New | [137992:2432](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137992-2432) |
| S8-R · Reset password after a temporary password | New | [137992:2479](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137992-2479) |
| S4 (after reset) · New codes + reset toast | New | [137992:2532](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137992-2532) |

A1–A3 are built **on the real Users landing screen** cloned from the *Groups, Workspaces & Users*
page ([03 · Users landing](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137171-13869)),
not on a redrawn table — see open question 2.

### J6 — 90-day password expiry (agent)

| Screen | Status | Figma |
|---|---|---|
| S1 · Sign in — identifier | Changed | [137990:1304](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1304) |
| S2 · Sign in — password | Changed | [137990:1320](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1320) |
| S8 · Password expired — agent | Changed | [137990:1338](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1338) |
| Signed in — password reset | **Blank + toast** | [137990:1407](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1407) |

### J0 / J7 — Existing email-user journeys (reference only)

All four are deliberate blanks carrying the idea, not a design.

| Screen | Status | Figma |
|---|---|---|
| J0 · Invitation email | **Blank — outside this file** | [137990:1423](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1423) |
| J0 · Welcome to DataOrb Hub! (from the invitation link) | **Blank — same screen as S3** | [137990:1437](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1437) |
| J0 · Dashboard | **Blank — existing** | [137990:1451](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1451) |
| J7 · 90-day expiry for email users | **Blank — existing** | [137990:1465](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1465) |

### Admin — Users page states and filters

| Screen | Status | Figma |
|---|---|---|
| A1b · Temporary password issued (grey sub-label) | Changed | [137992:2568](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137992-2568) |
| A1c · Temporary password expired (red sub-label) | Changed | [137992:2853](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137992-2853) |
| A1d · Status filter — three new options | Changed | [137992:3139](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137992-3139) |
| A1e · Row menu — Issue temporary password | Changed | [137992:3431](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137992-3431) |

---

## Deliberate blanks

Every dashed frame is a screen the journey needs that the handoff does not specify, or one that
already exists elsewhere. Each carries the idea, and where relevant an open question.

| Blank | Idea recorded on the frame |
|---|---|
| Learning Hub landing (J1) | The existing agent homepage, in its post-activation state — first visit, nothing assigned, status just flipped to Enabled. Point at the "🔥 Agent homepage" page rather than redrawing it. |
| Tenant picker (J2) | A short list of tenants, most recently used first, shown between S2 and the hub. Agents are assumed single-tenant, so this may be an email-user-only surface. |
| Signed in — codes left (J3 ×2) | The hub with the codes-left toast; the second one names a "generate new codes" profile screen that does not exist yet. |
| Signed in — password reset (J4, J6) | The hub with the existing one-line success toast, no count. |
| J0 invitation email | The existing invitation email with Get Started. Lives outside this file; included so the agent path can be read against the email path. |
| J0 password setup | The same production screen as S3, reached from the invitation link, with Done instead of Continue and without the recovery-code line. |
| J0 dashboard | The existing email-user dashboard — the journey ends one screen earlier than the agent's. |
| J7 90-day expiry (email) | The existing reset screen with the verification code and Resend intact — the screen J6 is derived from. |

---

## Open questions

Also recorded on the **Open questions** board at the bottom of the Figma section.

1. **Status label for un-activated agent accounts** — *Pending Activation* or *INVITED*? Pending sign-off in the handoff; production calls the email-user equivalent "Invited". Affects A1, the three new filters, and the flip to Enabled on S4 Continue.
2. **The Users table in this file has no Status column** — the handoff hangs three sub-labels under a status pill, but the designed Users landing shows Name · Role · Email · Workspaces · Last active and no status. Either that table gains a Status column or the sub-labels need another home. They are parked under the last column in A1 so the states can be read.
3. **S4 primary button label** — "Continue" is the working label; final label TBD.
4. **"Generate new codes from your profile"** — the low-codes toast points at a profile screen that exists nowhere. Needs: where it lives, whether it reuses S4, whether it kills the remaining codes immediately, whether it re-asks for the password.
5. **Tenant picker** — no copy, no layout in the handoff. First decide whether a login-ID account can be multi-tenant at all.
6. **When does the 90-day clock start** — at import or at password creation on S3? If it runs from import, a newly imported agent can hit expiry on their first sign-in and J1 collides with J6.
7. **Where does first sign-in land** — the plain agent homepage, or a one-time welcome state?
8. **Issue temporary password for email users** — should the row-menu item appear for them too, given they already have Reset password by email?
9. **Two error strings marked new, to confirm** — "Passwords don't match." and "Your password doesn't meet all the requirements." are marked new with a note to check whether production already has them.
10. **Recovery-code economics** — 8 codes at issue, a warning at 3 or fewer, a dead end at 0. Nothing warns the agent between 8 and 3, and only a reset restores the set. Confirm this is intended.
