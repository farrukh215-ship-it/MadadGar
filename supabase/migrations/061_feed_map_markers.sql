-- RPC: Get post markers for map view (id, lat, lng, worker_name, category_name, etc.)
CREATE OR REPLACE FUNCTION public.feed_map_markers(
  p_lat FLOAT,
  p_lng FLOAT,
  p_radius INT DEFAULT 10000,
  p_limit INT DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  category_name TEXT,
  worker_name TEXT,
  phone TEXT,
  area_text TEXT,
  images TEXT[],
  lat FLOAT,
  lng FLOAT,
  distance_m FLOAT,
  availability BOOLEAN,
  avg_rating DECIMAL
) AS $$
  SELECT
    p.id,
    p.author_id,
    c.name as category_name,
    p.worker_name,
    p.phone,
    p.area_text,
    p.images,
    ST_Y(p.location::geometry)::FLOAT as lat,
    ST_X(p.location::geometry)::FLOAT as lng,
    ST_Distance(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    )::FLOAT as distance_m,
    p.availability,
    (SELECT ROUND(AVG(r.rating)::numeric, 2) FROM public.ratings r WHERE r.post_id = p.id) as avg_rating
  FROM public.posts p
  JOIN public.categories c ON p.category_id = c.id
  WHERE p.shadow_hidden = FALSE
    AND p.location IS NOT NULL
    AND ST_DWithin(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius
    )
  ORDER BY distance_m ASC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.feed_map_markers(float, float, int, int) TO anon;
GRANT EXECUTE ON FUNCTION public.feed_map_markers(float, float, int, int) TO authenticated;
