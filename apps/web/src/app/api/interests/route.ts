import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: categories } = await supabase
    .from('interest_categories')
    .select('slug, name, icon, parent_group, sort_order, is_premium, premium_description')
    .order('sort_order', { ascending: true });

  // Group by parent_group for UI
  const grouped = (categories ?? []).reduce<Record<string, typeof categories>>((acc, c) => {
    const g = c.parent_group ?? 'general';
    if (!acc[g]) acc[g] = [];
    acc[g].push(c);
    return acc;
  }, {});

  const groupOrder = ['trusted-helpers', 'food-points', 'products', 'sale', 'general'];
  const ordered = groupOrder
    .filter((g) => grouped[g]?.length)
    .map((g) => ({ group: g, interests: grouped[g] }));

  return Response.json({ interests: ordered });
}
