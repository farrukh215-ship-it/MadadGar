import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { post_id, rating, review_text } = body;

  if (!post_id || !rating || rating < 1 || rating > 10) {
    return Response.json({ error: 'post_id and rating (1-10) required' }, { status: 400 });
  }

  const r = Math.round(Number(rating));
  if (r < 1 || r > 10) {
    return Response.json({ error: 'Rating must be 1-10' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('ratings')
    .select('id')
    .eq('post_id', post_id)
    .eq('rater_id', user.id)
    .single();

  if (existing) {
    const { error: updateErr } = await supabase
      .from('ratings')
      .update({ rating: r, review_text: review_text || null })
      .eq('post_id', post_id)
      .eq('rater_id', user.id);
    if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 });
  } else {
    const { error: insertErr } = await supabase
      .from('ratings')
      .insert({ post_id, rater_id: user.id, rating: r, review_text: review_text || null, job_done: true });
    if (insertErr) return Response.json({ error: insertErr.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}
