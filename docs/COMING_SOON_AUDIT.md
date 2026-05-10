# Route audit — built vs. missing

Source of truth: side-nav configs in `components/SideNav/configs/`. Every
nav id below resolves to a page mount in `app/page.jsx`. Missing pages now
render `<ComingSoon pageName="…" />` instead of a 404 / blank screen.

## Insights Hub

| Nav id              | Route                                | Page mount                         | Status   |
| ------------------- | ------------------------------------ | ---------------------------------- | -------- |
| `rocket` (parent)   | (opens flyout — no own page)         | falls back to first child          | n/a      |
| `contact-center`    | `/insights/contact-center`           | `<InsightsHubPage />`              | built    |
| `reports`           | `/insights/reports`                  | `<ComingSoon pageName="Reports" />`| missing  |
| `interaction`       | `/insights/interaction`              | `<ComingSoon pageName="Interaction" />` | missing |
| `headset` (parent)  | (opens flyout — no own page)         | falls back to first child          | n/a      |
| `agent-performance` | `/insights/agents/performance`       | `<ComingSoon pageName="Agent Performance" />` | missing |
| `session`           | `/insights/agents/session`           | `<ComingSoon pageName="Session" />`| missing  |

## Learning Hub

| Nav id         | Route                    | Page mount                       | Status  |
| -------------- | ------------------------ | -------------------------------- | ------- |
| `drill`        | `/learning/drill`        | `<LearningHubPage />`            | built   |
| `interactions` | `/learning/interactions` | `<InteractionsPage />`           | built   |
| `agents`       | `/learning/agents`       | `<ComingSoon pageName="Agents" />` | missing (was inline placeholder) |

## App switcher (9-dot)

| Item key   | Destination                              | Status        |
| ---------- | ---------------------------------------- | ------------- |
| `insights` | Switch app → Insights Hub (in-app state) | built         |
| `learning` | Switch app → Learning Hub (in-app state) | built         |
| `mira`     | External link → `https://mira.dataorb.ai` | external (out of scope) |

## Replacement contract

When a real page lands for any `missing` row above, swap that entry's
`Component` in the page resolver in `app/page.jsx` (`INSIGHTS_PAGES` or
`LEARNING_PAGES`). No other change is required — the side nav and routing
already point at it.
