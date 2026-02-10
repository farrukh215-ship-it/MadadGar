import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, icon, sort_order')
    .order('sort_order');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json(data ?? []);
}
