import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('plan', 'premium')
    .or('ends_at.is.null,ends_at.gt.' + new Date().toISOString())
    .maybeSingle();

  return Response.json({ is_premium: !!data });
}
