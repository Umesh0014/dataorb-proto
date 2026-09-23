# Agent Login Flow — UX Handoff (v3)

*For: Umesh and the design team & Tech team |*   
*Companion: `dataorb_agent_login_v3.html` (prototype)*  
---

## 1\. Purpose

**DESIGN TEAM — REVIEW THE EXISTING FLOW ON THE QA ENVIRONMENT AND THE ATTACHED DOCUMENTS / USER MANUALS FOR REFERENCE.**

This handoff covers sign-in and password recovery for Learning Hub users who have a **login ID instead of an email address**, such as MasOrange contact-center agents.

- **How they get in.** The admin creates these users through bulk import and shares a login ID and temporary password with each agent.  
- **First sign-in.** The agent sets a permanent password and saves recovery codes.  
- **Password recovery.** Recovery codes replace the emailed verification code. If an agent has lost or used all their codes, they contact their admin through their usual channel, and the admin issues a temporary password from the Users page.

**Status label:** agent accounts that haven't signed in yet show **Pending Activation/INVITED**. This label is still pending sign-off. The production equivalent for email users is "Invited".

---

## 2\. User journeys

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

### J1 — First sign-in with a temporary password (agent)

1. The admin bulk-imports the agent. The status is **Pending Activation**.  
2. The admin shares the agent's login ID and temporary password outside the platform (for example, through a supervisor).  
3. **S1:** The agent enters the login ID and selects **Continue**.  
4. **S2-T:** The system recognises a login ID for an account that hasn't been activated, and shows the temporary-password step. The agent enters the temporary password and selects **Continue**.  
5. **S3:** The agent confirms their first and last name and creates a new password.  
6. **S4:** The agent saves the recovery codes, ticks the confirmation checkbox and selects **Continue**.  
7. The agent lands on Learning Hub. The status changes from Pending Activation to **Enabled**.

### J3 — Forgot password with a recovery code (agent)

1. **S2:** The agent selects **Forgot password?**  
2. **S5:** The identifier is pre-filled. The agent selects **Continue**.  
3. **S6-R:** The agent enters a recovery code and a new password, then selects **Done**.  
4. The agent is signed in and sees a toast with the number of recovery codes left.

### J5 — Lost or used all recovery codes (agent \+ admin)

1. **S5 → S6-R:** The agent can't reset the password because they've lost their recovery codes or used them all.  
2. The agent contacts their admin through their usual channel (for example, Slack or their supervisor). There is no in-app request.  
3. **A1:** The admin searches for the agent on the Users page. If the agent has used all their codes, the row shows **No recovery codes left** in red.  
4. **A2:** The admin selects **Issue temporary password** and confirms.  
5. **A3:** The temporary password appears once. The admin copies it and shares it with the agent outside the platform. The agent's current password and recovery codes stop working.  
6. **S1 → S2-T (reset):** The agent signs in with their login ID and the temporary password.  
7. **S8-R:** The agent creates a new password.  
8. **S4:** The agent saves a new set of recovery codes and continues to the Learning Hub.

### J6 — 90-day password expiry (agent)

1. **S1 → S2:** The agent signs in with their current password.  
2. **S8:** The system shows the expired-password screen. No verification code is needed, because the agent has just signed in with their current password.  
3. The agent creates a new password and selects **Done**, then is signed in.

---

## 3\. Screens

Screen status: **Existing** (reused as-is), **Changed** (existing screen with copy changes), **New**.

### S1 — Sign in, step 1 (identifier) · Changed

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

### S2 — Sign in, step 2 (password) · Changed

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

### S2-T — Sign in, step 2 (temporary password) · New

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

### S3 — Welcome to DataOrb Hub\! (create password) · Changed

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

### S4 — Save your recovery codes · New

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

### S5 — Forgot password (identifier) · Changed

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

### S6-E — Reset password (email verification code) · Existing

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

### S6-R — Reset password (recovery code) · New

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

### S8 — Password expired (agent) · Changed

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

### S8-R — Reset password (after temporary password) · New

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

### A1 — Admin: Users page · Changed

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

### A2 — Admin: confirm modal · New

| Element | Copy |
| :---- | :---- |
| Heading | Issue a temporary password? |
| Body | {userName} ({loginId}) will need this temporary password to sign in. Their current password and recovery codes will stop working. |
| Helper | Make sure the request came from {userName} before you continue. |
| Buttons | Cancel · Issue temporary password |

### A3 — Admin: temporary password · New

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

## 4\. UX Copy inventory \- for UX review after designs are finalized.

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

