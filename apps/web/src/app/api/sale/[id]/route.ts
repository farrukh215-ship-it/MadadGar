import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 });

  const supabase = await createClient();
  const { data: listing, error } = await supabase
    .from('sale_listings')
    .select('id, title, price, description, images, area_text, phone, created_at, category_id, author_id')
    .eq('id', id)
    .single();

  if (error || !listing) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: cat } = await supabase.from('sale_categories').select('id, slug, name, icon').eq('id', listing.category_id).single();
  const { data: profile } = await supabase.from('profiles').select('display_name').eq('user_id', listing.author_id).single();

  return Response.json({
    ...listing,
    category_name: cat?.name,
    category_slug: cat?.slug,
    category_icon: cat?.icon,
    author_name: profile?.display_name ?? 'User',
  });
}
