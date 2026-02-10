# Madadgar — Product Requirements Document

**Version:** 1.0  
**Date:** February 8, 2025  
**Status:** Draft

---

## 1. Executive Summary

**Madadgar** (meaning "Helper" in Urdu) is a trust-based recommendation network—not a traditional services marketplace. Users share phone numbers and locations of trusted local service providers (mechanics, plumbers, cooks, electricians, etc.) whom they personally know. Skilled workers can self-post, but community recommendations are prioritized. The platform emphasizes trust, locality, and rapid contact (2 taps to call) with anti-spam and anti-business guardrails.

---

## 2. Objectives

| Objective | Description |
|-----------|-------------|
| **Trust-First** | Build a network where recommendations carry more weight than self-promotion. Trust score, badges, and "Recommended by X" drive discovery. |
| **Emergency-Friendly** | Minimize friction: 2 taps to contact (call/chat). Large CTAs, optional phone masking, location sharing. |
| **Local-First** | GPS-based discovery within 3–5 km. Categories and geo-indexing for fast nearby results. |
| **Anti-Business** | Max 3 posts/day per user, duplicate phone detection, rate limiting, shadow-hide on repeated reports. |
| **Community-Driven** | "Madad ki ❤️" (likes), reviews, badges, and moderation to keep quality high. |

---

## 3. Personas

### 3.1 Seeker (Ali)
- **Profile:** Resident of Lahore, needs a plumber urgently.
- **Goals:** Find a trusted local plumber quickly; avoid spam/scam listings.
- **Pain:** Unreliable Google results, cold-calling strangers, no verification.

### 3.2 Recommender (Sana)
- **Profile:** Has used a mechanic for 5 years; wants to help neighbors.
- **Goals:** Share trusted contacts; contribute to community; earn trust score.
- **Pain:** WhatsApp groups are noisy; no structured way to share and rank.

### 3.3 Worker (Rashid)
- **Profile:** Electrician, self-employed, serves 3–4 localities.
- **Goals:** Get discovered; show availability; collect reviews.
- **Pain:** Self-posts rank lower initially; must earn recommendations to rise.

### 3.4 Admin/Moderator
- **Profile:** Platform team member.
- **Goals:** Curb spam, handle reports, enforce moderation policy.

---

## 4. User Journeys

### 4.1 Seeker: Find & Contact a Plumber
1. Open app → Phone OTP login.
2. Allow location (or enter city/area).
3. Select category: **Plumber**.
4. Feed shows: Nearby (default) → Top Rated → All.
5. Tap card → See worker profile, rating, "Recommended by 3 people", distance.
6. **2 taps:** Call or Chat.
7. Optional: Share location in chat.
8. After job: "Job Done" → Leave review (rating + optional text).

### 4.2 Recommender: Share Trusted Mechanic
1. Open app → Login.
2. Tap "Share Recommendation".
3. Select category: **Mechanic**.
4. Enter: phone number (required), optional name, location pin, short reason, relation tag (e.g., "mera mechanic").
5. Optional: Add 1–3 images.
6. Submit → Post appears in feed; starts with 0 "Madad ki ❤️".
7. Others can like, chat, or report.

### 4.3 Worker: Self-Post & Manage Availability
1. Login as worker → Create worker profile (skill, area, intro, gallery).
2. Create self-post: skill, area, availability toggle, work images, optional rate.
3. Self-post appears lower in feed until recommendations accumulate.
4. Toggle availability on/off.
5. Receive chats → Respond; "Job Done" triggers review prompt for seeker.

---

## 5. Scope: MVP vs Phase 2

### 5.1 MVP (Must Have)
- Phone OTP auth
- User + Worker profiles (name, area, trust score, recommendations count, history)
- 14 categories (fixed list)
- Feed: Nearby, Top Rated, All (3 tabs)
- Post types: Recommendation, Self-Post
- In-app chat: text, images, location sharing
- "Job Done" → review prompt
- Trust score, badges
- Anti-spam: 3 posts/day, duplicate phone, rate limit, cooldown
- Report / block, optional phone masking
- Disclaimer: platform shares user-submitted info
- Web (Next.js) + Mobile (Expo) responsive

### 5.2 Phase 2 (Post-MVP)
- Push notifications (new chat, new recommendation)
- Saved/favorites list
- In-app payments (optional)
- Multi-language (Urdu/English toggle)
- Advanced filters (price range, availability window)
- Admin dashboard for moderation
- Analytics for workers (views, contact rate)

