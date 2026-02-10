# Madadgar — Implementation Summary

## What Was Created

### 1. Monorepo Structure

```
madadgar/
├── apps/
│   ├── web/          # Next.js 15 (App Router) + TypeScript + Tailwind
│   └── mobile/       # Expo + React Native + TypeScript
├── packages/
│   ├── shared/       # Types, constants (categories, phone utils)
│   └── ui/           # Design tokens, Tailwind preset (optional)
├── supabase/migrations/
└── pnpm-workspace.yaml
```

### 2. Database Migrations (Supabase)

| File | Purpose |
|------|---------|
| `001_initial_schema.sql` | users, profiles, categories, posts, madad, recommendations, ratings, chat_threads, messages, reports, blocks, post_daily_count |
| `002_rls_policies.sql` | RLS on all tables |
| `003_functions.sql` | Triggers (3 posts/day, madad count, shadow-hide), `feed_nearby`, `feed_top_rated` RPCs |
| `004_create_post_rpc.sql` | `create_post` RPC with PostGIS geography |
| `005_storage_buckets.sql` | post-images, chat-images buckets + RLS |

### 3. API Routes (Next.js)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/feed/nearby` | Geo-filtered feed (lat, lng, radius, category) |
| GET | `/api/feed/top-rated` | Top rated feed |
| GET | `/api/feed/all` | Full feed |
| GET | `/api/categories` | List categories |
| POST | `/api/posts` | Create post (recommendation or self) |
| POST | `/api/chat/threads` | Create/get chat thread for post |
| POST | `/api/storage/upload` | Upload image, return URL |

### 4. Realtime Chat

- `apps/web/src/lib/supabase/realtime.ts`: `subscribeToMessages(threadId, callback)`
- Supabase Realtime on `messages` table (enable in Dashboard → Database → Replication)

### 5. Feed Query (Geo + Ranking)

- `feed_nearby`: PostGIS `ST_DWithin`, `ST_Distance`, sorted by distance, madad_count, created_at
- `feed_top_rated`: sorted by avg_rating, rec_count, madad_count

### 6. Image Upload

- POST `/api/storage/upload` with `FormData` (`file`, optional `bucket`)
- Returns `{ url, path }`; add `url` to post `images` array

### 7. Security (RLS)

- Posts: visible if `shadow_hidden = FALSE` or author
- Messages: participants only
- Storage: authenticated upload, public read for post-images

### 8. MVP Screens

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Home with links |
| `/login` | `app/login/page.tsx` | Phone OTP login |
| `/feed` | `app/feed/page.tsx` | Feed tabs (Nearby/Top/All), cards, Call/Chat |
| `/post` | `app/post/page.tsx` | Choose type → form |
| `/profile` | `app/profile/page.tsx` | User profile |
| `/chat` | `app/chat/page.tsx` | Thread list |
| `/chat/[id]` | `app/chat/[id]/page.tsx` | Chat screen with realtime |

### 9. Mobile (Expo)

- `app/(auth)/login.tsx` — OTP login
- `app/(tabs)/feed.tsx` — Feed (hits web API)
- `app/(tabs)/post.tsx` — Placeholder
- `app/(tabs)/chat.tsx` — Placeholder
- `app/(tabs)/profile.tsx` — Profile

### 10. Maps Recommendation

**Google Maps** for Pakistan (better coverage, familiar UX). Add `@react-google-maps/api` or `@vis.gl/react-google-maps` when implementing location picker.

## Quick Start

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
# Edit .env files with Supabase URL + anon key
supabase db push
pnpm dev:web
```

## Alternative: NestJS + Postgres + Redis

For enterprise scale, replace Supabase with:

- **NestJS** API
- **Postgres** + Prisma/TypeORM
- **Redis** for sessions, rate limiting
- **Socket.IO** or **Redis Pub/Sub** for chat
- **Twilio** for OTP

See PRD for full comparison.
