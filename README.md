# PostHog Engineering Impact Dashboard

Live: https://posthog-impact-six.vercel.app

---

## What This Does

Analyzes the PostHog GitHub repository to identify the top 5 most impactful engineers over the last 90 days. Impact is defined as the quality and consequence of contribution, not volume of activity.

---

## Impact Definition

Impact = complexity of work owned + consistency of delivery + sustained cadence + code stability.

Not measured: commits, lines of code, PR count, raw additions/deletions.

### Four Dimensions

**Complexity Owned (35%)**
Average PR size in lines changed × files touched. Engineers who consistently take on harder, larger work score higher than those staying in safe territory.

**Consistency (30%)**
PR throughput sustained across active weeks. Sustained contribution beats a single big sprint.

**Cadence (20%)**
Contribution spread across the 90-day window. Engineers active across more weeks score higher than those with the same output concentrated in a short burst.

**Code Longevity (15%)**
PRs without hotfix/revert/rollback patterns in the title. Code that stands without immediate follow-up fixes is a quality signal.

Each dimension normalized 0–1 across all engineers with ≥3 merged PRs, then weighted into a composite impact score. Every component shown inline — no black box numbers.

---

## Data

- Source: posthog/posthog public GitHub repository
- Method: GitHub CLI `gh pr list` — single command, no rate limits
- Coverage: 6,449 merged PRs, last 90 days
- Fields: PR number, title, author, mergedAt, additions, deletions, changedFiles

---

## Stack

- Framework: Next.js 14 (API routes + React in one repo)
- Scoring: JavaScript, server-side on load
- Charts: Recharts (radar chart per engineer)
- Deploy: Vercel

---

## Run Locally
```bash
git clone https://github.com/Av1352/posthog-impact
cd posthog-impact
npm install
npm run dev
```

Data is pre-fetched and committed to `data/posthog_prs_90days.json`. No API keys or env vars required.

To re-fetch fresh data:
```powershell
$since = (Get-Date).AddDays(-90).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
gh pr list --repo PostHog/posthog --state merged --limit 7000 --json number,title,author,mergedAt,additions,deletions,changedFiles | ConvertFrom-Json | Where-Object { $_.mergedAt -gt $since } | ConvertTo-Json -Depth 10 > data\posthog_prs_90days.json
```

---

## Structure
```
posthog-impact/
  app/
    api/analyze/route.js   — scoring API
    globals.css
    layout.jsx
    page.jsx               — dashboard UI
  lib/
    score.js               — impact scoring logic
  data/
    posthog_prs_90days.json
  package.json
  next.config.mjs
```

---

Built by Anju Vilashni Nandhakumar — vxanju.com