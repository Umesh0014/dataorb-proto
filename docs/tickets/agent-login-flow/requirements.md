# Requirements Checklist — Agent login (login ID instead of email address)

**Sources** (newest last; where they disagree, the disagreement is recorded rather than silently resolved):

1. `INTERNAL_Agent_Login_Flow_UX_Handoff` v3 — journeys, screens, copy inventory → [handoff-v3.md](handoff-v3.md)
2. `dataorb_agent_login_v4.html` — the clickable prototype; chrome, type scale, sample data, extra states → [prototype-v4.html](prototype-v4.html), digested in [prototype-v4.md](prototype-v4.md)
3. *CEH User Manual: User Onboarding for Contact Center Administrators* — what production does today → [production-reference.md](production-reference.md)

**Design file:** Figma *Learning Hub* → page **🔥 Agent login** → section **Agent login — 2026-09-23**
<https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137981-627>
**Journey map + screen inventory:** [journeys.md](journeys.md)

Scope: sign-in and password recovery for Learning Hub users who have a **login ID instead of an email
address** (MasOrange / Konecta contact-centre agents), plus the admin-side temporary-password flow that
unblocks them. Email-user journeys (J0, J4, J7) are in scope only as reference — the single copy change on S5
is the exception.

### Functional requirements
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

### Visual / layout requirements
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

### Content / copy requirements
- [ ] D1: Ship against the handoff's **copy inventory** (`auth.*`, `admin.*`), respecting each key's status: *existing* (do not re-translate) · *changed* (same key, new English) · *new*.
- [ ] D2: Counts use **ICU plurals**: `{count, plural, one {# recovery code} other {# recovery codes}}`.
- [ ] D3: **Do not translate:** DataOrb, Learning Hub, `XXXX-XXXX`.
- [ ] D4: Dates and times are **formatted by the backend** for the user's locale; the temporary-password expiry renders in the user's own time zone.
- [ ] D5: Demo data follows v4 — Konecta, `KON-AGT-10284`, Maria Rodriguez, workspace *Infancia_sevilla*.

### Constraints / out of scope
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
