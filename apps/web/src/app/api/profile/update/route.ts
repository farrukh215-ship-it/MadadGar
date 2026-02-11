import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { avatar_url, cover_url, display_name, gender, date_of_birth, bio, notification_sound, lat, lng } = body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof avatar_url === 'string' && avatar_url.length > 0) updates.avatar_url = avatar_url;
  if (typeof cover_url === 'string') updates.cover_url = cover_url || null;
  if (typeof display_name === 'string') updates.display_name = display_name.trim() || 'User';
  if (typeof gender === 'string' && ['male', 'female', 'other'].includes(gender)) updates.gender = gender;
  if (typeof date_of_birth === 'string' && date_of_birth) {
    const d = new Date(date_of_birth);
    if (!isNaN(d.getTime())) updates.date_of_birth = date_of_birth.split('T')[0];
  } else if (date_of_birth === null) updates.date_of_birth = null;
  if (typeof bio === 'string') updates.bio = bio.trim().slice(0, 500) || null;
  if (typeof notification_sound === 'string' && ['default', 'chime', 'bell', 'pop', 'ding'].includes(notification_sound)) updates.notification_sound = notification_sound;

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) {
    await supabase.rpc('update_profile_location', {
      p_user_id: user.id,
      p_lat: lat,
      p_lng: lng,
    });
  }

  return Response.json({ ok: true });
}
