# Agent login — complete project knowledge

*Single-file bundle, assembled 2026-09-23. Everything known about the DataOrb
Agent login project: the brief, the prototype, what production does today, the journey map, and what is
still undecided. Drop it into a project knowledge base as-is.*

**Design file:** Figma *Learning Hub* → page **🔥 Agent login** → section **Agent login — 2026-09-23**
<https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137981-627>

**Repo:** `docs/tickets/agent-login-flow/` on `Umesh0014/dataorb-proto`, branch `claude/practical-franklin-7xu8oi`

---

## What this project is

Sign-in and password recovery for Learning Hub users who hold a **login ID instead of an email address** —
MasOrange / Konecta contact-centre agents, created in bulk by an admin and handed their credentials by a
supervisor rather than by email.

Everything downstream follows from that one fact. No inbox means no emailed verification code, so recovery
runs on **eight one-time recovery codes** issued at first sign-in; when those run out the only way back in is
an admin **issuing a temporary password** out of band. The email-user journeys are untouched.

**Three sources, in order of authority for what they cover:**

| # | Source | Authoritative for |
|---|---|---|
| 1 | `INTERNAL_Agent_Login_Flow_UX_Handoff` v3 | Journeys, screen list, the copy inventory and translation keys |
| 2 | `dataorb_agent_login_v4.html` | Presentation — chrome, type scale, layout patterns, sample data, plus states the handoff never described |
| 3 | CEH User Manual — *User Onboarding for Contact Center Administrators* | What production actually does today (status vocabulary, row-menu actions, invitation mechanics) |

Where 1 and 2 disagree on presentation, **2 wins** (it is newer). Where either disagrees with 3, that is a
**contradiction to resolve, not a design decision** — they are listed under Open questions.

---

## Contents

1. Requirements contract — R / V / D / C
2. Journeys and screen inventory (with Figma node links)
3. Prototype v4 — what it settles
4. Production reference — CEH user onboarding
5. Source: handoff v3, verbatim
6. Source: CEH user manual, text only

---

# 1. Requirements contract

**Sources** (newest last; where they disagree, the disagreement is recorded rather than silently resolved):

1. `INTERNAL_Agent_Login_Flow_UX_Handoff` v3 — journeys, screens, copy inventory → handoff-v3.md (below)
2. `dataorb_agent_login_v4.html` — the clickable prototype; chrome, type scale, sample data, extra states → `prototype-v4.html` (shipped alongside this bundle), digested in prototype-v4.md (below)
3. *CEH User Manual: User Onboarding for Contact Center Administrators* — what production does today → production-reference.md (below)

**Design file:** Figma *Learning Hub* → page **🔥 Agent login** → section **Agent login — 2026-09-23**
<https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137981-627>
**Journey map + screen inventory:** journeys.md (below)

Scope: sign-in and password recovery for Learning Hub users who have a **login ID instead of an email
address** (MasOrange / Konecta contact-centre agents), plus the admin-side temporary-password flow that
unblocks them. Email-user journeys (J0, J4, J7) are in scope only as reference — the single copy change on S5
is the exception.

#### Functional requirements
- [ ] R1: **One identifier field** accepts either an email address or a login ID (S1, S2, S5). Continue is **disabled until the input is valid** — v4 `s1-empty` is the landing state.
- [ ] R2: Agents are created by **bulk import**; accounts that have never signed in show the invited status (label pending sign-off — see C5).
- [ ] R3: The login ID and temporary password reach the agent **outside the platform** (supervisor, Slack). No in-app delivery, no in-app request.
- [ ] R4: A login ID on a never-activated account routes to **S2-T** (temporary password), not to the normal password step.
- [ ] R5: The temporary password carries an **expiry date and time** in the agent's local time zone; expiry disables Continue and sends the agent back to the admin.
- [ ] R6: **S3** collects first and last name (pre-filled from the import, editable, **side by side**) plus the new password; the line under the heading carries the login ID where production shows the email address.
- [ ] R7: **S4** issues **8 recovery codes** in `XXXX-XXXX`, two columns of chips, shown once, with Copy codes and Download, and a confirmation checkbox that gates Continue.
- [ ] R8: If the agent leaves S4 before ticking the checkbox, a **new set is generated at the next sign-in** and S4 shows again.
- [ ] R9: **S5 routes on input format** — email address → S6-E (code sent), login ID → S6-R, neither → inline error.
- [ ] R10: **S6-R** takes one recovery code plus the new password. Each code works once. **No Resend.**
- [ ] R11: A successful recovery-code reset **signs the agent in** and toasts the remaining count (**7 after the first use**); at **3 or fewer** the toast adds "Generate new codes from your profile".
- [ ] R12: With **zero codes left**, S6-R shows the blocked message **when the screen opens** and disables every field.
- [ ] R13: Too many recovery-code attempts → **15-minute lockout**, with the wait named.
- [ ] R14: **90-day expiry (agent)** goes to **S8** with **no verification code** — the agent has just signed in with the current password.
- [ ] R15: **S8 rejects a reused password** ("Password cannot be same as your last 3 passwords.") — existing validation, shown by v4 as a field error plus a toast.
- [ ] R16: **A1 (Users page)** keeps the **Enabled** pill and adds a sub-label under it: *No recovery codes left* (red) · *Temporary password issued · Expires {date}* (grey) · *Temporary password expired* (red); plus an inline red link on red rows and **three new status filters**.
- [ ] R17: **Issue temporary password is always in the row menu** for agent-login users — lost codes cannot be detected — and appears inline in red only once the sub-label is red (v4 `a1` note).
- [ ] R18: The row menu sits beside the **existing** items from production: **Edit User** and **Re-Invite User**.
- [ ] R19: **A2** names the blast radius (current password *and* recovery codes stop working) and asks the admin to verify the request came from the named user, in a highlighted callout.
- [ ] R20: **A3** shows the temporary password **once**, read-only with a copy affordance, states the expiry, and toasts on Copy and on Done.
- [ ] R21: Issuing a temporary password **kills the current password and every remaining recovery code**.
- [ ] R22: After a reset the agent goes **S2-T (reset variant) → S8-R → S4 (new codes) → Learning Hub** with the toast *Your password has been reset.* — S8-R, not S3, because the account is already activated.
- [ ] R23: Email-user journeys **J0, J4, J7 are unchanged**; the only changes that land for them are the S5 copy and the S3 sub-header grammar fix.

