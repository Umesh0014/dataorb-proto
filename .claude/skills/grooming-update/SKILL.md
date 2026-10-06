---
name: grooming-update
description: Write Umesh's DataOrb design-status update for the "UX Steering Group" Google Chat space in his house pattern, and add the matching items with Figma design links to the grooming plan (the agenda table in Akash's "Notes - UX Sync" Google Doc). Use whenever Umesh says "write the steering group update", "post the grooming update", "add design links to the grooming plan", "update the grooming plan", "share design files for grooming", or lists projects going to grooming and wants their Figma links shared.
---

# Grooming update — Steering Group message + grooming plan rows

Two outputs, always in this order:

1. **The Steering Group message**, a draft in Umesh's pattern (below) that he posts himself.
2. **Grooming plan rows**: one row per project in the agenda table of *Notes - UX Sync*, each with its Figma design link.

## 1. Message pattern

This is copied from Umesh's own update (Oct 5, 2026). Keep his voice: short, plain, no headings, no bold, no emoji.

```
1. <Project name> - <scope in brackets or after a dash> [<Planned for <day> - MM/DD/YYYY> --> <change + reason, if any>]

* <Sub-item / related flow> - <state, who it was groomed with, what is pending>

--> <Current status line, e.g. "Design review and requirements in progress.">

2. <Project name> - grooming <tomorrow/day> MM/DD/YYYY with team, <what must change in the designs>.
--> <Current status line>

3. ...
```

Rules:
- Number the projects in priority/grooming order. Mark the top item `P0` inline, e.g. "grooming on Wednesday (10/07/2026) - P0".
- Write dates as `MM/DD/YYYY`, and add the weekday when it helps ("Wednesday (10/07/2026)").
- Use `-->` for status, for "what happens next" and for plan changes ("--> Moved this to tomorrow due to dev team bandwidth concerns").
- Use `*` for a sub-flow that belongs to the item above it.
- Say what the design must reflect ("lets ensure all designs are having the latest incorporated feedback", "close all the design decisions by tomorrow").
- End with the review-window line when one applies, e.g. "We'll keep these designs open for comments and review until Oct 09; after that the design team will move the final versions into the Design-Dev Handover file."
- Put links in the grooming plan, not in the message. Only add a link to the message if Umesh asks.

Show the draft to Umesh. **Never post to Google Chat yourself.** No Chat tool is available, and the message goes out under his name.

## 2. Grooming plan rows

**Where:** the Google Doc **Notes - UX Sync**, owned by akash.s@dataorb.ai:
https://docs.google.com/document/d/1VY8SVpve-NIqBYaT9ObeaHlULbbA72XQeuWJMf6Uv-I/edit
Each sync date has a `### Agenda` table. Add rows under the agenda for the next grooming date. If that date has no section yet, ask before creating one.

**Row format** (match the existing rows exactly):

| Item | Designer / PO | (link) | Priority | Timeline |
|---|---|---|---|---|
| Assign drill | Umesh Dinde (mailto:umesh.d@dataorb.ai) | [Design link](https://www.figma.com/design/P5edYMfQe2DW1EZLJqkH7N/Learning-Hub?node-id=137485-71996) | P0 | Feedback received |

- **Item:** the short project name, e.g. "Agent login flow", "Bulk upload", "Workspace".
- **Designer / PO:** the designer as a mailto chip (usually Umesh; Ajinkya or Gaurav if they own it).
- **Link column:** the text is always "Design link". It links to the **section-level** Figma frame (`?node-id=…`), never the bare file.
- **Priority:** P0 / P1 / P2.
- **Timeline:** the status, from this set: `In progress` · `In review` · `Feedback received` · `Grooming MM/DD` · `Ready for handover`.

Before writing to the doc:
- Load the `anthropic-skills:google-workspace` skill. Read the doc and check whether the row already exists; update it instead of adding a duplicate.
- Show Umesh the rows you will add and get a yes. It is Akash's shared doc.

## Finding the Figma links

- **Main file:** Learning Hub, `P5edYMfQe2DW1EZLJqkH7N`. Login, invite, bulk upload, process knowledge, collections, persona and assignments all live here.
- **Dev handover files:** 2.0 Design-Dev Handover `c9qsU7QcDvxVLiAT17ulan` and 3.0 Design-Dev Handover `3mvkGdlwtQr8mYneKdiujU`. Use these only for "current shipped" references.
- 2.0 Customer Engagement Hub `BqJMDZgDtCf4GTAcvUZLs4` covers Settings > Users and workspace associations.
- Where to look for section links, in this order:
  1. Earlier rows in *Notes - UX Sync*.
  2. Figma links pasted in Notion cards on the DataOrb UX Priorities Kanban.
  3. Figma comment emails in Gmail (`from:email.figma.com`). These links are redirect-wrapped and only give you the file.
  4. The Figma MCP's `get_metadata` tool.
- If you can't confirm a section link, **ask Umesh for it** (right-click the section → Copy link). Never guess a node-id, and never leave a bare file link labelled as a section.

## Current project → link map (Oct 2026; refresh each run)

| Project | Link |
|---|---|
| Agent login flow + agent/trainee invite (separate Login ID and Agent ID) | Learning Hub (section link needed) |
| Bulk upload (optional `agent_id` column, Agent rows only) | Learning Hub (section link needed) |
| Process knowledge + collections | Learning Hub, Knowledge: node-id=137154-1354 (Sep 22 row) |
| Updated persona record view | Learning Hub, AI Employee Persona: node-id=137300-106787 (Sep 22 row) |
| Updated agent profile view | Learning Hub (section link needed). Shipped reference: 2.0 Design-Dev Handover node-id=172666-82432 |
| Workspace (P0) | "Groups, Workspaces & Users" row in Notes - UX Sync (Sep 22) |
