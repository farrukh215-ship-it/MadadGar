import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();

  if (!(profile as { is_admin?: boolean } | null)?.is_admin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: donationRequests } = await supabase
    .from('donation_requests')
    .select('id, title, description, amount_requested, proof_images, verified, created_at, author_id, category_id')
    .order('created_at', { ascending: false });

  if (!donationRequests?.length) {
    return Response.json({ requests: [] });
  }

  const authorIds = [...new Set(donationRequests.map((r) => r.author_id))];
  const categoryIds = [...new Set(donationRequests.map((r) => r.category_id))];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name')
    .in('user_id', authorIds);

  const { data: categories } = await supabase
    .from('donation_categories')
    .select('id, name')
    .in('id', categoryIds);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.display_name]));
  const categoryMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c.name]));

  const requests = donationRequests.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    amount_requested: r.amount_requested,
    proof_images: r.proof_images ?? [],
    verified: r.verified ?? false,
    created_at: r.created_at,
    author_name: profileMap[r.author_id] ?? 'User',
    category_name: categoryMap[r.category_id] ?? '',
  }));

  return Response.json({ requests });
}
