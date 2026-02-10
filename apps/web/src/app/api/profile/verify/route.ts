import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const phone = body.phone?.trim();
  const idDocument = body.id_document; // optional: URL to uploaded ID
  if (!phone) return Response.json({ error: 'Phone required for verification' }, { status: 400 });

  const { error } = await supabase
    .from('profiles')
    .update({
      verified: true,
      verified_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await supabase.from('users').update({ phone }).eq('id', user.id);

  return Response.json({ verified: true });
}
