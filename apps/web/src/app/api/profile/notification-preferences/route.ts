import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('friend_requests, messages, recommendations, updates')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    friend_requests: data?.friend_requests ?? true,
    messages: data?.messages ?? true,
    recommendations: data?.recommendations ?? true,
    updates: data?.updates ?? true,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, boolean> = {};
  if (typeof body.friend_requests === 'boolean') updates.friend_requests = body.friend_requests;
  if (typeof body.messages === 'boolean') updates.messages = body.messages;
  if (typeof body.recommendations === 'boolean') updates.recommendations = body.recommendations;
  if (typeof body.updates === 'boolean') updates.updates = body.updates;

  const { error } = await supabase
    .from('notification_preferences')
    .upsert(
      { user_id: user.id, ...updates, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