---

## 6. Acceptance Criteria

### 6.1 Auth
- [ ] User can sign up with phone number
- [ ] OTP sent via Supabase Auth (Twilio/Firebase adapter)
- [ ] Session persists across app restarts
- [ ] Logout clears session

### 6.2 Profiles
- [ ] User profile: name, area, trust score, recommendations count, history
- [ ] Worker profile: skill, area, rating, "Recommended by X", gallery, availability toggle
- [ ] Trust score visible on cards and profiles

### 6.3 Feed
- [ ] Tab 1: Nearby (GPS, 3–5 km default)
- [ ] Tab 2: Top Rated (trust score + ratings)
- [ ] Tab 3: All (full city/category)
- [ ] Card shows: skill, rating, distance, "Recommended by X", availability badge

### 6.4 Posts
- [ ] Recommendation: category, optional worker name, mandatory phone, location, reason, relation tag, optional images
- [ ] Self-post: skill, area, availability, work images, intro, optional rate
- [ ] Max 3 posts/day per user
- [ ] Duplicate phone detection blocks/warns

### 6.5 Chat
- [ ] In-app chat with text, images, location sharing
- [ ] "Job Done" triggers review prompt
- [ ] Real-time via Supabase Realtime

### 6.6 Trust & Safety
- [ ] Report and block
- [ ] Optional phone masking
- [ ] Shadow-hide after repeated reports

---

## 7. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| No GPS permission | Fallback to city/area selection; show "All" feed with category filter |
| Same phone in multiple posts | Duplicate detection; warn recommender; allow only if different relation tag + justification |
| Worker gets 0 recommendations | Self-post remains; ranks below recommended; badge shows "New" |
| User hits 3 posts/day | Soft block with message: "Come back tomorrow" |
| Report spam | Triage: 3+ reports → shadow-hide; 5+ → manual review |
| Chat with blocked user | Hide thread; block further messages |
| Worker deletes profile | Posts remain; marked "Unavailable"; phone hidden |
| OTP not received | Retry with cooldown; show "Call me instead" option (Phase 2) |

---

## 8. Metrics

### 8.1 Activation
- % of signups who complete first post (recommendation or self-post)
- Time to first contact (call/chat) after signup

### 8.2 Retention
- D1, D7, D30 retention
- Weekly active recommenders (users who posted in last 7 days)
- Weekly active seekers (users who contacted in last 7 days)

### 8.3 Trust
- Avg trust score of top 20% of workers
- % of contacts that result in "Job Done" + review
- "Madad ki ❤️" rate per post

### 8.4 Safety
- Report rate per 1000 posts
- Block rate
- Shadow-hide rate
- Moderation queue size

---

## 9. Moderation Policy

- **Community reports:** Users can report posts (spam, fake, inappropriate, other).
- **Threshold 1 (3 reports):** Post shadow-hidden (not shown in feed; still visible to poster).
- **Threshold 2 (5 reports):** Manual review; possible removal.
- **Block:** User can block another; no further interaction.
- **Duplicate phone:** Automated flag; recommender must confirm relation or post is blocked.
- **Hate speech / illegal:** Immediate removal; account review.
- **Appeals:** Phase 2: allow poster to appeal shadow-hide.

---

## 10. Tech Stack

### 10.1 Stack Lock (MVP)
- **Web:** Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
- **Mobile:** React Native Expo + TypeScript
- **Backend:** Supabase (Postgres, Auth, Storage, Realtime)
- **Maps:** Google Maps API (geo, distance, place autocomplete)

### 10.2 Option A: Fast MVP
| Layer | Choice | Reasoning |
|-------|--------|-----------|
| Web | Next.js 15 + Tailwind + shadcn | Rapid UI, SSR for SEO, App Router for modern patterns |
| Mobile | Expo | Single codebase, OTA updates, fast iteration |
| Backend | Supabase | Auth, DB, Storage, Realtime in one; minimal DevOps |
| Maps | Google Maps | Mature, reliable, geo + distance APIs |

