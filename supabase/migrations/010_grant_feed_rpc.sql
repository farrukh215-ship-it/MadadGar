-- Grant execute on feed RPCs to anon/authenticated (required after DROP/CREATE in 009)
-- Without this, RPC calls via REST API return 500 "unexpected_failure"

GRANT EXECUTE ON FUNCTION public.feed_nearby(double precision, double precision, uuid, integer, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.feed_nearby(double precision, double precision, uuid, integer, integer) TO authenticated;

GRANT EXECUTE ON FUNCTION public.feed_top_rated(uuid, text, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.feed_top_rated(uuid, text, integer) TO authenticated;
