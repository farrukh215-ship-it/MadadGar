import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;

  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, category_id, worker_name, area_text, reason, madad_count, created_at')
    .eq('author_id', userId)
    .eq('post_type', 'recommendation')
    .eq('shadow_hidden', false)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const categoryIds = [...new Set((posts ?? []).map((p) => p.category_id).filter(Boolean))];
  let categoryMap: Record<string, string> = {};
  if (categoryIds.length > 0) {
    const { data: cats } = await supabase.from('categories').select('id, name').in('id', categoryIds);
    categoryMap = Object.fromEntries((cats ?? []).map((c) => [c.id, c.name]));
  }

  const items = (posts ?? []).map((p: { id: string; category_id: string; worker_name: string | null; area_text: string | null; reason: string | null; madad_count: number | null; created_at: string }) => ({
    id: p.id,
    worker_name: p.worker_name,
    category_name: categoryMap[p.category_id] ?? '',
    area_text: p.area_text,
    reason: p.reason,
    madad_count: p.madad_count ?? 0,
    created_at: p.created_at,
  }));

  return Response.json({ items });
}
