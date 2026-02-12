import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getReportThresholds } from '@/lib/spamDetector';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();

  if (!(profile as { is_admin?: boolean } | null)?.is_admin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();

  const [
    usersCount,
    postsCount,
    postsHiddenCount,
    productsCount,
    saleCount,
    donationRequestsCount,
    donationsCount,
    helpRequestsCount,
    reportsCount,
    reportsList,
    donationRequests,
    categories,
    topPosts,
  ] = await Promise.all([
    admin.from('users').select('*', { count: 'exact', head: true }),
    admin.from('posts').select('*', { count: 'exact', head: true }).eq('shadow_hidden', false),
    admin.from('posts').select('*', { count: 'exact', head: true }).eq('shadow_hidden', true),
    admin.from('products').select('*', { count: 'exact', head: true }),
    admin.from('sale_listings').select('*', { count: 'exact', head: true }),
    admin.from('donation_requests').select('*', { count: 'exact', head: true }),
    admin.from('donations').select('*', { count: 'exact', head: true }),
    admin.from('help_requests').select('*', { count: 'exact', head: true }),
    admin.from('reports').select('*', { count: 'exact', head: true }),
    admin.from('reports').select('id, post_id, user_id, reason, created_at').order('created_at', { ascending: false }).limit(50),
    admin.from('donation_requests').select('id, title, description, amount_requested, proof_images, verified, created_at, author_id, category_id').order('created_at', { ascending: false }).limit(50),
    admin.from('categories').select('id, name, slug, icon').order('sort_order'),
    admin.from('posts').select('id, worker_name, category_id, madad_count, created_at').eq('shadow_hidden', false).order('madad_count', { ascending: false }).limit(10),
  ]);

  const catMap = Object.fromEntries((categories.data ?? []).map((c) => [c.id, c]));

  const postCountByCat: Record<string, number> = {};
  const { data: allPosts } = await admin.from('posts').select('category_id').eq('shadow_hidden', false);
  for (const p of allPosts ?? []) {
    if (p.category_id) {
      postCountByCat[p.category_id] = (postCountByCat[p.category_id] ?? 0) + 1;
    }
  }

  const trending = Object.entries(postCountByCat)
    .map(([catId, count]) => ({
      category_id: catId,
      category_name: catMap[catId]?.name ?? 'Unknown',
      category_slug: catMap[catId]?.slug,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const reportCountByPost: Record<string, number> = {};
  if (reportsList.data) {
    for (const r of reportsList.data) {
      if (r.post_id) {
        reportCountByPost[r.post_id] = (reportCountByPost[r.post_id] ?? 0) + 1;
      }
    }
  }

  const { shadowHide, manualReview } = getReportThresholds();

  const authorIds = [...new Set((donationRequests.data ?? []).map((r) => r.author_id))];
  const categoryIds = [...new Set((donationRequests.data ?? []).map((r) => r.category_id))];

  const { data: profiles } = await admin.from('profiles').select('user_id, display_name').in('user_id', authorIds);
  const { data: donationCategories } = await admin.from('donation_categories').select('id, name').in('id', categoryIds);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.display_name]));
  const donationCatMap = Object.fromEntries((donationCategories ?? []).map((c) => [c.id, c.name]));

  const donationRequestsWithMeta = (donationRequests.data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    amount_requested: r.amount_requested,
    proof_images: r.proof_images ?? [],
    verified: r.verified ?? false,
    created_at: r.created_at,
    author_name: profileMap[r.author_id] ?? 'User',
    category_name: donationCatMap[r.category_id] ?? '',
  }));

  const topHelpers = (topPosts.data ?? []).map((p) => ({
    id: p.id,
    worker_name: p.worker_name,
    category_name: catMap[p.category_id]?.name,
    madad_count: p.madad_count ?? 0,
    href: `/post/${p.id}`,
  }));

  return Response.json({
    overview: {
      users: usersCount.count ?? 0,
      posts: postsCount.count ?? 0,
      posts_hidden: postsHiddenCount.count ?? 0,
      products: productsCount.count ?? 0,
      sale_listings: saleCount.count ?? 0,
      donation_requests: donationRequestsCount.count ?? 0,
      donations: donationsCount.count ?? 0,
      help_requests: helpRequestsCount.count ?? 0,
      reports: reportsCount.count ?? 0,
    },
    ml_moderation: {
      shadow_hide_threshold: shadowHide,
      manual_review_threshold: manualReview,
      reported_posts_count: Object.keys(reportCountByPost).length,
    },
    trending_categories: trending,
    top_helpers: topHelpers,
    recent_reports: (reportsList.data ?? []).map((r) => ({
      ...r,
      report_count: r.post_id ? reportCountByPost[r.post_id] : 0,
      exceeds_threshold: r.post_id ? (reportCountByPost[r.post_id] ?? 0) >= shadowHide : false,
    })),
    donation_requests: donationRequestsWithMeta,
  });
}
