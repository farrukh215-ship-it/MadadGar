import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Smart Search & Discovery
 * Full-text search across posts, products, sale listings, helpers
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') as string)?.trim() || '';
  const type = searchParams.get('type') || 'all';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);

  if (q.length < 2) {
    return Response.json({ results: [], posts: [], products: [], sale: [], helpers: [] });
  }

  const safeQ = q.replace(/[%_\\]/g, ' ').trim();
  const pattern = `%${safeQ}%`;

  const results: Record<string, unknown[]> = { posts: [], products: [], sale: [], helpers: [] };

  if (type === 'all' || type === 'posts') {
    const { data: posts } = await supabase
      .from('posts')
      .select('id, worker_name, reason, relation_tag, area_text, post_type, category_id, created_at')
      .or(`worker_name.ilike.${pattern},reason.ilike.${pattern},relation_tag.ilike.${pattern},area_text.ilike.${pattern}`)
      .eq('shadow_hidden', false)
      .limit(limit);

    const catIds = [...new Set((posts ?? []).map((p) => p.category_id).filter(Boolean))];
    const { data: cats } = await supabase.from('categories').select('id, name').in('id', catIds);
    const catMap = Object.fromEntries((cats ?? []).map((c) => [c.id, c.name]));

    results.posts = (posts ?? []).map((p) => ({
      ...p,
      item_type: 'post',
      category_name: catMap[p.category_id],
      href: `/post/${p.id}`,
    }));
  }

  if (type === 'all' || type === 'products') {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price_min, price_max, images, created_at')
      .ilike('name', pattern)
      .limit(limit);

    results.products = (products ?? []).map((p) => ({
      ...p,
      item_type: 'product',
      href: `/products/${p.id}`,
    }));
  }

  if (type === 'all' || type === 'sale') {
    const { data: sale } = await supabase
      .from('sale_listings')
      .select('id, title, price, images, area_text, created_at')
      .or(`title.ilike.${pattern},area_text.ilike.${pattern}`)
      .limit(limit);

    results.sale = (sale ?? []).map((s) => ({
      ...s,
      item_type: 'sale',
      href: `/sale/${s.id}`,
    }));
  }

  if (type === 'all' || type === 'helpers') {
    const { data: profs } = await supabase
      .from('profiles')
      .select('user_id, display_name, worker_skill, area, city')
      .or(`display_name.ilike.${pattern},worker_skill.ilike.${pattern},area.ilike.${pattern},city.ilike.${pattern}`)
      .eq('is_worker', true)
      .limit(limit);

    results.helpers = (profs ?? []).map((p) => ({
      ...p,
      item_type: 'helper',
      href: `/profile/${p.user_id}`,
    }));
  }

  const all = [
    ...(results.posts as Record<string, unknown>[]).map((r) => ({ ...r, _type: 'post' })),
    ...(results.products as Record<string, unknown>[]).map((r) => ({ ...r, _type: 'product' })),
    ...(results.sale as Record<string, unknown>[]).map((r) => ({ ...r, _type: 'sale' })),
    ...(results.helpers as Record<string, unknown>[]).map((r) => ({ ...r, _type: 'helper' })),
  ];

  return Response.json({
    results: all.slice(0, limit),
    posts: results.posts,
    products: results.products,
    sale: results.sale,
    helpers: results.helpers,
  });
}
