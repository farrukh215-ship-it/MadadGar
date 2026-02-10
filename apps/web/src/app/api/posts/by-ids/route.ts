import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get('ids');
  if (!idsParam) return Response.json({ items: [] });

  const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return Response.json({ items: [] });

  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, author_id, worker_name, phone, reason, area_text, images, created_at, category_id')
    .in('id', ids);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!posts?.length) return Response.json({ items: [] });

  const catIds = [...new Set(posts.map((p) => p.category_id).filter(Boolean))];
  const { data: categories } = await supabase.from('categories').select('id, name').in('id', catIds);
  const catMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c.name]));

  const items = posts.map((p) => ({
    ...p,
    category_name: catMap[p.category_id] ?? 'Category',
  }));

  return Response.json({ items });
}
