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
  const expoTokens = tokens.filter((t) => t.token?.startsWith('ExponentPushToken['));
  const fcmTokens = tokens.filter((t) => !t.token?.startsWith('ExponentPushToken['));

  let sent = 0;

  if (expoTokens.length > 0) {
    const expoPayload = expoTokens.map((t) => ({
      to: t.token,
      title,
      body,
      data: { url: link, type: record?.type || 'notification' },
      sound: 'default',
      channelId: 'default',
    }));
    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expoPayload),
    });
    if (expoRes.ok) {
      const data = await expoRes.json();
      const tickets = Array.isArray(data.data) ? data.data : [data];
      sent += tickets.filter((t: { status?: string }) => t.status === 'ok').length;
    }
  }

  if (fcmTokens.length > 0 && fcmServerKey) {
    const fcmResults = await Promise.allSettled(
      fcmTokens.map(async (t) => {
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
    sent += fcmResults.filter((r) => r.status === 'fulfilled').length;
  }

  return Response.json({ ok: true, sent, total: tokens.length });
}
