import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Record a donation contribution - donor confirms they sent money
 * Payment goes directly to needy's bank; we only record the pledge
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: requestId } = await params;
  const body = await request.json();
  const { amount, payment_reference } = body as { amount?: number; payment_reference?: string };

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return Response.json({ error: 'Valid amount required' }, { status: 400 });
  }

  const { data: req } = await supabase
    .from('donation_requests')
    .select('id, verified')
    .eq('id', requestId)
    .single();

  if (!req || !req.verified) {
    return Response.json({ error: 'Donation request not found or not verified' }, { status: 404 });
  }

  const { data: donation, error } = await supabase
    .from('donations')
    .insert({
      request_id: requestId,
      donor_id: user.id,
      amount: Math.round(amount * 100) / 100,
      status: 'completed',
      payment_reference: payment_reference ? String(payment_reference).trim().slice(0, 100) : null,
      completed_at: new Date().toISOString(),
    })
    .select('id, amount, status')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ donation, message: 'Donation recorded. Shukriya!' });
}
