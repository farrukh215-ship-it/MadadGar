-- Move PostGIS from public to extensions schema (fixes "must be owner" RLS error)
-- spatial_ref_sys is owned by extension; putting it in extensions schema excludes from API

-- 1. Drop objects that depend on PostGIS
DROP FUNCTION IF EXISTS public.feed_nearby(double precision, double precision, uuid, integer, integer);
DROP FUNCTION IF EXISTS public.feed_top_rated(uuid, text, integer);

DROP INDEX IF EXISTS public.idx_posts_location;

-- 2. Backup location data (ST_AsText before we drop PostGIS)
CREATE TEMP TABLE _postgis_location_backup AS SELECT id, ST_AsText(location) as loc_wkt FROM public.posts WHERE location IS NOT NULL;

-- 3. Drop location column
ALTER TABLE public.posts DROP COLUMN IF EXISTS location;

-- 4. Drop PostGIS from public
DROP EXTENSION IF EXISTS postgis CASCADE;

-- 5. Create extensions schema and reinstall PostGIS there
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;

-- 6. Add location column back (geography type now in extensions schema)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS location extensions.geography(POINT, 4326);

-- 7. Restore location data
UPDATE public.posts p SET location = extensions.ST_GeogFromText(b.loc_wkt)
FROM _postgis_location_backup b WHERE p.id = b.id;

-- 8. Recreate index
CREATE INDEX IF NOT EXISTS idx_posts_location ON public.posts USING GIST(location);

-- 9. Recreate feed functions (use extensions schema for PostGIS)
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
    extensions.ST_Distance(
      p.location::extensions.geography,
      extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::extensions.geography
    )::FLOAT as distance_m,
    p.created_at,
    (SELECT ROUND(AVG(r.rating)::numeric, 2) FROM public.ratings r WHERE r.post_id = p.id) as avg_rating,
    (SELECT COUNT(*) FROM public.recommendations rec WHERE rec.post_id = p.id) as rec_count
  FROM public.posts p
  JOIN public.categories c ON p.category_id = c.id
  WHERE p.shadow_hidden = FALSE
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND p.location IS NOT NULL
    AND extensions.ST_DWithin(
      p.location::extensions.geography,
      extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::extensions.geography,
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

GRANT EXECUTE ON FUNCTION public.feed_nearby(double precision, double precision, uuid, integer, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.feed_nearby(double precision, double precision, uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.feed_top_rated(uuid, text, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.feed_top_rated(uuid, text, integer) TO authenticated;

-- 10. Update create_post to use extensions schema for PostGIS
CREATE OR REPLACE FUNCTION public.create_post(
  p_author_id UUID,
  p_category_id UUID,
  p_post_type TEXT,
  p_phone TEXT,
  p_lat FLOAT DEFAULT NULL,
  p_lng FLOAT DEFAULT NULL,
  p_area_text TEXT DEFAULT NULL,
  p_worker_name TEXT DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_relation_tag TEXT DEFAULT NULL,
  p_intro TEXT DEFAULT NULL,
  p_optional_rate TEXT DEFAULT NULL,
  p_images TEXT[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_post_id UUID;
  v_location extensions.geography;
BEGIN
  IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
    v_location := extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::extensions.geography;
  ELSE
    v_location := NULL;
  END IF;

  INSERT INTO public.posts (
    author_id, category_id, post_type, phone, location,
    area_text, worker_name, reason, relation_tag, intro,
    optional_rate, images
  )
  VALUES (
    p_author_id, p_category_id, p_post_type, p_phone, v_location,
    p_area_text, p_worker_name, p_reason, p_relation_tag, p_intro,
    p_optional_rate, p_images
  )
  RETURNING id INTO v_post_id;

  RETURN v_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
