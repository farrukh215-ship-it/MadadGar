# Madadgar

**Trust-based recommendation network** for local service providers (mechanics, plumbers, electricians, cooks, etc.). Share and discover trusted contacts—not just a marketplace.

---

## Quick Links

| Document | Description |
|----------|-------------|
| [PRD.md](docs/PRD.md) | Full Product Requirements Document |
| [UI_UX_SPECIFICATION.md](docs/UI_UX_SPECIFICATION.md) | Complete UI/UX spec (IA, screens, design system) |
| [PREMIUM_UI_DESIGN.md](docs/PREMIUM_UI_DESIGN.md) | Premium design system (trust-first, emergency-ready) |
| [IMPLEMENTATION_BLUEPRINT.md](docs/IMPLEMENTATION_BLUEPRINT.md) | Technical implementation guide |
| [API_SPEC.md](docs/API_SPEC.md) | API endpoints & contracts |
| [supabase/migrations/](supabase/migrations/) | Database schema & RLS |

---

## Tech Stack (MVP)

- **Web:** Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
- **Mobile:** React Native Expo + TypeScript
- **Backend:** Supabase (Postgres, Auth, Storage, Realtime)
- **Maps:** Google Maps API

---

## Features

- **Phone OTP Auth** — No email required
- **14 Categories** — Mechanic, Electrician, Plumber, AC Tech, Cook, Driver, Cleaner, Carpenter, Painter, Generator Tech, Welder, Mobile Repair, Computer/IT, Emergency Helper
- **Feed Tabs** — Nearby (GPS), Top Rated, All
- **Post Types** — Recommendation (by user) or Self-post (by worker)
- **In-app Chat** — Text, images, location sharing; "Job Done" → review
- **Trust & Badges** — Trust score, "Recommended by X", "Madad ki ❤️"
- **Anti-spam** — Max 3 posts/day, duplicate phone detection, shadow-hide on reports

---

## Project Setup

```bash
# Install
pnpm install

# Supabase: create project, add .env.local (web) and .env (mobile)
# Then: supabase db push

# Web
pnpm dev:web

# Mobile (set EXPO_PUBLIC_API_URL to web URL)
cd apps/mobile && pnpm start
```

See [docs/CODING_PLAN.md](docs/CODING_PLAN.md) for full setup.

---

## License

Proprietary — All rights reserved.
