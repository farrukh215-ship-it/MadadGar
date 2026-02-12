import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { avatar_url, cover_url, display_name, gender, date_of_birth, bio, notification_sound, about_visibility, phone_visibility, email_visibility, bio_visibility, marital_status, availability, service_radius_km, city, lat, lng } = body as {
    avatar_url?: string;
    cover_url?: string | null;
    display_name?: string;
    gender?: string;
    date_of_birth?: string | null;
    bio?: string | null;
    notification_sound?: string;
    about_visibility?: 'public' | 'private';
    phone_visibility?: 'public' | 'private';
    email_visibility?: 'public' | 'private';
    bio_visibility?: 'public' | 'private';
    marital_status?: string;
    availability?: boolean;
    service_radius_km?: number | null | string;
    city?: string | null;
    lat?: number;
    lng?: number;
  };

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
  if (typeof about_visibility === 'string' && ['public', 'private'].includes(about_visibility)) updates.about_visibility = about_visibility;
  if (typeof phone_visibility === 'string' && ['public', 'private'].includes(phone_visibility)) updates.phone_visibility = phone_visibility;
  if (typeof email_visibility === 'string' && ['public', 'private'].includes(email_visibility)) updates.email_visibility = email_visibility;
  if (typeof bio_visibility === 'string' && ['public', 'private'].includes(bio_visibility)) updates.bio_visibility = bio_visibility;
  if (typeof marital_status === 'string' && ['single', 'married', 'divorced', 'widowed', 'prefer_not_to_say'].includes(marital_status)) updates.marital_status = marital_status;
  else if (marital_status === null || marital_status === '') updates.marital_status = null;
  if (typeof availability === 'boolean') updates.availability = availability;
  if (typeof service_radius_km === 'number' && service_radius_km >= 1 && service_radius_km <= 100) updates.service_radius_km = service_radius_km;
  else if (service_radius_km === null || service_radius_km === '') updates.service_radius_km = null;
  if (typeof city === 'string') updates.city = city.trim() || null;
  else if (city === null || city === '') updates.city = null;

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
