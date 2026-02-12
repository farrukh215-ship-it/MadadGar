import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || null;
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);

  let query = supabase
    .from('donation_requests')
    .select('id, title, description, amount_requested, proof_images, category_id, created_at, author_id')
    .eq('verified', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('category_id', category);
  }

  const { data: requests, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!requests?.length) {
    return Response.json({ donations: [], categories: [] });
  }

  const authorIds = [...new Set(requests.map((r) => r.author_id))];
  const categoryIds = [...new Set(requests.map((r) => r.category_id))];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url')
    .in('user_id', authorIds);

  const { data: categories } = await supabase
    .from('donation_categories')
    .select('id, slug, name, icon');

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p]));
  const categoryMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c]));

  const donations = requests.map((r) => {
    const cat = categoryMap[r.category_id];
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      amount_requested: r.amount_requested,
      proof_images: r.proof_images ?? [],
      category_slug: cat?.slug,
      category_name: cat?.name,
      category_icon: cat?.icon,
      created_at: r.created_at,
      author_id: r.author_id,
      author_name: profileMap[r.author_id]?.display_name ?? 'User',
      avatar_url: profileMap[r.author_id]?.avatar_url ?? null,
    };
  });

  const { data: donationStats } = await supabase
    .from('donations')
    .select('request_id, amount, status');

  const receivedByRequest: Record<string, number> = {};
  const pendingByRequest: Record<string, number> = {};
  for (const d of donationStats ?? []) {
    const id = d.request_id;
    if (d.status === 'completed') {
      receivedByRequest[id] = (receivedByRequest[id] ?? 0) + (d.amount ?? 0);
    } else if (d.status === 'pending') {
      pendingByRequest[id] = (pendingByRequest[id] ?? 0) + (d.amount ?? 0);
    }
  }

  const enriched = donations.map((d) => ({
    ...d,
    received: receivedByRequest[d.id] ?? 0,
    pending: pendingByRequest[d.id] ?? 0,
  }));

  const allCategories = await supabase.from('donation_categories').select('id, slug, name, icon').order('sort_order');
  return Response.json({ donations: enriched, categories: allCategories.data ?? [] });
}
