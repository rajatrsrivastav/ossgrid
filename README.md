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

Currently tracking programs like **LFX Mentorship** and **CNCF Google Summer of Code**, featuring:
- **80+ organizations** across historical and upcoming terms
- **560+ projects** with full details, mentees, mentors, and application links
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
git clone [https://github.com/rajatrsrivastav/ossgrid.git](https://github.com/rajatrsrivastav/ossgrid.git)
cd ossgrid

# Install dependencies
npm install

# Fetch latest LFX and GSoC data
npm run sync-data

# Start the dev server
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) to see the LFX dashboard.
*(The GSoC dashboard is accessible at `/gsoc`)*

## 📦 Project Structure

```
ossgrid/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── layout.tsx        # Root layout with next-themes
│   │   ├── page.tsx          # Main LFX dashboard page
│   │   ├── gsoc/             # Hidden GSoC dashboard route
│   │   └── organization/     # Dynamic organization detail pages
│   ├── components/           # React components (SearchBar, SidebarFilter, etc.)
│   ├── hooks/                # Custom React hooks
│   └── lib/                  # Utilities and data logic
├── scripts/
│   ├── fetch-lfx-data.ts     # LFX Data pipeline script
│   └── fetch-gsoc-data.ts    # GSoC Data pipeline script
├── public/data/              # Generated JSON datasets
│   ├── organizations.json
│   ├── projects.json
│   ├── gsoc-organizations.json
│   └── gsoc-projects.json
└── .github/workflows/
    └── sync-data.yml         # Daily data sync

```

## 🔄 Data Pipeline

The data pipelines (`scripts/fetch-lfx-data.ts` and `scripts/fetch-gsoc-data.ts`) automatically:

1. Fetch markdown and configuration files from upstream program repositories (e.g., `cncf/mentoring`).
2. Parse data to extract organizations, projects, mentors, mentees, and tech stacks.
3. Normalize and aggregate data into unified JSON datasets.

Run manually via package.json:

```bash
npm run sync-data

```

Or individually:

```bash
npx tsx scripts/fetch-lfx-data.ts
npx tsx scripts/fetch-gsoc-data.ts

```
