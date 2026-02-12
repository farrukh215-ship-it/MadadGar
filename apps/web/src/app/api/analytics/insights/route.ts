import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Predictive Analytics & Insights
 * Best time to post, profile views, engagement stats
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope') || 'user';

  if (scope === 'user') {
    const { data: myPosts } = await supabase
      .from('posts')
      .select('id, madad_count, created_at')
      .eq('author_id', user.id)
      .eq('shadow_hidden', false);

    const byHour: Record<number, number> = {};
    for (let h = 0; h < 24; h++) byHour[h] = 0;
    for (const p of myPosts ?? []) {
      const d = new Date(p.created_at);
      byHour[d.getHours()]++;
    }
    const bestHour = Object.entries(byHour).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 12;

    const byDay: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const p of myPosts ?? []) {
      const d = new Date(p.created_at);
      byDay[d.getDay()]++;
    }
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const bestDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 1;

    const totalMadad = (myPosts ?? []).reduce((s, p) => s + (p.madad_count ?? 0), 0);

    return Response.json({
      best_time_to_post: {
        hour: parseInt(bestHour, 10),
        hour_label: `${bestHour}:00`,
        day: parseInt(bestDay, 10),
        day_label: dayNames[parseInt(bestDay, 10)],
      },
      total_posts: myPosts?.length ?? 0,
      total_madad_likes: totalMadad,
      insights: [
        `Best time: ${dayNames[parseInt(bestDay, 10)]} around ${bestHour}:00`,
        `You have ${myPosts?.length ?? 0} active posts`,
        `Total Madad ki ❤️: ${totalMadad}`,
      ],
    });
  }

  return Response.json({ error: 'Invalid scope' }, { status: 400 });
}
