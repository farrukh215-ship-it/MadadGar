import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    await admin.from('user_presence').upsert(
      { user_id: user.id, last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Presence unavailable' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userIds = searchParams.get('ids');
  if (!userIds) {
    return Response.json({ online: {} });
  }

  const ids = userIds.split(',').filter(Boolean).slice(0, 100);
  if (ids.length === 0) {
    return Response.json({ online: {} });
  }

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('user_presence')
    .select('user_id, last_seen_at')
    .in('user_id', ids)
    .gte('last_seen_at', fiveMinAgo);

  const online: Record<string, boolean> = {};
  for (const row of data ?? []) {
    online[row.user_id] = true;
  }
  return Response.json({ online });
}
