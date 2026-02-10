import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const { data } = await supabase
    .from('interest_categories')
    .select('slug, name, icon, parent_group, is_premium, premium_description')
    .eq('slug', slug)
    .single();

  if (!data) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  return Response.json(data);
}