### 10.3 Option B: Enterprise-Ready
| Layer | Choice | Reasoning |
|-------|--------|-----------|
| Web | Next.js 15 + Tailwind + shadcn | Same as MVP |
| Mobile | Expo (or React Native bare) | Expo for speed; bare for native modules if needed |
| Backend | Supabase + Edge Functions | Supabase for core; Edge Functions for heavy logic |
| Maps | Google Maps + PostGIS | PostGIS for advanced geo queries if scale demands |
| Search | Algolia / Meilisearch | Full-text + geo search for large datasets |
| CDN | Vercel / Cloudflare | Edge caching, global distribution |

### 10.4 Decision for MVP
**Use Option A (Fast MVP)** to ship in 6–8 weeks. Move to Option B as usage grows (e.g., >10k posts, >50k users).

---

## 11. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
├─────────────────────────────┬───────────────────────────────────────────┤
│   Web (Next.js 15)          │   Mobile (Expo)                            │
│   - App Router              │   - React Native                           │
│   - Tailwind + shadcn/ui    │   - Shared API client                      │
│   - Server Components       │   - Native maps/location                   │
└─────────────────────────────┴───────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API LAYER (Next.js API / Supabase)               │
│   - REST endpoints (or RPC)  - Auth middleware  - Rate limiting          │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Supabase      │     │   Google Maps API    │     │   Supabase Realtime  │
│   - Postgres    │     │   - Geocoding        │     │   - Chat channels    │
│   - Auth (OTP)  │     │   - Distance Matrix  │     │   - Presence         │
│   - Storage     │     │   - Place Autocomplete│    │                     │
│   - RLS         │     │                     │     │                     │
└─────────────────┘     └─────────────────────┘     └─────────────────────┘
```

### 11.1 Key Flows
- **Auth:** Phone → Supabase Auth (OTP) → JWT → RLS
- **Feed:** Client sends lat/lng + category → Postgres geo query (PostGIS or `earth_distance`) → ranked results
- **Chat:** Supabase Realtime channels per thread; messages stored in `messages` table
- **Search:** Full-text on post content; geo filter applied
- **Storage:** Images → Supabase Storage (signed URLs); RLS on bucket

---

## 12. Data Model & DB Schema

### 12.1 ER Diagram (Conceptual)
```
users ──┬── profiles (1:1)
        ├── posts (1:N)
        ├── recommendations (1:N)
        ├── ratings (1:N)
        ├── reports (1:N)
        └── chat_participants (1:N) ── chat_threads (N:M)

posts ──┬── categories (N:1)
        ├── phone_entities (N:1)
        └── ratings (1:N)

chat_threads ── messages (1:N)
```

### 12.2 Tables

#### 12.2.1 `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
```

#### 12.2.2 `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  area TEXT,
  city TEXT,
  is_worker BOOLEAN DEFAULT FALSE,
  worker_skill TEXT,           -- one of 14 categories
  worker_intro TEXT,
  worker_rate TEXT,           -- optional, e.g. "500/hr"
  availability BOOLEAN DEFAULT TRUE,
  gallery_urls TEXT[],        -- Supabase Storage URLs
  trust_score DECIMAL(5,2) DEFAULT 0,
  recommendations_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_profiles_worker_skill ON profiles(worker_skill) WHERE is_worker = TRUE;
CREATE INDEX idx_profiles_availability ON profiles(availability) WHERE is_worker = TRUE;
CREATE INDEX idx_profiles_trust ON profiles(trust_score DESC);
```

#### 12.2.3 `categories`
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0
);

-- Insert 14 categories
INSERT INTO categories (slug, name, sort_order) VALUES
  ('mechanic', 'Mechanic', 1),
  ('electrician', 'Electrician', 2),
  ('plumber', 'Plumber', 3),
  ('ac-technician', 'AC Technician', 4),
  ('cook', 'Cook', 5),
  ('driver', 'Driver', 6),
  ('cleaner', 'Cleaner', 7),
  ('carpenter', 'Carpenter', 8),
  ('painter', 'Painter', 9),
  ('generator-tech', 'Generator Tech', 10),
  ('welder', 'Welder', 11),
  ('mobile-repair', 'Mobile Repair', 12),
  ('computer-it', 'Computer/IT', 13),
  ('emergency-helper', 'Emergency Helper', 14);
```

#### 12.2.4 `phone_entities`
```sql
CREATE TABLE phone_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  normalized_phone TEXT NOT NULL,  -- digits only for dedup
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_phone_entities_normalized ON phone_entities(normalized_phone);
```

