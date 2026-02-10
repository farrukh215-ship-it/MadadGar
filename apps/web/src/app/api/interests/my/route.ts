import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data } = await supabase
    .from('user_interests')
    .select('interest_slug')
    .eq('user_id', user.id);

  const slugs = (data ?? []).map((r) => r.interest_slug);
  return Response.json({ interests: slugs });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const slug = body.interest_slug ?? body.slug;
  if (!slug || typeof slug !== 'string') {
    return Response.json({ error: 'interest_slug required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_interests')
    .upsert({ user_id: user.id, interest_slug: slug }, { onConflict: 'user_id,interest_slug' });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') ?? searchParams.get('interest_slug');
  if (!slug) {
    return Response.json({ error: 'slug required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_interests')
    .delete()
    .eq('user_id', user.id)
    .eq('interest_slug', slug);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}
