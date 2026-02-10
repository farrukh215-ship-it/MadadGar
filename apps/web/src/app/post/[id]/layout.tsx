import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: post } = await supabase
      .from('posts')
      .select('worker_name, reason, relation_tag, category_id')
      .eq('id', id)
      .single();
    if (!post) return { title: 'Post | Madadgar' };
    const { data: cat } = await supabase.from('categories').select('name').eq('id', post.category_id).single();
    const categoryName = cat?.name ?? 'Service';
    const title = `${post.worker_name || 'Helper'} — ${categoryName} | Madadgar`;
    const desc = (post.reason || post.relation_tag || `Trusted ${categoryName}`).slice(0, 160);
    return { title, description: desc, openGraph: { title, description: desc } };
  } catch {
    return { title: 'Post | Madadgar' };
  }
}

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
