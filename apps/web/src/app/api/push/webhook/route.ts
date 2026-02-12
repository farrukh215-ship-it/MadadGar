import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Supabase Database Webhook: On notifications INSERT
 * Configure in Supabase Dashboard: Database > Webhooks > notifications INSERT
 * Sends push to user's devices when message/friend request arrives (app closed)
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: { type?: string; record?: { user_id?: string; type?: string; title?: string; body?: string; link?: string } };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const record = payload?.record;
  const userId = record?.user_id;
  if (!userId) {
    return Response.json({ ok: true, skipped: 'no user_id' });
  }

  const title = record?.title || 'Madadgar';
  const body = record?.body || 'New notification';
  const link = record?.link || '/';

  const admin = createAdminClient();
  const { data: tokens } = await admin
    .from('push_tokens')
    .select('token, platform')
    .eq('user_id', userId);

  if (!tokens || tokens.length === 0) {
    return Response.json({ ok: true, skipped: 'no push tokens' });
  }

  const fcmServerKey = process.env.FCM_SERVER_KEY;
  if (!fcmServerKey) {
    return Response.json({ ok: true, skipped: 'FCM_SERVER_KEY not configured' });
  }

  const results = await Promise.allSettled(
    tokens.map(async (t) => {
      const res = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${fcmServerKey}`,
        },
        body: JSON.stringify({
          to: t.token,
          notification: { title, body, click_action: link },
          data: { url: link, type: record?.type || 'notification' },
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    })
  );

  const failures = results.filter((r) => r.status === 'rejected');
  return Response.json({
    ok: true,
    sent: tokens.length - failures.length,
    failed: failures.length,
  });
}
