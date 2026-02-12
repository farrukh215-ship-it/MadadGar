import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MIN_PROOF_IMAGES = 5;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, amount_requested, category_id, proof_images, bank_account_details } = body as {
    title?: string;
    description?: string;
    amount_requested?: number;
    category_id?: string;
    proof_images?: string[];
    bank_account_details?: Record<string, unknown>;
  };

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return Response.json({ error: 'Title required' }, { status: 400 });
  }

  if (!category_id) {
    return Response.json({ error: 'Category required' }, { status: 400 });
  }

  const proofImgs = Array.isArray(proof_images) ? proof_images.filter((u): u is string => typeof u === 'string') : [];
  if (proofImgs.length < MIN_PROOF_IMAGES) {
    return Response.json({
      error: `Minimum ${MIN_PROOF_IMAGES} proof images required (medical/records etc.)`,
      required: MIN_PROOF_IMAGES,
      provided: proofImgs.length,
    }, { status: 400 });
  }

  const { data: req, error } = await supabase
    .from('donation_requests')
    .insert({
      author_id: user.id,
      category_id,
      title: title.trim().slice(0, 200),
      description: description ? String(description).trim().slice(0, 2000) : null,
      amount_requested: amount_requested != null ? Number(amount_requested) : null,
      proof_images: proofImgs.slice(0, 10),
      bank_account_details: bank_account_details && typeof bank_account_details === 'object' ? bank_account_details : null,
      verified: false,
    })
    .select('id, title, created_at')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ request: req });
}