#### 12.2.5 `posts`
```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  phone_entity_id UUID REFERENCES phone_entities(id),
  post_type TEXT NOT NULL CHECK (post_type IN ('recommendation', 'self')),
  worker_name TEXT,
  phone TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326),  -- PostGIS for geo
  area_text TEXT,
  reason TEXT,
  relation_tag TEXT,
  intro TEXT,
  images TEXT[],
  availability BOOLEAN DEFAULT TRUE,
  optional_rate TEXT,
  shadow_hidden BOOLEAN DEFAULT FALSE,
  madad_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_location ON posts USING GIST(location);
CREATE INDEX idx_posts_feed ON posts(category_id, shadow_hidden, created_at DESC) WHERE shadow_hidden = FALSE;
```

#### 12.2.6 `recommendations`
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  recommender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, recommender_id)
);

CREATE INDEX idx_recommendations_post ON recommendations(post_id);
CREATE INDEX idx_recommendations_recommender ON recommendations(recommender_id);
```

#### 12.2.7 `ratings`
```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID,  -- chat thread or contact event
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  job_done BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, rater_id, contact_id)
);

CREATE INDEX idx_ratings_post ON ratings(post_id);
CREATE INDEX idx_ratings_rater ON ratings(rater_id);
```

#### 12.2.8 `chat_threads`
```sql
CREATE TABLE chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_participants (
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'seeker',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (thread_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

#### 12.2.9 `reports`
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_post ON reports(post_id);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
```

#### 12.2.10 `blocks`
```sql
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
```

#### 12.2.11 `post_daily_count`
```sql
CREATE TABLE post_daily_count (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  count INT DEFAULT 0,
  PRIMARY KEY (user_id, date)
);
```

### 12.3 RLS Policies (Summary)

| Table | Policy | Description |
|-------|--------|-------------|
| profiles | SELECT | Public read for non-sensitive fields |
| profiles | INSERT/UPDATE | Own profile only |
| posts | SELECT | Exclude shadow_hidden for others |
| posts | INSERT | Max 3/day check via trigger |
| posts | UPDATE | Own post only |
| ratings | INSERT | Rater = current user |
| chat_threads | SELECT | Participants only |
| messages | INSERT | Sender must be participant |
| reports | INSERT | Reporter = current user |
| blocks | ALL | Blocker = current user |

### 12.4 Core Queries

#### Feed: Nearby (3–5 km)
```sql
SELECT p.*, c.name as category_name,
       ST_Distance(p.location::geography, ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography) as distance_m
FROM posts p
JOIN categories c ON p.category_id = c.id
WHERE p.shadow_hidden = FALSE
  AND ($category_id IS NULL OR p.category_id = $category_id)
  AND ST_DWithin(p.location::geography, ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography, 5000)
ORDER BY distance_m ASC, p.trust_score DESC, p.created_at DESC
LIMIT 50;
```

#### Feed: Top Rated
```sql
SELECT p.*, c.name,
       (SELECT AVG(rating) FROM ratings WHERE post_id = p.id) as avg_rating,
       (SELECT COUNT(*) FROM recommendations WHERE post_id = p.id) as rec_count
FROM posts p
JOIN categories c ON p.category_id = c.id
WHERE p.shadow_hidden = FALSE
  AND ($category_id IS NULL OR p.category_id = $category_id)
ORDER BY avg_rating DESC NULLS LAST, rec_count DESC, p.trust_score DESC, p.created_at DESC
LIMIT 50;
```

#### Duplicate Phone Check
```sql
SELECT id FROM phone_entities WHERE normalized_phone = $normalized;
```

---

## 13. API Design

### 13.1 Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/otp/send` | Send OTP to phone |
| POST | `/auth/otp/verify` | Verify OTP, return session |

### 13.2 Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profiles/me` | Current user profile |
| PUT | `/profiles/me` | Update profile |
| GET | `/profiles/:id` | Public profile (masked phone if opted) |

### 13.3 Feed
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/feed/nearby` | `?lat=&lng=&category=&radius=5000` |
| GET | `/feed/top-rated` | `?category=&city=` |
| GET | `/feed/all` | `?category=&city=&page=` |

### 13.4 Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/posts` | Create recommendation or self-post |
| GET | `/posts/:id` | Post detail |
| PATCH | `/posts/:id` | Update own post (availability, etc.) |
| POST | `/posts/:id/madad` | "Madad ki ❤️" (like) |
| DELETE | `/posts/:id` | Soft delete own post |

### 13.5 Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/threads` | Create thread (post_id, initiator) |
| GET | `/chat/threads` | List user's threads |
| GET | `/chat/threads/:id/messages` | Messages (paginated) |
| POST | `/chat/threads/:id/messages` | Send message |
| POST | `/chat/threads/:id/job-done` | Trigger review prompt |

### 13.6 Ratings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ratings` | Submit rating (post_id, rating, review_text) |
| GET | `/posts/:id/ratings` | Ratings for post |

### 13.7 Safety
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reports` | Report post or user |
| POST | `/blocks` | Block user |
| DELETE | `/blocks/:user_id` | Unblock |

### 13.8 Permissions
- All endpoints require auth except OTP send.
- RLS enforces: user can only modify own data; blocks hide content.
- Rate limit: 10 req/min for feed; 3 posts/day via app logic + DB trigger.

---

## 14. Ranking Algorithm

### 14.1 Trust Score Formula (Pseudocode)
```
trust_score = 
  0.35 * unique_recommendations_normalized  (0–1 scale, cap at 20 recs)
+ 0.30 * job_done_reviews_normalized        (0–1 scale, cap at 50 reviews)
+ 0.20 * avg_rating_normalized              (1–5 → 0–1)
+ 0.15 * profile_age_normalized             (0–1, cap at 1 year)
- 0.10 * report_ratio                      (reports / views, 0–1)
```

### 14.2 Feed Ranking: Nearby
```
FOR each post in geo_radius(5km):
  score = 
    0.40 * (1 - distance/5000)           // closer = higher
  + 0.30 * trust_score_normalized
  + 0.20 * recency_factor                 // e.g. 1 / (1 + days_old)
  + 0.10 * availability_bonus             // +0.1 if available
  + 0.10 * madad_count_normalized
  SORT BY score DESC
```

### 14.3 Feed Ranking: Top Rated
```
score = 
  0.50 * trust_score
+ 0.30 * avg_rating
+ 0.15 * unique_recommendations_normalized
+ 0.05 * recency
SORT BY score DESC
```

### 14.4 Self-Post vs Recommendation
- Recommendation posts: full score as above.
- Self-posts: `score *= 0.6` until they receive at least 1 recommendation, then `score *= 0.9`.

---

## 15. UI/UX Requirements & Component List

### 15.1 Design Principles
- **Premium, clean:** Ample whitespace, clear typography (e.g. Inter, Plus Jakarta Sans).
- **Trust-first:** Badges, ratings, "Recommended by X" prominently displayed.
- **Emergency-friendly:** 2 taps to call; large CTAs (min 44px touch target).
- **Card-based feed:** Consistent card layout; large call/chat buttons.
- **Mobile-first:** Responsive for web; primary platform = mobile.

### 15.2 Components

| Component | Description |
|-----------|-------------|
| **FeedCard** | Skill, rating, distance, "Recommended by X", "Madad ki ❤️" count, availability badge, Call/Chat CTAs |
| **CategoryChip** | 14 categories, filter in feed |
| **FeedTabs** | Nearby | Top Rated | All |
| **WorkerProfile** | Skill, area, rating, gallery, "Recommended by N", availability toggle, Call/Chat |
| **UserProfile** | Name, area, trust score, recommendations count, history |
| **PostForm** | Recommendation: category, phone, location, reason, relation tag, images |
| **PostFormSelf** | Skill, area, availability, images, intro, rate |
| **ChatThread** | Messages list, input (text, image, location), Job Done button |
| **PhoneMaskToggle** | Optional masking (e.g. ***6789) |
| **Badge** | "Recommended by 10+", "Top Trusted Nearby" |
| **DisclaimerBanner** | "Platform shares user-submitted info" |

### 15.3 "Madad ki ❤️" Spec
- Label: `Madad ki ❤️` with heart icon.
- Count displayed next to it.
- One per user per post.
- Stored in `madad` or `recommendations`-like table.

### 15.4 Feed Card Layout
```
┌─────────────────────────────────────────┐
│ [Category]        [Availability •] 2.3km │
│ ⭐ 4.5  •  Recommended by 3 people       │
│ "Trusted mechanic, fair pricing"         │
│ Madad ki ❤️ 12                           │
│ [  📞 Call  ]  [  💬 Chat  ]             │
└─────────────────────────────────────────┘
```

---

## 16. Sprint Plan & Milestones

### Sprint 1 (Weeks 1–2): Foundation
- [ ] Supabase project setup
- [ ] DB schema + migrations
- [ ] RLS policies
- [ ] Phone OTP auth (Supabase + adapter)
- [ ] Next.js 15 project + Tailwind + shadcn
- [ ] Expo project setup
- [ ] Shared types (TypeScript)

### Sprint 2 (Weeks 3–4): Core Features
- [ ] User & worker profiles
- [ ] Categories seed
- [ ] Post create (recommendation + self)
- [ ] Duplicate phone check
- [ ] 3 posts/day limit
- [ ] Feed API: Nearby, Top Rated, All
- [ ] Google Maps integration (geo, distance)

### Sprint 3 (Weeks 5–6): Feed & Trust
- [ ] FeedCard component
- [ ] Feed tabs (Nearby, Top Rated, All)
- [ ] Trust score computation
- [ ] Badges
- [ ] "Madad ki ❤️" like
- [ ] Ranking algorithm

### Sprint 4 (Weeks 7–8): Chat & Reviews
- [ ] Chat threads + participants
- [ ] Realtime messages
- [ ] Image + location sharing
- [ ] Job Done → review prompt
- [ ] Ratings API + display

### Sprint 5 (Weeks 9–10): Safety & Polish
- [ ] Report / block
- [ ] Phone masking
- [ ] Shadow-hide logic
- [ ] Disclaimer banner
- [ ] QA pass

### Sprint 6 (Weeks 11–12): Beta & Launch
- [ ] Mobile polish (Expo)
- [ ] Performance + SEO
- [ ] Moderation runbook
- [ ] Beta launch

---

## 17. QA Checklist & Test Cases

### 17.1 Auth
- [ ] OTP sent on valid phone
- [ ] OTP verified and session created
- [ ] Invalid OTP rejected
- [ ] Session persists after refresh
- [ ] Logout clears session

### 17.2 Posts
- [ ] Recommendation post created with all required fields
- [ ] Self-post created
- [ ] 4th post in same day blocked
- [ ] Duplicate phone warned/blocked
- [ ] Post appears in feed (correct tab)

### 17.3 Feed
- [ ] Nearby returns posts within radius
- [ ] Top Rated sorts by trust + rating
- [ ] All returns paginated results
- [ ] Category filter works
- [ ] Shadow-hidden posts not shown

### 17.4 Chat
- [ ] Thread created between seeker and poster
- [ ] Messages sent and received in realtime
- [ ] Image uploaded and displayed
- [ ] Location shared
- [ ] Job Done triggers review modal

### 17.5 Trust & Safety
- [ ] Trust score updates after review
- [ ] Badges appear when thresholds met
- [ ] Report creates record
- [ ] Block hides user and threads
- [ ] 3 reports → shadow-hide

### 17.6 Edge Cases
- [ ] No GPS: fallback to city/area
- [ ] Empty feed: friendly message
- [ ] Rate limit: 429 returned
- [ ] Blocked user: no visibility

---

## 18. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **Phone number abuse** | Duplicate detection, rate limit, optional masking |
| **Spam/self-promotion** | 3 posts/day, self-posts rank lower, shadow-hide |
| **Fake recommendations** | Trust score, report ratio, moderation |
| **Privacy concerns** | Disclaimer, phone masking, minimal data collection |
| **Scale (geo queries)** | PostGIS indexes, consider caching for hot areas |
| **OTP delivery failure** | Retry with cooldown; Phase 2: "Call me" fallback |
| **Chat abuse** | Report/block, rate limit on messages |
| **Legal (data sharing)** | Clear ToS, disclaimer, consent flows |

---

## 19. Appendix

### A. Category Icons (Suggested)
- Mechanic: 🔧
- Electrician: ⚡
- Plumber: 🔩
- AC Technician: ❄️
- Cook: 👨‍🍳
- Driver: 🚗
- Cleaner: 🧹
- Carpenter: 🪚
- Painter: 🎨
- Generator Tech: 🔌
- Welder: 🔥
- Mobile Repair: 📱
- Computer/IT: 💻
- Emergency Helper: 🚨

### B. Glossary
- **Madad ki ❤️:** "Help with love" — like/endorsement
- **Trust score:** Composite metric (recs, reviews, reports, age)
- **Shadow-hide:** Post hidden from feed but visible to poster
- **Relation tag:** e.g. "mera mechanic" (my mechanic)

---

*End of PRD*
