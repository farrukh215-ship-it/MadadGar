import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    post_type,
    category_id,
    phone,
    lat,
    lng,
    area_text,
    worker_name,
    reason,
    relation_tag,
    intro,
    optional_rate,
    images,
  } = body;

  if (!post_type || !category_id || !phone) {
    return Response.json(
      { error: 'Missing required fields: post_type, category_id, phone' },
      { status: 400 }
    );
  }

  const { data: postId, error } = await supabase.rpc('create_post', {
    p_author_id: user.id,
    p_category_id: category_id,
    p_post_type: post_type,
    p_phone: phone,
    p_lat: lat ?? null,
    p_lng: lng ?? null,
    p_area_text: area_text ?? null,
    p_worker_name: worker_name ?? null,
    p_reason: reason ?? null,
    p_relation_tag: relation_tag ?? null,
    p_intro: intro ?? null,
    p_optional_rate: optional_rate ?? null,
    p_images: images ?? [],
  });

  if (error) {
    if (error.message?.includes('MAX_POSTS_PER_DAY')) {
      return Response.json({ error: 'MAX_POSTS_PER_DAY' }, { status: 429 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  const { data: post } = await supabase
    .from('posts')
    .select()
    .eq('id', postId)
    .single();

  return Response.json({ post: post ?? { id: postId } }, { status: 201 });
}
