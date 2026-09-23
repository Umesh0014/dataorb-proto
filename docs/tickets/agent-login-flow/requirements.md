# Requirements Checklist — Agent login (login ID instead of email address)

**Source:** `INTERNAL_Agent_Login_Flow_UX_Handoff` (v3) — verbatim copy in [handoff-v3.md](handoff-v3.md)
**Design file:** Figma *Learning Hub* → page **🔥 Agent login** → section **Agent login — 2026-09-23**
<https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137981-627>
**Journey map + screen inventory:** [journeys.md](journeys.md)

Scope: sign-in and password recovery for Learning Hub users who have a **login ID instead of an
email address** (MasOrange contact-centre agents), plus the admin-side temporary-password flow that
unblocks them. Email-user journeys (J0, J4, J7) are in scope only as reference — the single copy
change on S5 is the exception.

**Before anything is treated as final:** the handoff opens by telling the design team to review the
existing flow on the **QA environment** and the attached user manuals. Screens marked *Existing*
below were reconstructed from the handoff's copy tables, not traced from production.

### Functional requirements
- [ ] R1: **One identifier field** accepts either an email address or a login ID (S1, S2, S5). Continue enables once the input matches either format.
- [ ] R2: Agents are created by **bulk import**; accounts that have never signed in show **Pending Activation / INVITED** (label pending sign-off — see C5).
- [ ] R3: The login ID and temporary password reach the agent **outside the platform** (supervisor, Slack). There is no in-app delivery and no in-app request.
- [ ] R4: A login ID on a never-activated account routes to **S2-T** (temporary password), not to the normal password step.
- [ ] R5: The temporary password carries an **expiry date and time**, shown in the agent's local time zone; expiry is a hard stop back to the admin.
- [ ] R6: **S3** collects first and last name (pre-filled from the import, editable) plus the new password; the line under the heading carries the login ID where production shows the email address.
- [ ] R7: **S4** issues **8 recovery codes** in `XXXX-XXXX` format, two columns, shown once, with Copy codes and Download, and a confirmation checkbox that gates Continue.
- [ ] R8: If the agent leaves S4 before ticking the checkbox, a **new set is generated at the next sign-in** and S4 shows again.
- [ ] R9: **S5 routes on input format** — email address → S6-E (code sent), login ID → S6-R, neither → inline error.
- [ ] R10: **S6-R** takes one recovery code plus the new password. Each code works once. **No Resend.**
- [ ] R11: A successful recovery-code reset **signs the agent in** and toasts the remaining count; at **3 or fewer** the toast adds "Generate new codes from your profile".
- [ ] R12: With **zero codes left**, S6-R shows the blocked message **when the screen opens** and disables the fields.
- [ ] R13: Too many recovery-code attempts → **15-minute lockout**, with the wait named.
- [ ] R14: **90-day expiry (agent)** goes to **S8** with **no verification code** — the agent has just signed in with the current password.
- [ ] R15: **A1 (Users page)** keeps the **Enabled** status pill and adds a sub-label under it: *No recovery codes left* (red) · *Temporary password issued · Expires {date}* (grey) · *Temporary password expired* (red); plus an inline red link on red rows, a row-menu item for all agent-login users, and **three new status filter options**.
- [ ] R16: **A2** names the blast radius (current password *and* recovery codes stop working) and asks the admin to verify the request came from the named user.
- [ ] R17: **A3** shows the temporary password **once**, read-only with Copy, states the expiry, and toasts on Copy and on Done.
- [ ] R18: Issuing a temporary password **kills the current password and every remaining recovery code**.
- [ ] R19: After a reset the agent goes **S2-T (reset variant) → S8-R → S4 (new codes) → Learning Hub** with the toast *Your password has been reset.* — S8-R, not S3, because the account is already activated.
- [ ] R20: Email-user journeys **J0, J4, J7 are unchanged**; the only change that lands for them is the S5 copy and the S3 sub-header grammar fix.

### Visual / layout requirements
- [ ] V1: Every auth screen reuses the **existing production card** — one column, logo, heading, sub-header, fields, primary button, secondary link.
- [ ] V2: **S4 is slightly wider** than the other cards to fit the two-column code grid.
- [ ] V3: The A1 status **pill stays Enabled**; the new state is carried by a sub-label under it, never by changing the pill.
- [ ] V4: Error pattern is split deliberately — **format and state errors inline** at the field, **submit failures as toasts** with Close.
- [ ] V5: The existing **Password Requirements** tooltip content is unchanged (8 characters · upper and lower case · 1 digit · 1 special character).
- [ ] V6: **S2-T has two copy variants** on one layout — first sign-in and reset — differing only in heading and sub-header.

### Content / copy requirements
- [ ] D1: Ship against the handoff's **copy inventory** (`auth.*`, `admin.*`), respecting each key's status: *existing* (do not re-translate) · *changed* (same key, new English) · *new*.
- [ ] D2: Counts use **ICU plurals**: `{count, plural, one {# recovery code} other {# recovery codes}}`.
- [ ] D3: **Do not translate:** DataOrb, Learning Hub, `XXXX-XXXX`.
- [ ] D4: Dates and times are **formatted by the backend** for the user's locale; the temporary-password expiry renders in the user's own time zone.

### Constraints / out of scope
- C1: **No in-app request** for a temporary password — the agent contacts the admin through their usual channel.
- C2: The hidden **reCAPTCHA v3** on S1 stays exactly as it is.
- C3: Disabled, revoked and unknown accounts all return the same **Access Denied** copy — do not differentiate.
- C4: **Review the QA environment** and the attached user manuals before treating any "existing" screen as specified.
- C5: The **Pending Activation / INVITED** label is *not signed off*; production calls the email-user equivalent "Invited".
- C6: The **S4 primary button label** is a working label — final label TBD.
- C7: A prototype companion exists (`dataorb_agent_login_v3.html`); it was not supplied with this handoff and has not been reviewed here.
- C8: This is a **design/knowledge project** — no code in this repo implements the auth flow, and none was written for it.
