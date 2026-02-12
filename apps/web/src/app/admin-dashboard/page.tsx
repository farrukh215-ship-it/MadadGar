'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type DashboardData = {
  overview: {
    users: number;
    posts: number;
    posts_hidden: number;
    products: number;
    sale_listings: number;
    donation_requests: number;
    donations: number;
    help_requests: number;
    reports: number;
  };
  ml_moderation: {
    shadow_hide_threshold: number;
    manual_review_threshold: number;
    reported_posts_count: number;
  };
  trending_categories: { category_name: string; category_slug: string; count: number }[];
  top_helpers: { id: string; worker_name: string; category_name: string; madad_count: number }[];
  recent_reports: { id: string; post_id: string | null; reason: string; created_at: string; report_count: number; exceeds_threshold: boolean }[];
  donation_requests: {
    id: string;
    title: string;
    description: string | null;
    amount_requested: number | null;
    proof_images: string[];
    verified: boolean;
    created_at: string;
    author_name: string;
    category_name: string;
  }[];
};

const STAT_CARDS = [
  { key: 'users', label: 'Users', icon: '👥', color: 'from-blue-500 to-blue-600' },
  { key: 'posts', label: 'Posts', icon: '📝', color: 'from-emerald-500 to-emerald-600' },
  { key: 'posts_hidden', label: 'Hidden', icon: '🚫', color: 'from-rose-500 to-rose-600' },
  { key: 'products', label: 'Products', icon: '📦', color: 'from-violet-500 to-violet-600' },
  { key: 'sale_listings', label: 'Sale Listings', icon: '🏷️', color: 'from-amber-500 to-amber-600' },
  { key: 'donation_requests', label: 'Donations', icon: '💝', color: 'from-pink-500 to-pink-600' },
  { key: 'donations', label: 'Contributions', icon: '💰', color: 'from-teal-500 to-teal-600' },
  { key: 'help_requests', label: 'Ask for Help', icon: '💡', color: 'from-sky-500 to-sky-600' },
  { key: 'reports', label: 'Reports', icon: '⚠️', color: 'from-orange-500 to-orange-600' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'donations' | 'analytics'>('overview');

  useEffect(() => {
    fetch('/api/admin/check')
      .then((r) => r.json())
      .then((d) => {
        setIsAdmin(d.is_admin ?? false);
        if (!d.is_admin) {
          setLoading(false);
          return;
        }
        return fetch('/api/admin/dashboard');
      })
      .then((r) => (r && r.ok ? r.json() : null))
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false));
  }, []);

  const verifyDonation = async (id: string) => {
    const res = await fetch(`/api/admin/donations/${id}/verify`, { method: 'POST' });
    if (res.ok && data) {
      setData({
        ...data,
        donation_requests: data.donation_requests.map((r) =>
          r.id === id ? { ...r, verified: true } : r
        ),
      });
    }
  };

  const unhidePost = async (postId: string) => {
    const res = await fetch(`/api/admin/posts/${postId}/unhide`, { method: 'POST' });
    if (res.ok && data) {
      setData({
        ...data,
        recent_reports: data.recent_reports.filter((r) => r.post_id !== postId),
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
        <div className="text-7xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <p className="text-slate-400 mt-2 text-center">Admin dashboard access only</p>
        <Link href="/feed" className="mt-8 px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-500 transition">
          Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Madadgar" width={32} height={32} className="rounded" />
              <div>
                <h1 className="font-bold text-lg">Admin Dashboard</h1>
                <p className="text-xs text-slate-400">Platform analytics, moderation & ML</p>
              </div>
            </div>
            <Link href="/feed" className="text-sm text-slate-400 hover:text-white transition">← Back to App</Link>
          </div>

          {/* Tabs */}
          <nav className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {(['overview', 'moderation', 'donations', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  activeTab === tab ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab === 'overview' && '📊 Overview'}
                {tab === 'moderation' && '🛡️ Moderation'}
                {tab === 'donations' && '💝 Donations'}
                {tab === 'analytics' && '📈 Analytics'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && data && (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>Platform Overview</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {STAT_CARDS.map(({ key, label, icon, color }) => (
                  <div
                    key={key}
                    className={`bg-gradient-to-br ${color} rounded-xl p-4 shadow-lg`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <p className="text-3xl font-bold mt-2">{data.overview[key as keyof typeof data.overview] ?? 0}</p>
                    <p className="text-white/80 text-sm">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="font-semibold mb-4">🔥 Trending Categories</h3>
                <ul className="space-y-2">
                  {data.trending_categories.slice(0, 8).map((c, i) => (
                    <li key={c.category_slug} className="flex justify-between items-center">
                      <span className="text-slate-300">{i + 1}. {c.category_name}</span>
                      <span className="font-mono text-cyan-400">{c.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="font-semibold mb-4">⭐ Top Helpers</h3>
                <ul className="space-y-2">
                  {data.top_helpers.slice(0, 8).map((h) => (
                    <li key={h.id} className="flex justify-between items-center">
                      <Link href={`/post/${h.id}`} className="text-cyan-400 hover:underline">
                        {h.worker_name} ({h.category_name})
                      </Link>
                      <span className="text-amber-400">{h.madad_count} ❤️</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        )}

        {/* Moderation Tab */}
        {activeTab === 'moderation' && data && (
          <div className="space-y-8">
            <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4">ML & Moderation</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Shadow hide threshold</p>
                  <p className="text-2xl font-bold text-rose-400">{data.ml_moderation.shadow_hide_threshold} reports</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Manual review</p>
                  <p className="text-2xl font-bold text-amber-400">{data.ml_moderation.manual_review_threshold} reports</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Reported posts</p>
                  <p className="text-2xl font-bold">{data.ml_moderation.reported_posts_count}</p>
                </div>
              </div>

              <h3 className="font-semibold mb-3">Recent Reports</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.recent_reports.length === 0 ? (
                  <p className="text-slate-500">No reports</p>
                ) : (
                  data.recent_reports.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-4 bg-slate-700/50 rounded-lg p-4">
                      <div>
                        <p className="text-slate-300">{r.reason || 'No reason'}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(r.created_at).toLocaleString()}</p>
                        {r.post_id && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${r.exceeds_threshold ? 'bg-rose-900/50 text-rose-400' : 'bg-slate-600 text-slate-400'}`}>
                              {r.report_count} reports
                            </span>
                            <Link href={`/post/${r.post_id}`} className="text-xs text-cyan-400 hover:underline">
                              View post
                            </Link>
                          </div>
                        )}
                      </div>
                      {r.post_id && r.exceeds_threshold && (
                        <button
                          onClick={() => unhidePost(r.post_id!)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium"
                        >
                          Unhide
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && data && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Donation Verification</h2>
            <p className="text-slate-400 text-sm">Verify requests with 5+ proof images. Only verified appear in feed.</p>

            {data.donation_requests.length === 0 ? (
              <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
                <p className="text-slate-500">No donation requests to review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.donation_requests.map((dr) => (
                  <div key={dr.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{dr.title}</h3>
                        <p className="text-slate-400 mt-1">{dr.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs px-2 py-1 rounded-lg bg-slate-700">{dr.category_name}</span>
                          {dr.amount_requested && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-amber-900/50 text-amber-400">
                              Rs {dr.amount_requested.toLocaleString()}
                            </span>
                          )}
                          <span className="text-xs text-slate-500">{dr.author_name}</span>
                        </div>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {dr.proof_images?.slice(0, 8).map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer" className="block">
                              <img src={url} alt={`Proof ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-slate-600" />
                            </a>
                          ))}
                        </div>
                        {(dr.proof_images?.length ?? 0) < 5 && !dr.verified && (
                          <p className="text-amber-400 text-sm mt-2">⚠ Requires 5+ proof images</p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {dr.verified ? (
                          <span className="px-4 py-2 rounded-xl bg-emerald-900/50 text-emerald-400 font-medium">✓ Verified</span>
                        ) : (dr.proof_images?.length ?? 0) >= 5 ? (
                          <button
                            type="button"
                            onClick={() => verifyDonation(dr.id)}
                            className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-medium hover:bg-cyan-500 transition"
                          >
                            Verify
                          </button>
                        ) : (
                          <span className="text-slate-500 text-sm">Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && data && (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">Data & Analytics</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="font-semibold mb-4">Trending Categories (ML Signals)</h3>
                  <div className="space-y-3">
                    {data.trending_categories.map((c, i) => (
                      <div key={c.category_slug} className="flex items-center gap-4">
                        <span className="text-slate-500 w-6">{i + 1}</span>
                        <div className="flex-1">
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                              style={{ width: `${Math.min(100, (c.count / (data.trending_categories[0]?.count ?? 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="font-mono text-cyan-400 w-12 text-right">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="font-semibold mb-4">Top Helpers (Engagement)</h3>
                  <ul className="space-y-3">
                    {data.top_helpers.map((h, i) => (
                      <li key={h.id} className="flex items-center justify-between">
                        <span className="text-slate-300">
                          {i + 1}. <Link href={`/post/${h.id}`} className="text-cyan-400 hover:underline">{h.worker_name}</Link>
                          <span className="text-slate-500 text-sm ml-1">({h.category_name})</span>
                        </span>
                        <span className="text-amber-400 font-medium">{h.madad_count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
            <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="font-semibold mb-4">App Features Coverage</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Feed & Posts', count: data.overview.posts },
                  { label: 'Products', count: data.overview.products },
                  { label: 'Sale Listings', count: data.overview.sale_listings },
                  { label: 'Donations', count: data.overview.donation_requests },
                  { label: 'Ask for Help', count: data.overview.help_requests },
                  { label: 'Users', count: data.overview.users },
                ].map(({ label, count }) => (
                  <div key={label} className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-cyan-400">{count}</p>
                    <p className="text-slate-400 text-sm mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
