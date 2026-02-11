-- Grant execute on ensure_user_profile (4-param version with gender)
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(uuid, text, text, text) TO authenticated;
