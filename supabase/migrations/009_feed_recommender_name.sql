-- Add recommender/author display name to feed functions
-- Must DROP first because return type is changing (cannot change OUT params with CREATE OR REPLACE)

DROP FUNCTION IF EXISTS public.feed_nearby(double precision, double precision, uuid, integer, integer);
DROP FUNCTION IF EXISTS public.feed_top_rated(uuid, text, integer);

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
  author_name TEXT,
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
    COALESCE((SELECT pr2.display_name FROM public.profiles pr2 WHERE pr2.user_id = p.author_id LIMIT 1), 'User') as author_name,
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

CREATE OR REPLACE FUNCTION public.feed_top_rated(
  p_category_id UUID DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  author_name TEXT,
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
    COALESCE((SELECT pr2.display_name FROM public.profiles pr2 WHERE pr2.user_id = p.author_id LIMIT 1), 'User') as author_name,
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

-- Grant execute so anon/authenticated can call via REST API
GRANT EXECUTE ON FUNCTION public.feed_nearby(double precision, double precision, uuid, integer, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.feed_nearby(double precision, double precision, uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.feed_top_rated(uuid, text, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.feed_top_rated(uuid, text, integer) TO authenticated;
