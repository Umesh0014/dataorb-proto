# Production reference — CEH user onboarding (admin side)

**Source:** *External User Manual: Customer Engagement Hub (CEH) — User Onboarding for Contact Center
Administrators* (supplied 2026-09-23). This is one of the documents the v3 handoff told the design team to
review before treating any "existing" screen as specified. The original is image-heavy; the text is
summarised here and the substance kept verbatim where it is a fact we design against.

**This is what production does today, for email users.** Everything the agent-login project adds sits beside
it, so anything below that contradicts the handoff is worth resolving before build.

## The existing admin flow

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

## Facts we design against

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

## Troubleshooting content worth keeping

- No invitation email → check spam, verify the address, resend from the user list.
- Cannot complete password setup → check the requirements tooltip, check the link has not expired.
- Change permissions later → **Edit User** from the user list; changes take effect immediately.

The agent-login equivalents of the first two do not exist: an agent with no inbox cannot "check spam", and a
temporary password cannot be resent by the system. Both collapse into the same answer — contact the admin —
which is exactly what S2-T and S6-R say.
