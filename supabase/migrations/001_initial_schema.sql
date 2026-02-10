-- Madadgar - Initial Schema
-- Run with: supabase db push

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users (extends Supabase auth.users - link via id)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON public.users(phone);

-- Categories (fixed 14)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0
);

INSERT INTO public.categories (slug, name, sort_order) VALUES
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

-- Phone entities (dedup)
CREATE TABLE public.phone_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  normalized_phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_phone_entities_normalized ON public.phone_entities(normalized_phone);

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  area TEXT,
  city TEXT,
  is_worker BOOLEAN DEFAULT FALSE,
  worker_skill TEXT,
  worker_intro TEXT,
  worker_rate TEXT,
  availability BOOLEAN DEFAULT TRUE,
  gallery_urls TEXT[] DEFAULT '{}',
  trust_score DECIMAL(5,2) DEFAULT 0,
  recommendations_count INT DEFAULT 0,
  phone_masked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_profiles_user ON public.profiles(user_id);
CREATE INDEX idx_profiles_worker_skill ON public.profiles(worker_skill) WHERE is_worker = TRUE;
CREATE INDEX idx_profiles_availability ON public.profiles(availability) WHERE is_worker = TRUE;
CREATE INDEX idx_profiles_trust ON public.profiles(trust_score DESC);

-- Posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  phone_entity_id UUID REFERENCES public.phone_entities(id),
  post_type TEXT NOT NULL CHECK (post_type IN ('recommendation', 'self')),
  worker_name TEXT,
  phone TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  area_text TEXT,
  reason TEXT,
  relation_tag TEXT,
  intro TEXT,
  images TEXT[] DEFAULT '{}',
  availability BOOLEAN DEFAULT TRUE,
  optional_rate TEXT,
  shadow_hidden BOOLEAN DEFAULT FALSE,
  madad_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_category ON public.posts(category_id);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX idx_posts_location ON public.posts USING GIST(location);
CREATE INDEX idx_posts_feed ON public.posts(category_id, created_at DESC) WHERE shadow_hidden = FALSE;

-- Madad (likes)
CREATE TABLE public.madad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_madad_post ON public.madad(post_id);
CREATE INDEX idx_madad_user ON public.madad(user_id);

-- Recommendations (explicit "I recommend" - can be separate from madad)
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  recommender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, recommender_id)
);

CREATE INDEX idx_recommendations_post ON public.recommendations(post_id);
CREATE INDEX idx_recommendations_recommender ON public.recommendations(recommender_id);

-- Ratings
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  contact_id UUID,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  job_done BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ratings_post ON public.ratings(post_id);
CREATE INDEX idx_ratings_rater ON public.ratings(rater_id);

-- Chat
CREATE TABLE public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.chat_participants (
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'seeker',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (thread_id, user_id)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_thread ON public.messages(thread_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);

-- Reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_post ON public.reports(post_id);
CREATE INDEX idx_reports_reporter ON public.reports(reporter_id);

-- Blocks
CREATE TABLE public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocker ON public.blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON public.blocks(blocked_id);

-- Post daily count (anti-spam)
CREATE TABLE public.post_daily_count (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  count INT DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Sync auth.users -> users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
