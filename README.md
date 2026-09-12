# 🌐 OSSGrid

> **A frictionless, high-performance web dashboard for exploring organizations, projects, and tech stacks across major open-source mentorship programs.**

This is a fast, public, no-login-required dashboard for exploring the open-source mentorship ecosystem (including LFX, GSoC, Outreachy, and more).

[![Sync Data](https://github.com/rajatrsrivastav/ossgrid/actions/workflows/sync-data.yml/badge.svg)](https://github.com/rajatrsrivastav/ossgrid/actions/workflows/sync-data.yml)

## ✨ Features

- 🔍 **Fuzzy Search** — Instantly search across organizations, projects, technologies, and mentor names.
- 🎯 **Multi-facet Filtering** — Filter by term, year, category, technology stack, and quick shortcuts.
- 🌗 **Dark/Light Mode** — Beautiful glassmorphism design with seamless theme switching.
- 🔗 **Shareable URLs** — Filters sync to URL query parameters for shareable filtered views.
- 📱 **Fully Responsive** — Optimized grid layout from mobile to desktop.
- ⚡ **100% Static** — Pre-built JSON datasets loaded client-side for instant performance.
- 🤖 **Auto-synced Data** — GitHub Actions updates project data daily from major open-source repositories.

## 📊 Data

Currently tracking programs like **LFX Mentorship**, featuring:
- **102 organizations** across historical and upcoming terms (2019–2026)
- **953 projects** with verified source provenance, mentors, skills, and issue links
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