#### Visual / layout requirements
- [ ] V1: Auth screens sit on the **production login background** — three soft radial washes over `#F6F5FB`.
- [ ] V2: Card is **400px** wide (**460px** for S4), 12px radius, soft drop shadow, no border; padding 34 / 30 / 28.
- [ ] V3: **v4 type scale** — heading 15px SemiBold, sub-header and links 12px, section label 12px Medium in sentence case, helper 11px, note 11.5px, recovery code 13.5px mono.
- [ ] V4: Heading and sub-header **centred**; helpers, section labels and errors **left**.
- [ ] V5: Single-action screens use a **full-width primary button**; screens carrying "Back to login" use an **actions row** (link left, compact button right).
- [ ] V6: **Password Requirements is a tooltip card beside the field** with green ticks, not an inline paragraph.
- [ ] V7: The **hidden reCAPTCHA badge** sits bottom-right on identifier and password screens (but see C10).
- [ ] V8: The A1 status **pill stays Enabled**; the new state is carried by a sub-label, never by changing the pill.
- [ ] V9: Error pattern is split deliberately — **format and state errors inline** at the field, **submit failures as toasts** with Close.
- [ ] V10: The existing **Password Requirements** content is unchanged (8 characters · upper and lower case · 1 digit · 1 special character).
- [ ] V11: **S2-T has two copy variants** on one layout — first sign-in and reset — differing only in heading and sub-header.

#### Content / copy requirements
- [ ] D1: Ship against the handoff's **copy inventory** (`auth.*`, `admin.*`), respecting each key's status: *existing* (do not re-translate) · *changed* (same key, new English) · *new*.
- [ ] D2: Counts use **ICU plurals**: `{count, plural, one {# recovery code} other {# recovery codes}}`.
- [ ] D3: **Do not translate:** DataOrb, Learning Hub, `XXXX-XXXX`.
- [ ] D4: Dates and times are **formatted by the backend** for the user's locale; the temporary-password expiry renders in the user's own time zone.
- [ ] D5: Demo data follows v4 — Konecta, `KON-AGT-10284`, Maria Rodriguez, workspace *Infancia_sevilla*.

