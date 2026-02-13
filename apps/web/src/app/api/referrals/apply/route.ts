import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const code = (body.code as string)?.trim()?.toUpperCase();
  if (!code) {
    return Response.json({ error: 'code required' }, { status: 400 });
  }

  const { data: codeRow } = await supabase
    .from('referral_codes')
    .select('user_id')
    .eq('code', code)
    .single();

  if (!codeRow || codeRow.user_id === user.id) {
    return Response.json({ error: 'Invalid or self-referral code' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('referrals')
    .select('id')
    .eq('invitee_id', user.id)
    .single();

  if (existing) {
    return Response.json({ ok: true, already_applied: true });
  }

  const { error } = await supabase.from('referrals').insert({
    inviter_id: codeRow.user_id,
    invitee_id: user.id,
    code,
    completed_at: new Date().toISOString(),
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
