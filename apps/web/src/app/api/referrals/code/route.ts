import { createClient } from '@/lib/supabase/server';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from('referral_codes')
    .select('code')
    .eq('user_id', user.id)
    .single();

  if (existing) {
    return Response.json({ code: existing.code });
  }

  let code = generateCode();
  for (let attempt = 0; attempt < 10; attempt++) {
    const { error } = await supabase
      .from('referral_codes')
      .insert({ user_id: user.id, code });
    if (!error) {
      return Response.json({ code });
    }
    if (error.code === '23505') {
      code = generateCode();
      continue;
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ error: 'Could not generate code' }, { status: 500 });
}
