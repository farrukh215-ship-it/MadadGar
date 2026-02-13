import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, gender, date_of_birth, bio, avatar_url, marital_status, city')
    .eq('user_id', user.id)
    .single();

  const required = {
    display_name: !!profile?.display_name?.trim(),
    gender: !!profile?.gender,
    date_of_birth: !!profile?.date_of_birth,
    bio: !!profile?.bio?.trim(),
    avatar_url: !!profile?.avatar_url,
  };

  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  const is_complete = missing.length === 0;

  // Profile completion % for trust + engagement prompt (avatar, name, area, bio)
  const completionFields = {
    avatar: !!profile?.avatar_url,
    display_name: !!profile?.display_name?.trim(),
    area: !!(profile as { city?: string })?.city?.trim(),
    bio: !!profile?.bio?.trim(),
  };
  const filled = Object.values(completionFields).filter(Boolean).length;
  const percent = Math.round((filled / 4) * 100);

  return Response.json({
    is_complete,
    missing,
    required,
    percent,
    completion_fields: completionFields,
  });
}