#### Constraints / out of scope
- C1: **No in-app request** for a temporary password — the agent contacts the admin through their usual channel.
- C2: Disabled, revoked and unknown accounts all return the same **Access Denied** copy — do not differentiate.
- C3: **Review the QA environment** alongside these documents before treating any "existing" screen as specified.
- C4: Production status vocabulary is **Invited → Enabled**, and **Disabled** after Revoke Access (user manual).
- C5: The handoff's **Pending Activation / INVITED** label is *not signed off*; C4 makes "Invited" the likely answer.
- C6: The **S4 primary button label** is a working label in both the handoff and v4 — final label TBD.
- C7: The prototype is **v4** (`prototype-v4.html`), supplied 2026-09-23. The v3 prototype the handoff named was never supplied.
- C8: This is a **design/knowledge project** — no code in this repo implements the auth flow, and none was written for it.
- C9: **Bulk import itself is undesigned** — no screen exists for importing agents, for a partial failure, or for creating a single login-ID user (production's New User requires an Email ID).
- C10: **CAPTCHA is contested** — the manual says all users must complete CAPTCHA verification; the handoff says the hidden reCAPTCHA v3 needs nothing from the user. Resolve before build.


---

# 2. Journeys and screen inventory

**Design file:** Figma *Learning Hub* → page **🔥 Agent login** → section **Agent login — 2026-09-23**
<https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137981-627>
**Requirements contract:** requirements.md (below)
**Sources:** handoff-v3.md (below) (journeys + copy) · prototype-v4.md (below) / `prototype-v4.html` (shipped alongside this bundle) (chrome, type scale, extra states) · production-reference.md (below) (what production does today)

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

### Journeys

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

### Screen inventory

Status is the handoff's own label. **Existing** screens drawn here are reconstructions from the copy
tables — verify against the QA environment before building from them.

#### J1 — First sign-in with a temporary password

| Screen | Status | Figma |
|---|---|---|
| S1 · Sign in — step 1 (empty), Continue disabled | Changed | [138010:2200](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=138010-2200) |
| S1 · Login ID entered | Changed | [137985:1658](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-1658) |
| S1a · No active account — Access Denied | Changed (toast copy) | [137985:1705](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-1705) |
| S2-T · Temporary password — first sign-in | New | [137985:1726](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-1726) |
| S2-Ta · Temporary password expired | New | [137985:1795](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-1795) |
| S3 · Welcome to DataOrb Hub! — create password | Changed | [137985:1858](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-1858) |
| S4 · Save your recovery codes | New | [137985:1968](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-1968) |
| S4a · Recovery codes copied — toast | New | [137985:2034](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-2034) |
| Learning Hub landing | **Blank — existing elsewhere** | [137985:2070](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-2070) |

#### J2 — Returning sign-in

| Screen | Status | Figma |
|---|---|---|
| S1 · Sign in — identifier (same screen as J1) | Changed | [137985:127496](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-127496) |
| S2 · Sign in — password | Changed | [137985:127512](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-127512) |
| S2a · Wrong password — Login failed | Changed (toast copy) | [137985:127580](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-127580) |
| Tenant picker | **Blank — not specified** | [137985:127603](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137985-127603) |

#### J3 — Forgot password with a recovery code

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

#### J4 — Forgot password with an email code (existing)

| Screen | Status | Figma |
|---|---|---|
| S5 · Forgot password — email address entered | Changed | [137990:1075](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1075) |
| S6-E · Reset password — email verification code | Existing | [137990:1125](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1125) |
| S6-Ea · Invalid verification code | Existing | [137990:1219](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1219) |
| Signed in — password reset | **Blank + toast** | [137990:1288](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1288) |

#### J5 — Lost or used all recovery codes (agent + admin)

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
not on a redrawn table. v4 proposes a different table with a real Status column, built alongside it in row 08 — see
open question 1. The row menu follows the CEH user manual: **Edit User · Re-Invite User · Issue temporary password**.

#### J6 — 90-day password expiry (agent)

| Screen | Status | Figma |
|---|---|---|
| S1 · Sign in — identifier | Changed | [137990:1304](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1304) |
| S2 · Sign in — password | Changed | [137990:1320](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1320) |
| S8 · Password expired — agent | Changed | [137990:1338](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1338) |
| S8a · Reused password — last 3 | Existing | [138010:2274](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=138010-2274) |
| Signed in — password reset | **Blank + toast** | [137990:1407](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1407) |

#### J0 / J7 — Existing email-user journeys (reference only)

All four are deliberate blanks carrying the idea, not a design.

| Screen | Status | Figma |
|---|---|---|
| J0 · Invitation email | **Blank — outside this file** | [137990:1423](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1423) |
| J0 · Welcome to DataOrb Hub! (from the invitation link) | **Blank — same screen as S3** | [137990:1437](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1437) |
| J0 · Dashboard | **Blank — existing** | [137990:1451](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1451) |
| J7 · 90-day expiry for email users | **Blank — existing** | [137990:1465](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137990-1465) |

#### Admin — Users page states and filters

| Screen | Status | Figma |
|---|---|---|
| A1b · Temporary password issued (grey sub-label) | Changed | [137992:2568](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137992-2568) |
| A1c · Temporary password expired (red sub-label) | Changed | [137992:2853](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137992-2853) |
| A1d · Status filter — three new options | Changed | [137992:3139](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137992-3139) |
| A1e · Row menu — Edit User · Re-Invite User · Issue temporary password | Changed | [137992:3431](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137992-3431) |
| A1 (v4) · Users table with a Status column — **proposal** | Changed | [138010:2354](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=138010-2354) |

---

### Deliberate blanks

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

### What the sources settle

Recorded on the **Open questions** board at the bottom of the Figma section.

- **Status label — narrowed.** The CEH user manual is explicit that production runs **Invited → Enabled**, and **Disabled** after Revoke Access. The handoff's "Pending Activation / INVITED" is almost certainly just *Invited*. Still needs the sign-off the handoff asks for, but it is no longer a guess.
- **The admin row menu — answered.** Production has **Edit User** and **Re-Invite User** (for users still showing Invited, confirmed by an "Invitation Sent!" pop-up). *Issue temporary password* is a third item beside them. Open only: whether it replaces Re-Invite User for login-ID accounts, which have no inbox.
- **Where first sign-in lands — partly answered.** v4 mocks it as the Learning Hub landing reading "3 assigned personas / 0 completed" — the normal agent homepage in its first-visit state, not a bespoke welcome screen.

### Open questions

1. **Which Users table is the truth.** Three versions now exist: the Users landing designed on the *Groups, Workspaces & Users* page (Name · Role · Email · Workspaces · Last active), v4's proposal (Name · Login ID / Email · Role · Status · action), and the CEH manual's Settings → User Management → Users. The sub-labels and the three new filters only work on a table with a Status column. Both candidates sit in row 08 so the choice is visible.
2. **How long is a temporary password valid.** Never stated. v4 shows next-day 18:00; the manual's email precedent is a 30-day invitation link. S2-T, A1 and A3 all print the value, so it needs a number.
3. **How does an admin create one agent-login user.** Production's New User requires an Email ID; the handoff only describes bulk import, and the import screen — plus its partial-failure state — is designed nowhere.
4. **CAPTCHA — the sources disagree.** The manual says all users must complete CAPTCHA verification; the handoff says the hidden reCAPTCHA v3 needs nothing from the user. If production shows an interactive challenge, S1 gains a step.
5. **Error-toast style.** v4 splits failures (light red, bordered) from successes (dark with a green tick); the DataOrb `Snackbar` in this file is dark-only. Either the system gains an error variant or the prototype loses one.
6. **S4 primary button label.** "Continue" is still the working label in both sources; final label TBD.
7. **Generate new codes from your profile.** The low-codes toast still points at a profile screen that exists in neither source.
8. **Tenant picker.** Still unspecified and absent from v4. First decide whether a login-ID account can be multi-tenant at all.
9. **When does the 90-day clock start.** At import or at password creation on S3? If it runs from import, a newly imported agent can hit expiry on their first sign-in and J1 collides with J6.
10. **Two error strings marked new, to confirm.** "Passwords don't match." and "Your password doesn't meet all the requirements."
11. **Recovery-code economics.** Eight codes at issue, a warning at three or fewer, a dead end at zero. Nothing warns the agent between eight and three, and only an admin reset restores the set.
12. **Revoking an agent-login user.** Production emails the user on revoke. An agent with no email address cannot be told — decide whether that matters.


---

# 3. Prototype v4 — what it settles

**File:** `prototype-v4.html` (shipped alongside this bundle) (`dataorb_agent_login_v4.html`, supplied 2026-09-23)
**Relationship to the handoff:** the v3 handoff named `dataorb_agent_login_v3.html` as its companion but did
not ship it. v4 is the first prototype actually in hand, and it is **newer than the handoff**, so where the two
disagree on presentation, v4 wins; where they disagree on copy, the handoff's copy inventory is still the
translation source.

Open it in a browser: a left rail lists every state, `←` / `→` step through them, and each state is tagged
**existing / changed / new**.

### What it covers

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

### Decisions it fixes (now reflected in Figma)

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

### States v4 adds that the handoff did not describe

| State | What it adds |
|---|---|
| `s1-empty` | The landing state — empty field, **Continue disabled**. The disabled button is the only pre-submit validation signal. |
| `s8-last3` | Reused-password rejection on the expiry screen: field in error + "Password cannot be same as your last 3 passwords." Tagged *existing*. |
| `s6r-exhausted` note | Spells out that the agent contacts their admin through Slack or a supervisor — there is no in-app request. |
| `a1` note | **"Issue temporary password" is always in the row menu for agent-login users, because lost codes cannot be detected** — it only appears inline in red once the sub-label is red. |
| `a1` table | A Users table **with a Status column**: Name · Login ID / Email · Role · Status (pill + sub-label) · action, and the flagged row tinted amber. Filters are **chips above the table**, not a dropdown. |
| `s6r-ok` | The success toast counts **7** codes left (8 issued, 1 spent) — the arithmetic the handoff leaves implicit. |

### Where v4 and the design system disagree

- **Toast styling.** v4 splits failures (light red `#FDECEA`, red border, warning glyph) from successes (dark `#2B2D38`, green tick). The DataOrb `Snackbar` component used across the Figma file is the dark one only. Either the system gains an error variant or the prototype loses one.
- **A3 copy affordance.** v4 puts a copy icon inside the read-only field; the Figma screen uses an explicit **Copy** button next to it. The button is clearer at handoff size; not reconciled.
- **Users table.** v4's table is a clean mock, not the Users landing that exists in Figma. Both are now in the file (row 08) so the choice is visible rather than assumed.


---

# 4. Production reference — CEH user onboarding

**Source:** *External User Manual: Customer Engagement Hub (CEH) — User Onboarding for Contact Center
Administrators* (supplied 2026-09-23). This is one of the documents the v3 handoff told the design team to
review before treating any "existing" screen as specified. The original is image-heavy; the text is
summarised here and the substance kept verbatim where it is a fact we design against.

**This is what production does today, for email users.** Everything the agent-login project adds sits beside
it, so anything below that contradicts the handoff is worth resolving before build.

### The existing admin flow

1. **Settings → User Management → Users** — the Users module is the entry point.
2. **"+ New Users"** opens user creation.
3. Required fields: **Email ID, First Name, Last Name**, plus a **User Role**:
   - **Admin** — manages workspaces and users, sees all data
   - **Manager** — sees their own agents and teams, creates and publishes scorecards and QA assignments
   - **Evaluator** — completes QA evaluations, provides insights, assists coaching
   - **Analyst** — org-wide or team reporting, analytics and search
4. Role-specific permissions: **Workspace Access** (managers see only their workspace's agents), **Audio Player**, **Ask Mira**, and **Agent Data Masking** (hides agent name / email fields) for evaluator and analyst roles.
5. **"Add User"** enables once required fields are complete; a confirmation notification appears.
6. The new user's status shows as **Invited**.
7. The user receives an **email invitation with a secure onboarding link that expires after 30 days**, clicks **Get Started** (or pastes the URL), lands on the CEH password setup screen, meets the requirements shown via an info icon, clicks **Done**, and is redirected to the CEH Pulse contact-centre dashboard.
8. Status changes from **Invited** to **Enabled**.

### Facts we design against

| Fact | Where it bites |
|---|---|
| Status vocabulary is **Invited → Enabled**, and **Disabled** after Revoke Access | The handoff's "Pending Activation / INVITED" label, still unsigned-off, almost certainly resolves to **Invited** |
| **Re-Invite User** exists in the row's three-dot menu for users still showing Invited, confirmed by an **"Invitation Sent!"** pop-up | This is the existing precedent for "Issue temporary password" — same shape of action, same place in the UI. A1e now shows the three items together |
| **Invitation links expire after 30 days** | The email-side precedent for the temporary-password expiry, which no source has given a duration for |
| Expired link → the user **contacts the Tenant Admin**, who searches the Users list, confirms status is Invited, opens the row menu and re-invites | Structurally identical to J5: out-of-band request, admin re-issues. The agent journey is the same play without an inbox |
| **Revoking access** is a toggle inside Edit User; the user gets an email and the status becomes Disabled | Confirms an agent-login user with no email address cannot be notified of a revoke — worth flagging |
| Login URL is **https://ceh.dataorb.ai/login** | Used on the S1 flow label |
| **"All users must complete CAPTCHA verification for enhanced security"** | **Contradicts** the handoff's "hidden reCAPTCHA v3 … nothing for the user to do". If production shows an interactive challenge, S1 gains a step |
| Roles here are Admin / Manager / Evaluator / Analyst — **no agent or learner role** | CEH user management and the Learning Hub Users page are different surfaces. The handoff's A1 is the Learning Hub one, whose rows are Learner / Trainee / Supervisor |
| New user creation **requires an Email ID** | There is no path for creating a single login-ID user. Agents arrive only by bulk import, and the import screen is designed nowhere |

### Troubleshooting content worth keeping

- No invitation email → check spam, verify the address, resend from the user list.
- Cannot complete password setup → check the requirements tooltip, check the link has not expired.
- Change permissions later → **Edit User** from the user list; changes take effect immediately.

The agent-login equivalents of the first two do not exist: an agent with no inbox cannot "check spam", and a
temporary password cannot be resent by the system. Both collapse into the same answer — contact the admin —
which is exactly what S2-T and S6-R say.


---

# 5. Source — UX handoff v3 (verbatim)

*For: Umesh and the design team & Tech team |*   
*Companion: `dataorb_agent_login_v3.html` (prototype)*  
---

### 1\. Purpose

**DESIGN TEAM — REVIEW THE EXISTING FLOW ON THE QA ENVIRONMENT AND THE ATTACHED DOCUMENTS / USER MANUALS FOR REFERENCE.**

This handoff covers sign-in and password recovery for Learning Hub users who have a **login ID instead of an email address**, such as MasOrange contact-center agents.

- **How they get in.** The admin creates these users through bulk import and shares a login ID and temporary password with each agent.  
- **First sign-in.** The agent sets a permanent password and saves recovery codes.  
- **Password recovery.** Recovery codes replace the emailed verification code. If an agent has lost or used all their codes, they contact their admin through their usual channel, and the admin issues a temporary password from the Users page.

**Status label:** agent accounts that haven't signed in yet show **Pending Activation/INVITED**. This label is still pending sign-off. The production equivalent for email users is "Invited".

---

### 2\. User journeys

| \# | Journey | Who | Path |
| :---- | :---- | :---- | :---- |
| J0 | Email invitation and first sign-in | Email users | Invitation email → Get Started → Welcome to DataOrb Hub\! → dashboard. **Existing, unchanged.** |
| J1 | First sign-in with a temporary password | Agent (new) | S1 → S2-T → S3 → S4 → Learning Hub |
| J2 | Returning sign-in | Agent, email users | S1 → S2 → Learning Hub (tenant picker if the user has more than one tenant) |
| J3 | Forgot password (recovery code) | Agent | S2 → S5 → S6-R → signed in |
| J4 | Forgot password (email code) | Email users | S2 → S5 → S6-E → signed in. **Existing, copy change on S5 only.** |
| J5 | Lost or used all recovery codes | Agent \+ Admin | S6-R → agent contacts admin → A1 → A2 → A3 → S1 → S2-T (reset) → S8-R → S4 → Learning Hub |
| J6 | 90-day password expiry | Agent | S1 → S2 → S8 → signed in |
| J7 | 90-day password expiry | Email users | Existing verification-code flow, unchanged |

#### J1 — First sign-in with a temporary password (agent)

1. The admin bulk-imports the agent. The status is **Pending Activation**.  
2. The admin shares the agent's login ID and temporary password outside the platform (for example, through a supervisor).  
3. **S1:** The agent enters the login ID and selects **Continue**.  
4. **S2-T:** The system recognises a login ID for an account that hasn't been activated, and shows the temporary-password step. The agent enters the temporary password and selects **Continue**.  
5. **S3:** The agent confirms their first and last name and creates a new password.  
6. **S4:** The agent saves the recovery codes, ticks the confirmation checkbox and selects **Continue**.  
7. The agent lands on Learning Hub. The status changes from Pending Activation to **Enabled**.

#### J3 — Forgot password with a recovery code (agent)

1. **S2:** The agent selects **Forgot password?**  
2. **S5:** The identifier is pre-filled. The agent selects **Continue**.  
3. **S6-R:** The agent enters a recovery code and a new password, then selects **Done**.  
4. The agent is signed in and sees a toast with the number of recovery codes left.

#### J5 — Lost or used all recovery codes (agent \+ admin)

1. **S5 → S6-R:** The agent can't reset the password because they've lost their recovery codes or used them all.  
2. The agent contacts their admin through their usual channel (for example, Slack or their supervisor). There is no in-app request.  
3. **A1:** The admin searches for the agent on the Users page. If the agent has used all their codes, the row shows **No recovery codes left** in red.  
4. **A2:** The admin selects **Issue temporary password** and confirms.  
5. **A3:** The temporary password appears once. The admin copies it and shares it with the agent outside the platform. The agent's current password and recovery codes stop working.  
6. **S1 → S2-T (reset):** The agent signs in with their login ID and the temporary password.  
7. **S8-R:** The agent creates a new password.  
8. **S4:** The agent saves a new set of recovery codes and continues to the Learning Hub.

#### J6 — 90-day password expiry (agent)

1. **S1 → S2:** The agent signs in with their current password.  
2. **S8:** The system shows the expired-password screen. No verification code is needed, because the agent has just signed in with their current password.  
3. The agent creates a new password and selects **Done**, then is signed in.

---

### 3\. Screens

Screen status: **Existing** (reused as-is), **Changed** (existing screen with copy changes), **New**.

#### S1 — Sign in, step 1 (identifier) · Changed

Layout: existing production card. One field and one button only.

| Element | Copy |
| :---- | :---- |
| Heading | Sign in to DataOrb |
| Sub-header | To get started, enter your email address or login ID |
| Field label | Email Address or Login ID |
| Primary button | Continue (enabled once the input is a valid email address or login ID) |

**Validation**

| Case | Copy |
| :---- | :---- |
| Input is not a valid email address or login ID | Enter a valid email address or login ID. |
| No active account found (toast) | **Access Denied** — The account you signed in with {identifier} does not have access to DataOrb. |

- The hidden reCAPTCHA v3 stays as it is; there is nothing for the user to do.  
- A disabled or revoked account also shows **Access Denied**, matching production.

#### S2 — Sign in, step 2 (password) · Changed

Layout: existing production card. Shown to email users and to agents whose accounts are activated.

| Element | Copy |
| :---- | :---- |
| Heading | Sign in to DataOrb |
| Sub-header | Please enter your password to sign in |
| Read-only field label | Email Address or Login ID |
| Field label | Password (with show/hide icon) |
| Link | Forgot password? |
| Primary button | Sign In (enabled once a password is entered) |
| Secondary link | Back |

**Validation**

| Case | Copy |
| :---- | :---- |
| Wrong password (toast) | Login failed\! Incorrect email/login ID or password — with **Close** |
| Password older than 90 days | Redirect to S8 (agent) or the existing reset screen (email user) |
| User has access to more than one tenant | Existing tenant picker |

#### S2-T — Sign in, step 2 (temporary password) · New

Layout: same card as S2. Shown only when the identifier is a login ID **and** the account must sign in with a temporary password. There are two copy variants: first sign-in (below) and reset (after the admin issues a temporary password).

| Element | Copy |
| :---- | :---- |
| Heading | Welcome to DataOrb |
| Sub-header | This is your first sign-in. Enter the temporary password your admin shared with you. |
| Read-only field label | Login ID |
| Field label | Temporary Password (with show/hide icon) |
| Helper text | Your temporary password expires on {expiryDate} at {expiryTime}. |
| Primary button | Continue |
| Secondary link | Back |
| Help text (replaces "Forgot password?") | Don't have a temporary password? Contact your admin. |

**Validation**

| Case | Copy |
| :---- | :---- |
| Wrong temporary password (toast) | Login failed\! Incorrect temporary password — with **Close** |
| Temporary password expired | Your temporary password has expired. Contact your admin for a new one. |

- Show the expiry date and time in the user's local time zone.

**Reset variant** (account already activated; admin issued a temporary password in A3):

| Element | Copy |
| :---- | :---- |
| Heading | Sign in to DataOrb |
| Sub-header | Your admin has reset your password. Enter the temporary password they shared with you. |
| Read-only field label | Login ID |
| Field label | Temporary Password (with show/hide icon) |
| Helper text | Your temporary password expires on {expiryDate} at {expiryTime}. |
| Primary button | Continue |
| Secondary link | Back |
| Help text | Don't have a temporary password? Contact your admin. |

After **Continue**, the reset variant goes to **S8-R**, not S3.

#### S3 — Welcome to DataOrb Hub\! (create password) · Changed

Layout: the existing production password setup screen from user onboarding step 6\. The agent reaches it after S2-T instead of through an invitation link.

| Element | Copy |
| :---- | :---- |
| Heading | Welcome to DataOrb Hub\! |
| Line under heading | {loginId} (production shows the email address in this position) |
| Sub-header | To keep your account secure, create a new password. |
| Sub-header, second line (agent only) | Next, you'll save recovery codes in case you forget your password. |
| Fields | First Name, Last Name (pre-filled from the import, editable) |
| Section label | New Password |
| Field label | New Password \* (info icon opens Password Requirements) |
| Field label | Confirm Password \* (with show/hide icon) |
| Link | Back to login |
| Primary button | Continue (agent) · Done (email user, existing) |

**Password Requirements tooltip** (existing):

- Minimum 8 characters (numbers allowed)  
- Minimum 1 upper and lower case letter  
- Minimum 1 numeric digit (0-9)  
- Minimum 1 special character (.\!@\#$%^&\*-\_=+?)

**Validation**

| Case | Copy |
| :---- | :---- |
| Passwords don't match | Passwords don't match. |
| Requirements not met | Your password doesn't meet all the requirements. |
| Same as the temporary password | Choose a password that's different from your temporary password. |

- **Existing sub-header, changed for grammar.** Production reads "To make your account secure and proceed with sign in step, create a new password". The new copy above applies to email users too, so treat it as a string change.

#### S4 — Save your recovery codes · New

Layout: same card, slightly wider. Shown once, after S3.

| Element | Copy |
| :---- | :---- |
| Heading | Save your recovery codes |
| Sub-header | Use these codes to reset your password if you forget it. Each code works once. |
| Code grid | 8 codes, format XXXX-XXXX, 2 columns |
| Secondary buttons | Copy codes · Download |
| Warning | These codes won't be shown again. Don't save them on a shared computer. |
| Checkbox | I've saved my recovery codes somewhere safe. |
| Primary button | Continue (enabled once the checkbox is ticked) |
| Tooltip on disabled button | Confirm you've saved your codes to continue. |

**Toasts**

| Action | Copy |
| :---- | :---- |
| Copy codes | Recovery codes copied. |
| Download | Recovery codes downloaded. |

- **Button label.** "Continue" is the working label; the final label is TBD.  
- **If the agent leaves before ticking the checkbox,** a new set of codes is created at the next sign-in and S4 shows again.  
- **After a reset (J5),** S4 shows a new set of codes. **Continue** opens Learning Hub with the toast: Your password has been reset.

#### S5 — Forgot password (identifier) · Changed

Layout: existing production screen.

| Element | Copy |
| :---- | :---- |
| Heading | Forgot password |
| Sub-header | Enter your email address or login ID to reset your password. |
| Field label | Email Address or Login ID (pre-filled from S2) |
| Primary button | Continue (was: Send Code) |
| Link | Back to login |

**Routing**

| Input | Goes to |
| :---- | :---- |
| Email address | S6-E, existing (the code is sent to the email address) |
| Login ID | S6-R |
| Neither format | "Enter a valid email address or login ID." |

#### S6-E — Reset password (email verification code) · Existing

This is the existing production screen for email users, unchanged. It is listed so translators know these strings already exist.

| Element | Copy |
| :---- | :---- |
| Heading | Reset password |
| Sub-header | We have sent a code to {email} · Resend |
| Fields | Verification code · New Password · Confirm Password |
| Link / button | Back to login · Done |

**Validation**

| Case | Copy |
| :---- | :---- |
| Wrong or expired code | Failed\! Invalid verification code. Please generate code again |
| Reused password | Password cannot be same as your last 3 passwords. |
| Success (toast) | Password reset successfully. |

#### S6-R — Reset password (recovery code) · New

Layout: same as S6-E. The recovery code field replaces the verification code field, and there is no Resend.

| Element | Copy |
| :---- | :---- |
| Heading | Reset password |
| Sub-header | Enter one of the recovery codes you saved when you first signed in. |
| Field label | Recovery code (placeholder: XXXX-XXXX) |
| Section label | New Password |
| Field label | New Password (info icon opens Password Requirements) |
| Field label | Confirm Password (with show/hide icon) |
| Help text (not a link) | Don't have your codes? Contact your admin for a temporary password. |
| Link | Back to login |
| Primary button | Done |

**Validation**

| Case | Copy |
| :---- | :---- |
| Wrong or already-used code (toast) | Failed\! Invalid recovery code. Try another code. |
| Wrong format | Recovery codes look like XXXX-XXXX. |
| All codes used (shown when the screen opens; fields disabled) | You've used all your recovery codes. Contact your admin for a temporary password. |
| Too many attempts | Too many attempts. Try again in 15 minutes. |
| Reused password | Password cannot be same as your last 3 passwords. |

**Success:** the agent is signed in to Learning Hub with a toast.

| Codes left | Toast |
| :---- | :---- |
| 4 or more | Password reset successfully. You have {count} recovery codes left. |
| 3 or fewer | Password reset successfully. You have {count} recovery codes left. Generate new codes from your profile. |

#### S8 — Password expired (agent) · Changed

Layout: the existing 90-day reset screen **without** the verification code field and Resend link.

| Element | Copy |
| :---- | :---- |
| Heading | Reset password |
| Sub-header | Your password has expired. Create a new password to continue. |
| Section label | New Password |
| Field label | New Password (info icon opens Password Requirements) |
| Field label | Confirm Password (with show/hide icon) |
| Link | Back to login |
| Primary button | Done |

**Validation**

| Case | Copy |
| :---- | :---- |
| Reused password | Password cannot be same as your last 3 passwords. |
| Success (toast) | Password reset successfully. Signs the agent in. |

#### S8-R — Reset password (after temporary password) · New

Layout: same as S8, without the verification code field.

| Element | Copy |
| :---- | :---- |
| Heading | Reset password |
| Sub-header | Create a new password to continue. Next, you'll save new recovery codes. |
| Section label | New Password |
| Field label | New Password (info icon opens Password Requirements) |
| Field label | Confirm Password (with show/hide icon) |
| Link | Back to login |
| Primary button | Continue |

**Validation**

| Case | Copy |
| :---- | :---- |
| Same as the temporary password | Choose a password that's different from your temporary password. |
| Reused password | Password cannot be same as your last 3 passwords. |

#### A1 — Admin: Users page · Changed

The status pill stays **Enabled**. A sub-label under the status explains the problem.

| Element | Copy |
| :---- | :---- |
| Status pill | Enabled (unchanged) |
| Red sub-label under status (all codes used) | No recovery codes left |
| Grey sub-label under status (after issue) | Temporary password issued · Expires {expiryDate} |
| Red sub-label under status (issued, not used, expired) | Temporary password expired |
| Inline red link (rows with a red sub-label) | Issue temporary password |
| Row menu item (all agent-login users) | Issue temporary password |
| Status filter options (new) | No recovery codes left · Temporary password issued · Temporary password expired |

#### A2 — Admin: confirm modal · New

| Element | Copy |
| :---- | :---- |
| Heading | Issue a temporary password? |
| Body | {userName} ({loginId}) will need this temporary password to sign in. Their current password and recovery codes will stop working. |
| Helper | Make sure the request came from {userName} before you continue. |
| Buttons | Cancel · Issue temporary password |

#### A3 — Admin: temporary password · New

| Element | Copy |
| :---- | :---- |
| Heading | Temporary password for {userName} |
| Body | Share this password with {userName} through your usual channel. It won't be shown again after you close this window. |
| Field label | Temporary password (read-only, with Copy icon) |
| Helper text | Expires on {expiryDate} at {expiryTime}. |
| Primary button | Done |
| Toast after Copy | Temporary password copied. |
| Toast after Done | Temporary password issued to {userName}. |

---

### 4\. UX Copy inventory \- for UX review after designs are finalized.

**Status:**

- **existing** — already in production; don't re-translate.  
- **changed** — same key, new English text.  
- **new** — new key.

**Placeholders:**

- `{…}` values are passed in at runtime.  
- Plurals use ICU format, `{count, plural, one {# code} other {# codes}}`.  
- Dates and times are formatted by the backend for the user's locale.

**Do not translate:** DataOrb, Learning Hub, XXXX-XXXX.

| Key | English | Screen | Status |
| :---- | :---- | :---- | :---- |
| `auth.signin.heading` | Sign in to DataOrb | S1, S2 | existing |
| `auth.signin.step1.subheader` | To get started, enter your email address or login ID | S1 | changed (was: To get started enter your email address) |
| `auth.signin.field.identifier` | Email Address or Login ID | S1, S2, S5 | changed (was: Email Address) |
| `auth.signin.button.continue` | Continue | S1, S2-T, S5 | existing |
| `auth.signin.error.invalid_identifier` | Enter a valid email address or login ID. | S1, S5 | changed (was: Invalid email address.) |
| `auth.signin.toast.access_denied.title` | Access Denied | S1 | existing |
| `auth.signin.toast.access_denied.body` | The account you signed in with {identifier} does not have access to DataOrb. | S1 | changed (was: …does not have access to the DataOrb CEH application.) |
| `auth.signin.step2.subheader` | Please enter your password to sign in | S2 | existing |
| `auth.signin.field.password` | Password | S2 | existing |
| `auth.signin.link.forgot` | Forgot password? | S2 | existing |
| `auth.signin.button.signin` | Sign In | S2 | existing |
| `auth.signin.link.back` | Back | S2, S2-T | existing |
| `auth.signin.toast.login_failed` | Login failed\! Incorrect email/login ID or password | S2 | changed (was: Login failed\! Incorrect Email or password) |
| `auth.toast.close` | Close | S2, S2-T | existing |
| `auth.temp.heading` | Welcome to DataOrb | S2-T | new |
| `auth.temp.subheader` | This is your first sign-in. Enter the temporary password your admin shared with you. | S2-T | new |
| `auth.temp.field.login_id` | Login ID | S2-T | new |
| `auth.temp.field.password` | Temporary Password | S2-T | new |
| `auth.temp.helper.expiry` | Your temporary password expires on {expiryDate} at {expiryTime}. | S2-T | new |
| `auth.temp.help.no_password` | Don't have a temporary password? Contact your admin. | S2-T | new |
| `auth.temp.toast.login_failed` | Login failed\! Incorrect temporary password | S2-T | new |
| `auth.temp.error.expired` | Your temporary password has expired. Contact your admin for a new one. | S2-T | new |
| `auth.temp.reset.heading` | Sign in to DataOrb | S2-T (reset) | new |
| `auth.temp.reset.subheader` | Your admin has reset your password. Enter the temporary password they shared with you. | S2-T (reset) | new |
| `auth.setup.heading` | Welcome to DataOrb Hub\! | S3 | existing |
| `auth.setup.subheader` | To keep your account secure, create a new password. | S3 | changed (grammar fix; was: To make your account secure and proceed with sign in step, create a new password) |
| `auth.setup.subheader.agent` | Next, you'll save recovery codes in case you forget your password. | S3 | new |
| `auth.setup.field.first_name` | First Name | S3 | existing |
| `auth.setup.field.last_name` | Last Name | S3 | existing |
| `auth.password.section` | New Password | S3, S6, S8 | existing |
| `auth.password.field.new` | New Password | S3, S6, S8 | existing |
| `auth.password.field.confirm` | Confirm Password | S3, S6, S8 | existing |
| `auth.password.rules.title` | Password Requirements | S3, S6, S8 | existing |
| `auth.password.rules.length` | Minimum 8 characters (numbers allowed) | S3, S6, S8 | existing |
| `auth.password.rules.case` | Minimum 1 upper and lower case letter | S3, S6, S8 | existing |
| `auth.password.rules.digit` | Minimum 1 numeric digit (0-9) | S3, S6, S8 | changed (was: Minimum 1 Numeric digit (0-9) — capitalization fix) |
| `auth.password.rules.special` | Minimum 1 special character (.\!@\#$%^&\*-\_=+?) | S3, S6, S8 | existing |
| `auth.password.error.mismatch` | Passwords don't match. | S3, S6, S8 | new (confirm whether production already has a string) |
| `auth.password.error.requirements` | Your password doesn't meet all the requirements. | S3, S6, S8 | new (confirm whether production already has a string) |
| `auth.password.error.same_as_temp` | Choose a password that's different from your temporary password. | S3 | new |
| `auth.password.error.last_three` | Password cannot be same as your last 3 passwords. | S6, S8 | existing |
| `auth.link.back_to_login` | Back to login | S3, S5, S6, S8 | existing |
| `auth.button.done` | Done | S3 (email), S6, S8, A3 | existing |
| `auth.codes.heading` | Save your recovery codes | S4 | new |
| `auth.codes.subheader` | Use these codes to reset your password if you forget it. Each code works once. | S4 | new |
| `auth.codes.button.copy` | Copy codes | S4 | new |
| `auth.codes.button.download` | Download | S4 | new |
| `auth.codes.warning` | These codes won't be shown again. Don't save them on a shared computer. | S4 | new |
| `auth.codes.checkbox` | I've saved my recovery codes somewhere safe. | S4 | new |
| `auth.codes.button.continue` | Continue | S4 | new (final label TBD) |
| `auth.codes.tooltip.disabled` | Confirm you've saved your codes to continue. | S4 | new |
| `auth.codes.toast.copied` | Recovery codes copied. | S4 | new |
| `auth.codes.toast.downloaded` | Recovery codes downloaded. | S4 | new |
| `auth.forgot.heading` | Forgot password | S5 | existing |
| `auth.forgot.subheader` | Enter your email address or login ID to reset your password. | S5 | changed |
| `auth.forgot.button.continue` | Continue | S5 | changed (was: Send Code) |
| `auth.reset.heading` | Reset password | S6, S8 | existing |
| `auth.reset.email.subheader` | We have sent a code to {email} | S6-E | existing |
| `auth.reset.email.resend` | Resend | S6-E | existing |
| `auth.reset.email.field.code` | Verification code | S6-E | existing |
| `auth.reset.email.error.code` | Failed\! Invalid verification code. Please generate code again | S6-E | existing |
| `auth.reset.toast.success` | Password reset successfully. | S6-E, S8 | existing |
| `auth.reset.code.subheader` | Enter one of the recovery codes you saved when you first signed in. | S6-R | new |
| `auth.reset.code.field` | Recovery code | S6-R | new |
| `auth.reset.code.placeholder` | XXXX-XXXX | S6-R | new — do not translate |
| `auth.reset.code.help.no_codes` | Don't have your codes? Contact your admin for a temporary password. | S6-R | new |
| `auth.reset.code.error.invalid` | Failed\! Invalid recovery code. Try another code. | S6-R | new |
| `auth.reset.code.error.format` | Recovery codes look like XXXX-XXXX. | S6-R | new |
| `auth.reset.code.error.exhausted` | You've used all your recovery codes. Contact your admin for a temporary password. | S6-R | new |
| `auth.reset.code.error.locked` | Too many attempts. Try again in 15 minutes. | S6-R | new |
| `auth.reset.code.toast.success` | Password reset successfully. You have {count, plural, one {\# recovery code} other {\# recovery codes}} left. | S6-R | new |
| `auth.reset.code.toast.low` | Password reset successfully. You have {count, plural, one {\# recovery code} other {\# recovery codes}} left. Generate new codes from your profile. | S6-R | new |
| `auth.expired.subheader` | Your password has expired. Create a new password to continue. | S8 | new |
| `auth.reset.after_temp.subheader` | Create a new password to continue. Next, you'll save new recovery codes. | S8-R | new |
| `auth.button.continue_reset` | Continue | S8-R | new |
| `auth.reset.after_temp.toast` | Your password has been reset. | S4 (after reset) | new |
| `admin.users.sublabel.no_codes` | No recovery codes left | A1 | new |
| `admin.users.sublabel.temp_issued` | Temporary password issued · Expires {expiryDate} | A1 | new |
| `admin.users.sublabel.temp_expired` | Temporary password expired | A1 | new |
| `admin.users.action.issue_temp` | Issue temporary password | A1 | new |
| `admin.users.filter.no_codes` | No recovery codes left | A1 | new |
| `admin.users.filter.temp_issued` | Temporary password issued | A1 | new |
| `admin.users.filter.temp_expired` | Temporary password expired | A1 | new |
| `admin.temp.confirm.heading` | Issue a temporary password? | A2 | new |
| `admin.temp.confirm.body` | {userName} ({loginId}) will need this temporary password to sign in. Their current password and recovery codes will stop working. | A2 | new |
| `admin.temp.confirm.helper` | Make sure the request came from {userName} before you continue. | A2 | new |
| `admin.temp.confirm.button` | Issue temporary password | A2 | new |
| `admin.temp.heading` | Temporary password for {userName} | A3 | new |
| `admin.temp.body` | Share this password with {userName} through your usual channel. It won't be shown again after you close this window. | A3 | new |
| `admin.temp.field` | Temporary password | A3 | new |
| `admin.temp.helper.expiry` | Expires on {expiryDate} at {expiryTime}. | A3 | new |
| `admin.temp.toast.copied` | Temporary password copied. | A3 | new |
| `admin.temp.toast.issued` | Temporary password issued to {userName}. | A3 | new |


---

# 6. Source — CEH user manual (text only)

> **Text-only copy.** The supplied manual embeds 18 screenshots as base64 data; those are stripped here so
> the repo stays light — image references are left in place as `![][imageN]` markers. Digest and design
> implications: production-reference.md (below).

**![][image1]**

## **User Manual: Customer Engagement Hub (CEH) \- User Onboarding for Contact Center Administrators**

### **Objective**

Empower contact center administrators to efficiently onboard team members across all operational roles, ensuring secure access and appropriate permissions for optimal platform utilization.

### **User Persona & Context**

**Primary User**: Contact Center Administrator (Admin Role)

### **Real-World Scenario**

Your contact center is expanding operations and needs to onboard 15 new team members including managers, quality evaluators, analysts, and agents. You need to ensure each user receives appropriate access permissions based on their role and compliance requirements for your industry vertical.

---

### 

### 

### 

### 

### **Step-by-Step User Onboarding Guide**

#### **1\. Access User Management Hub**

* Navigate to **Settings** from the left navigation menu  
* Select **User Management** → **Users**  
* **Purpose**: Central command for all user account operations  
  *![][image2]*

#### **2\. Create New User Profile & Role Assignment**

* Click **"+ New Users"** button in the Users module

  *![][image3]*

* Enter **Email ID**, **First Name**, and **Last Name**  
* Select appropriate **User Role** from dropdown:  
  * **Admin:** Manage the workspaces and users, visibility into all data   
  * **Manager:** Visibility into their specific agents and teams, create and publish evaluation scorecards and quality evaluation assignments i.e., Quality Manager  
  * **Evaluator:** A user that will complete QA evaluations, provide insights, and assist in coaching i.e., Quality analyst or quality evaluator  
  * **Analyst:** Visibility into organization-wide or team-based reporting, analytics and search i.e., Analytics team member  
  


  *![][image4]*


  


#### **3\. Set User-Specific Permissions**

**For Manager Roles:**

* **Workspace Access**: Configure workspace access to be given (Managers will be able to see data for the agents who are part of the workspace only)  
* **Audio Player**: Configure based on quality monitoring needs  
* **Ask Mira Feature**: Enable for AI-assisted support

![][image5]

**For Evaluator/Analyst Roles:**

* **Agent Data Masking**: Configurable based on organizational policy (Users will not be able to view actual agent name/email ID fields on application, it will be masked)  
* **Audio Player Access**: Enable/disable per role requirements (Users will not be able to access the audio of the interaction in the interaction record view to playback the audio)  
  *![][image6]*

#### **4\. Complete User Invitation**

* Review all entered details for accuracy  
* Click **"Add User"** (enabled once all required fields are completed)  
* **System Response**: Confirmation notification appears  
* **User Status**: Initially shows as "Invited" in user list  
  *![][image7]*

#### **5\. User Onboarding Process**

**What Users Receives:**

* Email invitation with secure onboarding link  
* **Important**: Link expires after 30 days for security  
* User clicks "Get Started" or copies URL to browser  
  *![][image8]*

#### **6\. Password Security Setup**

**User Experience:**

* Redirected to CEH password setup screen  
* Must meet security requirements (shown via info icon)  
* Enter new password and confirmation  
* Click "Done" to complete onboarding  
* **Automatic Redirect**: User lands on CEH Pulse Contact center dashboard  
* **Status Update**: User status changes from "Invited" to "Enabled"  
  *![][image9]*  
  *![][image10]*  
  *![][image11]*  
  


---

### **Key Takeaways**

* **Streamlined Onboarding**: Complete user setup in under 3 minutes  
* **Compliance-Ready**: Built-in data masking ensures regulatory adherence  
* **Role-Based Security**: Granular permissions protect sensitive information  
* **Scalable Process**: Efficient bulk user management for growing teams

### **Quick Troubleshooting**

**Q: User didn't receive an invitation email?**  
 **A**: Check spam folder, verify email address accuracy, resend invitation from user list

**Q: User can't complete password setup?**  
 **A**: Ensure password meets all requirements (shown in info tooltip), check link hasn't expired

**Q: Need to modify user permissions after onboarding?**  
 **A**: Use "Edit User" function from user list to update roles and permissions

**Q: User onboarding link is expired?**  
 **A**: The user must contact the Tenant Admin. The admin user will need to resend the invitation by following these steps:

1. Go to Settings → User Management → Users.  
2. Use the search bar to locate the user (e.g., type the name or email).  
3. Confirm the user’s Status is showing as **`Invited`**.  
4. Hover over the user row and click the three-dot menu.  
5. Select Re-Invite User.  
6. A confirmation pop-up — “Invitation Sent\!” — will appear on successful re-invite.

### **![][image12]**

![][image13]  
**Advanced User Management**

#### **Editing User Access**

* Click **"Edit User"** from the user list  
* Modify workspace assignments, permissions, or personal details  
* **Real-Time Updates**: Changes take effect immediately

*![][image14]*

#### **![][image15]**

#### **Revoking User Access**

* Access **"Edit User"** functionality  
* Toggle user status to **"Revoke Access"**  
* **Automatic Notifications**: User receives email confirmation  
* **Status Update**: User status changes to "Disabled"  
* **Security Note**: Immediate platform access termination  
  *![][image16]*  
  *![][image17]*  
  *![][image18]*  
  


---

### **Platform Access Information**

**Login URL**: [https://ceh.dataorb.ai/login](https://ceh.dataorb.ai/login)

**Security**: All users must complete CAPTCHA verification for enhanced security
