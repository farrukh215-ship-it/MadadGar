-- RPC: Get users within radius who share an interest (for Nearby category)
CREATE OR REPLACE FUNCTION public.nearby_users_by_interest(
  p_lat FLOAT,
  p_lng FLOAT,
  p_interest_slug TEXT,
  p_radius_km INT DEFAULT 10,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  gender TEXT,
  distance_km FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pr.user_id,
    pr.display_name,
    pr.avatar_url,
    pr.gender,
    (extensions.ST_Distance(
      pr.location::extensions.geography,
      extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::extensions.geography
    ) / 1000.0)::float AS distance_km
  FROM public.profiles pr
  JOIN public.user_interests ui ON ui.user_id = pr.user_id
  WHERE ui.interest_slug = p_interest_slug
    AND pr.user_id != auth.uid()
    AND pr.location IS NOT NULL
    AND extensions.ST_DWithin(
      pr.location::extensions.geography,
      extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::extensions.geography,
      p_radius_km * 1000.0
    )
  ORDER BY pr.location::extensions.geography <-> extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::extensions.geography
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.nearby_users_by_interest(float, float, text, int, int) TO authenticated;

-- RPC: Get nearby users (within radius) who share at least one interest
CREATE OR REPLACE FUNCTION public.nearby_users_shared_interests(
  p_lat FLOAT,
  p_lng FLOAT,
  p_radius_km INT DEFAULT 10,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  gender TEXT,
  distance_km FLOAT,
  shared_interests TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH my_interests AS (
    SELECT interest_slug FROM public.user_interests WHERE user_id = auth.uid()
  ),
  nearby AS (
    SELECT
      pr.user_id,
      pr.display_name,
      pr.avatar_url,
      pr.gender,
      (extensions.ST_Distance(
        pr.location::extensions.geography,
        extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::extensions.geography
      ) / 1000.0)::float AS distance_km
    FROM public.profiles pr
    WHERE pr.user_id != auth.uid()
      AND pr.location IS NOT NULL
      AND extensions.ST_DWithin(
        pr.location::extensions.geography,
        extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::extensions.geography,
        p_radius_km * 1000.0
      )
  ),
  shared AS (
    SELECT n.user_id, n.display_name, n.avatar_url, n.gender, n.distance_km,
      array_agg(DISTINCT ui.interest_slug) FILTER (WHERE mi.interest_slug IS NOT NULL) AS slugs
    FROM nearby n
    JOIN public.user_interests ui ON ui.user_id = n.user_id
    LEFT JOIN my_interests mi ON mi.interest_slug = ui.interest_slug
    GROUP BY n.user_id, n.display_name, n.avatar_url, n.gender, n.distance_km
    HAVING count(mi.interest_slug) > 0
  )
  SELECT s.user_id, s.display_name, s.avatar_url, s.gender, s.distance_km, s.slugs
  FROM shared s
  ORDER BY s.distance_km
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.nearby_users_shared_interests(float, float, int, int) TO authenticated;
