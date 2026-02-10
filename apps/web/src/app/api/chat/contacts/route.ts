import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: contacts } = await supabase
    .from('chat_contacts')
    .select('contact_id')
    .eq('user_id', user.id);

  const contactIds = (contacts ?? []).map((c) => c.contact_id);
  if (contactIds.length === 0) {
    return Response.json({ users: [] });
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url')
    .in('user_id', contactIds);

  const { data: interestRows } = await supabase
    .from('user_interests')
    .select('user_id, interest_slug')
    .in('user_id', contactIds);

  const { data: interestNames } = await supabase
    .from('interest_categories')
    .select('slug, name, icon');

  const nameMap = Object.fromEntries((interestNames ?? []).map((c) => [c.slug, { name: c.name, icon: c.icon }]));
  const interestsByUser = (interestRows ?? []).reduce<Record<string, { name: string; icon: string }[]>>((acc, r) => {
    const info = nameMap[r.interest_slug];
    if (!info) return acc;
    if (!acc[r.user_id]) acc[r.user_id] = [];
    acc[r.user_id].push(info);
    return acc;
  }, {});

  const users = (profiles ?? []).map((p) => ({
    id: p.user_id,
    display_name: p.display_name || 'User',
    avatar_url: p.avatar_url ?? null,
    interests: interestsByUser[p.user_id] ?? [],
  }));

  return Response.json({ users });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const contactId = body.contact_id ?? body.user_id;
  if (!contactId || contactId === user.id) {
    return Response.json({ error: 'Invalid contact' }, { status: 400 });
  }

  const { error } = await supabase
    .from('chat_contacts')
    .upsert({ user_id: user.id, contact_id: contactId }, { onConflict: 'user_id,contact_id' });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}
