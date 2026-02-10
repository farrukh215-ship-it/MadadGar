-- RPC for creating posts with proper geography handling
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
  v_location GEOGRAPHY;
BEGIN
  IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
    v_location := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;
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
