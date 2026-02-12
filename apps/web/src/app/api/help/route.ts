import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '30', 10), 50);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);
  const category = searchParams.get('category') || null;

  let query = supabase
    .from('help_requests')
    .select('id, author_id, title, body, category_slug, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq('category_slug', category);
  }

  const { data: requests, count, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const ids = (requests ?? []).map((r) => r.id);
  if (ids.length === 0) {
    return Response.json({ requests: [], count: count ?? 0 });
  }

  const { data: suggestions } = await supabase
    .from('help_suggestions')
    .select('id, request_id, author_id, content, created_at')
    .in('request_id', ids)
    .order('created_at', { ascending: true });

  const suggestionIds = (suggestions ?? []).map((s) => s.id);
  let likeCounts: Record<string, number> = {};
  let shareCounts: Record<string, number> = {};
  let userLiked: Record<string, boolean> = {};

  if (suggestionIds.length > 0) {
    const { data: likes } = await supabase
      .from('help_suggestion_likes')
      .select('suggestion_id, user_id')
      .in('suggestion_id', suggestionIds);
    for (const l of likes ?? []) {
      likeCounts[l.suggestion_id] = (likeCounts[l.suggestion_id] ?? 0) + 1;
      if (l.user_id === user.id) userLiked[l.suggestion_id] = true;
    }

    const { data: shares } = await supabase
      .from('help_suggestion_shares')
      .select('suggestion_id')
      .in('suggestion_id', suggestionIds);
    for (const s of shares ?? []) {
      shareCounts[s.suggestion_id] = (shareCounts[s.suggestion_id] ?? 0) + 1;
    }
  }

  const authorIds = [...new Set((requests ?? []).map((r) => r.author_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url')
    .in('user_id', authorIds);
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p]));

  const suggAuthorIds = [...new Set((suggestions ?? []).map((s) => s.author_id))];
  const { data: suggProfiles } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url')
    .in('user_id', suggAuthorIds);
  const suggProfileMap = Object.fromEntries((suggProfiles ?? []).map((p) => [p.user_id, p]));

  const enriched = (requests ?? []).map((r) => {
    const profile = profileMap[r.author_id];
    const reqSuggestions = (suggestions ?? [])
      .filter((s) => s.request_id === r.id)
      .map((s) => ({
        id: s.id,
        content: s.content,
        author_id: s.author_id,
        author_name: suggProfileMap[s.author_id]?.display_name ?? 'User',
        avatar_url: suggProfileMap[s.author_id]?.avatar_url ?? null,
        created_at: s.created_at,
        like_count: likeCounts[s.id] ?? 0,
        share_count: shareCounts[s.id] ?? 0,
        user_liked: userLiked[s.id] ?? false,
      }));
    return {
      id: r.id,
      author_id: r.author_id,
      author_name: profile?.display_name ?? 'User',
      avatar_url: profile?.avatar_url ?? null,
      title: r.title,
      body: r.body,
      category_slug: r.category_slug,
      created_at: r.created_at,
      suggestions: reqSuggestions,
      suggestions_count: reqSuggestions.length,
    };
  });

  return Response.json({ requests: enriched, count: count ?? 0 });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, body: reqBody, category_slug } = body as { title?: string; body?: string; category_slug?: string };

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return Response.json({ error: 'Title required' }, { status: 400 });
  }

  const { data: users } = await supabase.from('users').select('id').eq('id', user.id).limit(1);
  if (!users?.length) {
    return Response.json({ error: 'User profile not found' }, { status: 400 });
  }

  const { data: inserted, error } = await supabase
    .from('help_requests')
    .insert({
      author_id: user.id,
      title: title.trim().slice(0, 200),
      body: reqBody ? String(reqBody).trim().slice(0, 2000) : null,
      category_slug: category_slug && String(category_slug).trim() || null,
    })
    .select('id, title, created_at')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ request: inserted });
}
