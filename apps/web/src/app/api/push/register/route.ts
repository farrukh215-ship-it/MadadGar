import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  let token = body.token as string | undefined;
  const platform = body.platform as 'ios' | 'android' | 'web' | undefined;

  if (!platform || !['ios', 'android', 'web'].includes(platform)) {
    return Response.json({ error: 'platform (ios|android|web) required' }, { status: 400 });
  }

  if (platform === 'web') {
    const subscription = body.subscription as PushSubscription | undefined;
    if (!subscription) {
      return Response.json({ error: 'subscription required for web push' }, { status: 400 });
    }
    token = JSON.stringify(subscription);
  } else if (!token) {
    return Response.json({ error: 'token required for ios/android' }, { status: 400 });
  }

  await supabase.from('push_tokens').upsert(
    { user_id: user.id, token, platform },
    { onConflict: 'user_id,platform' }
  );

  return Response.json({ ok: true });
}
