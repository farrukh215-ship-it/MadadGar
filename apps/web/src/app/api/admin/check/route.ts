import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ is_admin: false }, { status: 200 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();

  const isAdmin = !!(profile as { is_admin?: boolean } | null)?.is_admin;
  return Response.json({ is_admin: isAdmin });
}
