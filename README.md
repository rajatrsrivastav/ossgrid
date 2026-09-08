# 🌐 OSSGrid

> **A frictionless, high-performance web dashboard for exploring organizations, projects, and tech stacks across major open-source mentorship programs.**

This is a fast, public, no-login-required dashboard for exploring the open-source mentorship ecosystem (including LFX, GSoC, Outreachy, and more).

[![Sync LFX Data](https://github.com/rajatrsrivastav/ossgrid/actions/workflows/sync-data.yml/badge.svg)](https://github.com/rajatrsrivastav/ossgrid/actions/workflows/sync-data.yml

## ✨ Features

- 🔍 **Fuzzy Search** — Instantly search across organizations, projects, technologies, and mentor names with `⌘K`
- 🎯 **Multi-facet Filtering** — Filter by term, year, category, technology stack, and quick shortcuts
- 🌗 **Dark/Light Mode** — Beautiful glassmorphism design with seamless theme switching
- 🔗 **Shareable URLs** — Filters sync to URL query parameters for shareable filtered views
- 📱 **Fully Responsive** — Optimized grid layout from mobile to desktop
- ⚡ **100% Static** — Pre-built JSON datasets loaded client-side for instant performance
- 🤖 **Auto-synced Data** — GitHub Actions updates project data daily from [cncf/mentoring](https://github.com/cncf/mentoring)

## 📊 Data

Currently tracking:
- **80+ organizations** across **11 terms** (2022–2026)
- **560+ projects** with full details, mentors, and application links
- Technologies spanning Go, Rust, C++, Kubernetes, eBPF, Python, and more

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Search**: [Fuse.js](https://fusejs.io/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Pipeline**: Custom TypeScript parser for CNCF mentoring repo markdown

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/rajatrsrivastav/ossgrid.git
cd ossgrid

# Install dependencies
npm install

# Fetch latest LFX data
npx tsx scripts/fetch-lfx-data.ts

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## 📦 Project Structure

```
ossgrid/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── layout.tsx        # Root layout with fonts, theme, SEO
│   │   ├── page.tsx          # Main dashboard page
│   │   └── globals.css       # Design system + Tailwind
│   ├── components/           # React components
│   │   ├── Header.tsx        # Top header with search trigger
│   │   ├── SearchBar.tsx     # ⌘K command palette search
│   │   ├── SidebarFilter.tsx # Multi-facet filter panel
│   │   ├── OrganizationCard.tsx
│   │   ├── ProjectDetail.tsx # Modal with full project details
│   │   ├── StatusBanner.tsx  # Current term announcement
│   │   └── ThemeToggle.tsx   # Dark/light mode toggle
│   ├── hooks/                # Custom React hooks
│   │   └── useFilterState.ts # URL-synced filter state
│   └── lib/                  # Utilities and data logic
│       ├── types.ts          # TypeScript interfaces
│       ├── data.ts           # Data loading & filtering
│       ├── search.ts         # Fuse.js search config
│       └── utils.ts          # Shared helpers
├── scripts/
│   └── fetch-lfx-data.ts    # Data pipeline script
├── public/data/              # Generated JSON datasets
│   ├── organizations.json
│   └── projects.json
└── .github/workflows/
    └── sync-data.yml         # Daily data sync
```

## 🔄 Data Pipeline

The data pipeline (`scripts/fetch-lfx-data.ts`) automatically:

1. Fetches README.md files from each LFX term directory in `cncf/mentoring`
2. Parses markdown to extract organizations, projects, mentors, skills
3. Normalizes and aggregates data into unified JSON datasets
4. Generates deterministic SVG logo avatars

Run manually:
```bash
npx tsx scripts/fetch-lfx-data.ts
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT
# ossgrid
