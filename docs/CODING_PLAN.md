# Madadgar — Coding Plan & Implementation Summary

## Stack Decision (MVP)

| Layer | Choice | Alternative | Rationale |
|-------|--------|-------------|-----------|
| **Backend** | Supabase | NestJS + Postgres + Redis | Faster MVP, Auth+DB+Storage+Realtime in one. NestJS for scale later. |
| **Maps** | Google Maps | Mapbox | Better Pakistan coverage, familiar UX. Mapbox cheaper at scale. |
| **Monorepo** | pnpm workspaces | npm / Turborepo | pnpm: fast, disk-efficient. |

## Directory Structure

```
madadgar/
├── apps/
│   ├── web/                 # Next.js 15 App Router
│   └── mobile/              # Expo (React Native)
├── packages/
│   ├── shared/              # Types, constants, utils
│   └── ui/                  # Tailwind preset, design tokens
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       ├── 003_functions.sql
│       ├── 004_create_post_rpc.sql
│       └── 005_storage_buckets.sql
├── pnpm-workspace.yaml
└── package.json
```

## Setup

### 1. Install dependencies
```bash
pnpm install
```

### 2. Supabase
- Create project at supabase.com
- Copy URL and anon key to `.env.local` (web) and `.env` (mobile)
- Run migrations: `pnpm db:push` or `supabase db push`
- Enable Realtime: Dashboard → Database → Replication → enable `messages` table
- Enable Phone Auth: Dashboard → Authentication → Providers → Phone
- Create storage buckets manually if migration fails: `post-images`, `chat-images`

### 3. Web
```bash
pnpm dev:web
# or: cd apps/web && pnpm dev
```

### 4. Mobile
```bash
cd apps/mobile
# Add EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_API_URL to .env
pnpm start
```

### 5. Mobile → Web API
For mobile to hit feed API, set `EXPO_PUBLIC_API_URL` to your web URL (e.g. `https://your-app.vercel.app` or local IP for dev).

## Key Files

| Path | Purpose |
|------|---------|
| `apps/web/src/app/api/feed/nearby/route.ts` | Geo-filtered feed |
| `apps/web/src/app/api/feed/top-rated/route.ts` | Top rated feed |
| `apps/web/src/app/api/posts/route.ts` | Create post |
| `apps/web/src/app/api/chat/threads/route.ts` | Create/get chat thread |
| `apps/web/src/app/api/storage/upload/route.ts` | Image upload |
| `apps/web/src/lib/supabase/realtime.ts` | Realtime chat subscription |
| `supabase/migrations/003_functions.sql` | `feed_nearby`, `feed_top_rated` RPCs |
| `supabase/migrations/004_create_post_rpc.sql` | Post creation with geography |

## Realtime Chat

- Subscribe: `subscribeToMessages(threadId, callback)` in `lib/supabase/realtime.ts`
- Messages table: `thread_id`, `sender_id`, `content`, `message_type`, `metadata`
- Enable in Supabase: Database → Replication → `messages` → ON

## Feed Query (Geo + Ranking)

- `feed_nearby`: PostGIS `ST_DWithin`, `ST_Distance`, sorted by distance
- `feed_top_rated`: `avg_rating`, `rec_count`, `madad_count` DESC
- Indexes: GIST on `posts.location`, composite on `category_id`, `shadow_hidden`

## Image Upload

- POST `/api/storage/upload` with `FormData` containing `file` and optional `bucket`
- Returns `{ url, path }`; use `url` in post `images` array

## Security (RLS)

- Posts: `shadow_hidden = FALSE` or `author_id = auth.uid()`
- Messages: participants only
- Storage: authenticated upload, public read for `post-images`

## Screens (MVP)

| Route | Screen |
|-------|--------|
| `/` | Home (links) |
| `/login` | OTP login |
| `/feed` | Feed (Nearby/Top/All, cards) |
| `/post` | Post creation (Recommend / Self) |
| `/profile` | User profile |
| `/chat` | Thread list |
| `/chat/[id]` | Chat screen |
