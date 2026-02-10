# Madadgar — Implementation Blueprint

**Companion to PRD.md** | Technical implementation guide for engineering team

---

## 1. Project Structure

```
madadgar/
├── apps/
│   ├── web/                    # Next.js 15 (App Router)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── verify/
│   │   │   ├── (main)/
│   │   │   │   ├── feed/
│   │   │   │   ├── post/
│   │   │   │   ├── profile/
│   │   │   │   └── chat/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── feed/
│   │   │   ├── profile/
│   │   │   ├── chat/
│   │   │   └── ui/            # shadcn
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   ├── api/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   └── mobile/                # Expo
│       ├── app/
│       │   ├── (auth)/
│       │   ├── (tabs)/
│       │   │   ├── feed.tsx
│       │   │   ├── chat.tsx
│       │   │   └── profile.tsx
│       │   └── _layout.tsx
│       ├── components/
│       ├── lib/
│       └── package.json
│
├── packages/
│   └── shared/                # Shared types, constants
│       ├── src/
│       │   ├── types/
│       │   ├── constants/
│       │   └── utils/
│       └── package.json
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_functions.sql
│   ├── functions/
│   └── seed.sql
│
└── docs/
    ├── PRD.md
    ├── IMPLEMENTATION_BLUEPRINT.md
    └── API_SPEC.md
```

---

## 2. Supabase Setup

### 2.1 Enable Extensions
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
```

### 2.2 Auth Configuration
- Enable Phone provider in Supabase Dashboard
- Configure Twilio (or Firebase) for OTP
- Customize OTP template for branding

### 2.3 Storage Buckets
- `post-images`: Public read, authenticated write, RLS by post author
- `profile-avatars`: Public read, owner write
- `chat-images`: Participant-only read/write

---

## 3. RLS Policies (Detailed)

### 3.1 profiles
```sql
-- Anyone can read profiles (with masking for phone)
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (true);

-- Only owner can update
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

### 3.2 posts
```sql
-- Select: exclude shadow_hidden for others
CREATE POLICY "posts_select_visible" ON posts
  FOR SELECT USING (
    shadow_hidden = FALSE OR author_id = auth.uid()
  );

-- Insert: check daily limit via trigger
CREATE POLICY "posts_insert_own" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Update: own only
CREATE POLICY "posts_update_own" ON posts
  FOR UPDATE USING (auth.uid() = author_id);
```

### 3.3 Trigger: 3 Posts/Day
```sql
CREATE OR REPLACE FUNCTION check_post_daily_limit()
RETURNS TRIGGER AS $$
DECLARE
  today_count INT;
BEGIN
  SELECT COALESCE(count, 0) INTO today_count
  FROM post_daily_count
  WHERE user_id = NEW.author_id AND date = CURRENT_DATE
  FOR UPDATE;
  
  IF today_count >= 3 THEN
    RAISE EXCEPTION 'MAX_POSTS_PER_DAY';
  END IF;
  
  INSERT INTO post_daily_count (user_id, date, count)
  VALUES (NEW.author_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date) DO UPDATE SET count = post_daily_count.count + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_daily_limit
  BEFORE INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION check_post_daily_limit();
```

---

## 4. Trust Score Function

