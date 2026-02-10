import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category') || null;
  const city = searchParams.get('city') || null;
  const limit = parseInt(searchParams.get('limit') ?? '50', 10);

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('feed_top_rated', {
    p_category_id: categoryId,
    p_city: city,
    p_limit: limit,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ items: data ?? [] });
}
