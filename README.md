# 🌐 OSSGrid

> **A free, no-login index of open-source mentorship programs.** Browse every LFX Mentorship organization and project by technology, year and mentor. GSoC is next.

[![Sync Data](https://github.com/rajatrsrivastav/ossgrid/actions/workflows/sync-data.yml/badge.svg)](https://github.com/rajatrsrivastav/ossgrid/actions/workflows/sync-data.yml)

## ✨ Features

- 🔍 **Fuzzy Search** — Instantly search across organizations, projects, technologies, and mentor names.
- 🎯 **Multi-facet Filtering** — Filter by term, year, category, technology stack, and quick shortcuts.
- 🌗 **Dark/Light Mode** — Token-based design system, see `DESIGN.md`.
- 🔗 **Shareable URLs** — Filters sync to URL query parameters for shareable filtered views.
- 📱 **Fully Responsive** — Optimized grid layout from mobile to desktop.
- ⚡ **100% Static** — Pre-built JSON datasets loaded client-side for instant performance.
- 🤖 **Auto-synced Data** — GitHub Actions updates project data daily from major open-source repositories.

## 📊 Data

Currently tracking **LFX Mentorship**. Counts below are read from `public/data/organizations.json` at build time and shown rounded down in the UI; run `npm run audit:data` for exact numbers.
- Every organization that has taken part since 2019
- Every project with source provenance, mentors, skills and issue links
- Technologies spanning Go, Rust, C++, Kubernetes, eBPF, Python, and more

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Search**: [Fuse.js](https://fusejs.io/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/rajatrsrivastav/ossgrid.git
cd ossgrid

# Install dependencies
npm install

# Run data integrity checks
npm run test:data
npm run audit:data

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🤝 Contributing

We welcome contributions! Please note:
- **Base Branch**: Always open pull requests targeting the **`main`** branch (do **not** target `develop`).
- **Issue Ownership**: Make sure an issue is assigned to you before working on it.
- For complete contributor workflows, quality gates, and code conventions, see **[CONTRIBUTING.md](./CONTRIBUTING.md)**.

## 📦 Documentation

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Contributor rules, issue ownership deadlines, PR checklist, and Active Contributors list.
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — Comprehensive architecture guide, parser internals, deduplication engine, and static site design.
- **[docs/data-verification.md](./docs/data-verification.md)** — CNCF provenance verification, historical cohort mappings, and source policies.

## 🔄 Data Pipeline Scripts

| Command | Description |
|---|---|
| `npm run test:data` | Run parser & data regression tests |
| `npm run audit:data` | Verify schema integrity, links, and source coverage |
| `npm run check:data` | Check byte-for-byte reproducibility against pinned upstream commit |
| `npm run sync:data` | Regenerate datasets from pinned upstream source |
| `npm run check:copy` | Fail on hype or filler words in UI copy (see `DESIGN.md` §8) |
| `npm run typecheck` | TypeScript check without emitting |