```sql
CREATE OR REPLACE FUNCTION compute_trust_score(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_score DECIMAL := 0;
  v_recs INT;
  v_reviews INT;
  v_avg_rating DECIMAL;
  v_age_days INT;
  v_report_ratio DECIMAL;
BEGIN
  -- Unique recommendations (cap 20)
  SELECT COUNT(DISTINCT recommender_id) INTO v_recs
  FROM recommendations r
  JOIN posts p ON r.post_id = p.id
  WHERE p.author_id = p_user_id;
  v_score := v_score + 0.35 * LEAST(v_recs::DECIMAL / 20, 1);
  
  -- Job-done reviews (cap 50)
  SELECT COUNT(*) INTO v_reviews
  FROM ratings
  WHERE post_id IN (SELECT id FROM posts WHERE author_id = p_user_id)
    AND job_done = TRUE;
  v_score := v_score + 0.30 * LEAST(v_reviews::DECIMAL / 50, 1);
  
  -- Avg rating (1-5 → 0-1)
  SELECT COALESCE(AVG(rating), 0) / 5 INTO v_avg_rating
  FROM ratings
  WHERE post_id IN (SELECT id FROM posts WHERE author_id = p_user_id);
  v_score := v_score + 0.20 * v_avg_rating;
  
  -- Profile age (cap 365 days)
  SELECT EXTRACT(DAY FROM NOW() - created_at)::INT INTO v_age_days
  FROM profiles WHERE user_id = p_user_id;
  v_score := v_score + 0.15 * LEAST(v_age_days::DECIMAL / 365, 1);
  
  -- Report ratio (penalty)
  -- Simplified: use report count / (post count + 1)
  SELECT COALESCE(
    (SELECT COUNT(*) FROM reports WHERE post_id IN (SELECT id FROM posts WHERE author_id = p_user_id))::DECIMAL
    / NULLIF((SELECT COUNT(*) FROM posts WHERE author_id = p_user_id) + 1, 0),
    0
  ) INTO v_report_ratio;
  v_score := v_score - 0.10 * LEAST(v_report_ratio, 1);
  
  RETURN GREATEST(0, LEAST(1, v_score)) * 100;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. API Route Examples (Next.js)

### 5.1 Feed: Nearby
```typescript
// app/api/feed/nearby/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') ?? '0');
  const lng = parseFloat(searchParams.get('lng') ?? '0');
  const categoryId = searchParams.get('category') ?? null;
  const radius = parseInt(searchParams.get('radius') ?? '5000');

  const supabase = createClient();

  const { data, error } = await supabase.rpc('feed_nearby', {
    p_lat: lat,
    p_lng: lng,
    p_category_id: categoryId,
    p_radius: radius,
    p_limit: 50,
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
```

### 5.2 RPC: feed_nearby
```sql
CREATE OR REPLACE FUNCTION feed_nearby(
  p_lat FLOAT,
  p_lng FLOAT,
  p_category_id UUID DEFAULT NULL,
  p_radius INT DEFAULT 5000,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  category_name TEXT,
  post_type TEXT,
  worker_name TEXT,
  phone TEXT,
  area_text TEXT,
  reason TEXT,
  relation_tag TEXT,
  images TEXT[],
  madad_count INT,
  distance_m FLOAT,
  created_at TIMESTAMPTZ
) AS $$
  SELECT
    p.id,
    p.author_id,
    c.name as category_name,
    p.post_type,
    p.worker_name,
    p.phone,
    p.area_text,
    p.reason,
    p.relation_tag,
    p.images,
    p.madad_count,
    ST_Distance(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    )::FLOAT as distance_m,
    p.created_at
  FROM posts p
  JOIN categories c ON p.category_id = c.id
  WHERE p.shadow_hidden = FALSE
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND p.location IS NOT NULL
    AND ST_DWithin(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius
    )
  ORDER BY distance_m ASC, p.created_at DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;
```

---

## 6. Component Implementation Notes

### 6.1 FeedCard (React)
```tsx
// Key props
interface FeedCardProps {
  post: Post;
  onCall: () => void;
  onChat: () => void;
  onMadad: () => void;
  userMadadGiven: boolean;
}

// Layout: flex column, touch-friendly buttons 44px min
// Distance: format as "2.3 km" or "450 m"
// Badge: conditional "Recommended by 10+" | "Top Trusted Nearby"
```

### 6.2 Maps Integration
- Web: `@react-google-maps/api` or `@vis.gl/react-google-maps`
- Mobile: `react-native-maps` (Expo)
- Place autocomplete for area input
- `navigator.geolocation` or Expo Location for lat/lng

### 6.3 Realtime Chat
```typescript
// Subscribe to channel
supabase
  .channel(`thread:${threadId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `thread_id=eq.${threadId}`,
  }, (payload) => {
    // Append message to state
  })
  .subscribe();
```

---

## 7. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Optional: Twilio for OTP (if not using Supabase built-in)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

---

## 8. Deployment

### Web
- **Vercel** (recommended for Next.js): `vercel deploy`
- Set env vars in Vercel dashboard
- Enable Edge for API routes if needed

### Mobile
- **EAS Build** (Expo): `eas build --platform all`
- Configure `app.json` for OTA updates
- Submit to stores via EAS Submit

### Supabase
- Project on Supabase Cloud
- Run migrations: `supabase db push`
- Enable Realtime for `messages` table

---

## 9. Performance Checklist

- [ ] PostGIS index on `posts.location`
- [ ] Composite index on `(category_id, shadow_hidden, created_at)` for feed
- [ ] Image optimization: Next.js Image + WebP
- [ ] Lazy load feed (infinite scroll)
- [ ] Cache category list (static)
- [ ] Debounce geo requests on map move

---

*End of Implementation Blueprint*
