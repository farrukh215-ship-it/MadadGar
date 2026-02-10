-- Madadgar - Functions & Triggers

-- 3 posts per day limit (SECURITY DEFINER so trigger can insert into post_daily_count)
CREATE OR REPLACE FUNCTION public.check_post_daily_limit()
RETURNS TRIGGER AS $$
DECLARE
  today_count INT;
BEGIN
  SELECT COALESCE(count, 0) INTO today_count
  FROM public.post_daily_count
  WHERE user_id = NEW.author_id AND date = CURRENT_DATE
  FOR UPDATE;
  
  IF today_count >= 3 THEN
    RAISE EXCEPTION 'MAX_POSTS_PER_DAY: Maximum 3 posts per day allowed';
  END IF;
  
  INSERT INTO public.post_daily_count (user_id, date, count)
  VALUES (NEW.author_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date) DO UPDATE SET count = public.post_daily_count.count + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER posts_daily_limit
  BEFORE INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.check_post_daily_limit();

-- Update madad_count when madad is added/removed
CREATE OR REPLACE FUNCTION public.update_madad_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET madad_count = madad_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET madad_count = madad_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER madad_count_insert
  AFTER INSERT ON public.madad
  FOR EACH ROW EXECUTE FUNCTION public.update_madad_count();

CREATE TRIGGER madad_count_delete
  AFTER DELETE ON public.madad
  FOR EACH ROW EXECUTE FUNCTION public.update_madad_count();

-- Shadow-hide after 3 reports
CREATE OR REPLACE FUNCTION public.check_report_shadow_hide()
RETURNS TRIGGER AS $$
DECLARE
  report_count INT;
BEGIN
  SELECT COUNT(*) INTO report_count
  FROM public.reports
  WHERE post_id = COALESCE(NEW.post_id, OLD.post_id);
  
  IF report_count >= 3 THEN
    UPDATE public.posts
    SET shadow_hidden = TRUE
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER reports_shadow_hide
  AFTER INSERT ON public.reports
  FOR EACH ROW
  WHEN (NEW.post_id IS NOT NULL)
  EXECUTE FUNCTION public.check_report_shadow_hide();

-- Feed: Nearby (RPC for geo query)
CREATE OR REPLACE FUNCTION public.feed_nearby(
  p_lat FLOAT,
  p_lng FLOAT,
  p_category_id UUID DEFAULT NULL,
  p_radius INT DEFAULT 5000,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  category_id UUID,
  category_name TEXT,
  post_type TEXT,
  worker_name TEXT,
  phone TEXT,
  area_text TEXT,
  reason TEXT,
  relation_tag TEXT,
  intro TEXT,
  images TEXT[],
  availability BOOLEAN,
  optional_rate TEXT,
  madad_count INT,
  distance_m FLOAT,
  created_at TIMESTAMPTZ,
  avg_rating DECIMAL,
  rec_count BIGINT
) AS $$
  SELECT
    p.id,
    p.author_id,
    p.category_id,
    c.name as category_name,
    p.post_type,
    p.worker_name,
    p.phone,
    p.area_text,
    p.reason,
    p.relation_tag,
    p.intro,
    p.images,
    p.availability,
    p.optional_rate,
    p.madad_count,
    ST_Distance(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    )::FLOAT as distance_m,
    p.created_at,
    (SELECT ROUND(AVG(r.rating)::numeric, 2) FROM public.ratings r WHERE r.post_id = p.id) as avg_rating,
    (SELECT COUNT(*) FROM public.recommendations rec WHERE rec.post_id = p.id) as rec_count
  FROM public.posts p
  JOIN public.categories c ON p.category_id = c.id
  WHERE p.shadow_hidden = FALSE
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND p.location IS NOT NULL
    AND ST_DWithin(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius
    )
  ORDER BY distance_m ASC, p.madad_count DESC, p.created_at DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Feed: Top Rated
CREATE OR REPLACE FUNCTION public.feed_top_rated(
  p_category_id UUID DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  category_id UUID,
  category_name TEXT,
  post_type TEXT,
  worker_name TEXT,
  phone TEXT,
  area_text TEXT,
  reason TEXT,
  relation_tag TEXT,
  intro TEXT,
  images TEXT[],
  availability BOOLEAN,
  optional_rate TEXT,
  madad_count INT,
  created_at TIMESTAMPTZ,
  avg_rating DECIMAL,
  rec_count BIGINT
) AS $$
  SELECT
    p.id,
    p.author_id,
    p.category_id,
    c.name as category_name,
    p.post_type,
    p.worker_name,
    p.phone,
    p.area_text,
    p.reason,
    p.relation_tag,
    p.intro,
    p.images,
    p.availability,
    p.optional_rate,
    p.madad_count,
    p.created_at,
    (SELECT ROUND(AVG(r.rating)::numeric, 2) FROM public.ratings r WHERE r.post_id = p.id) as avg_rating,
    (SELECT COUNT(*) FROM public.recommendations rec WHERE rec.post_id = p.id) as rec_count
  FROM public.posts p
  JOIN public.categories c ON p.category_id = c.id
  WHERE p.shadow_hidden = FALSE
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_city IS NULL OR p.area_text ILIKE '%' || p_city || '%')
  ORDER BY avg_rating DESC NULLS LAST, rec_count DESC, p.madad_count DESC, p.created_at DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
