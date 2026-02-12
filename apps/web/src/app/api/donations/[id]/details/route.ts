import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get donation request details including bank account for payment
 * Only for verified requests - donors need this to send money directly
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { data: req, error } = await supabase
    .from('donation_requests')
    .select('id, title, description, amount_requested, proof_images, category_id, author_id, bank_account_details, verified')
    .eq('id', id)
    .single();

  if (error || !req) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  if (!req.verified) {
    return Response.json({ error: 'Request not verified yet' }, { status: 403 });
  }

  const { data: cat } = await supabase
    .from('donation_categories')
    .select('name, icon')
    .eq('id', req.category_id)
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('user_id', req.author_id)
    .single();

  const bank = req.bank_account_details as Record<string, string> | null;
  const maskedAccount = bank?.account_number
    ? `****${String(bank.account_number).slice(-4)}`
    : null;

  return Response.json({
    id: req.id,
    title: req.title,
    description: req.description,
    amount_requested: req.amount_requested,
    category_name: cat?.name,
    category_icon: cat?.icon,
    author_name: profile?.display_name ?? 'User',
    bank_account_details: bank
      ? {
          bank_name: bank.bank_name,
          account_title: bank.account_title,
          account_number: bank.account_number,
          account_number_masked: maskedAccount,
          iban: bank.iban,
          branch: bank.branch,
        }
      : null,
  });
}
