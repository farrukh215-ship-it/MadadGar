import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { avatar_url, cover_url, display_name, gender } = body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof avatar_url === 'string' && avatar_url.length > 0) updates.avatar_url = avatar_url;
  if (typeof cover_url === 'string') updates.cover_url = cover_url || null;
  if (typeof display_name === 'string') updates.display_name = display_name.trim() || 'User';
  if (typeof gender === 'string' && ['male', 'female', 'other'].includes(gender)) updates.gender = gender;

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}
