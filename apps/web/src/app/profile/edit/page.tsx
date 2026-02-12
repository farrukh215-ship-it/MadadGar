'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CoverCropModal } from '@/components/CoverCropModal';
import { NOTIFICATION_SOUNDS, playNotificationSound } from '@/lib/notificationSounds';

type Interest = { slug: string; name: string; icon: string; parent_group: string };

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<{ display_name: string; avatar_url: string | null; cover_url: string | null; gender?: string | null; date_of_birth?: string | null; marital_status?: string | null; bio?: string | null; notification_sound?: string | null; about_visibility?: 'public' | 'private'; phone_visibility?: 'public' | 'private'; email_visibility?: 'public' | 'private'; bio_visibility?: 'public' | 'private' } | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [notificationSound, setNotificationSound] = useState<string>('default');
  const [maritalStatus, setMaritalStatus] = useState<string>('');
  const [aboutVisibility, setAboutVisibility] = useState<'public' | 'private'>('public');
  const [phoneVisibility, setPhoneVisibility] = useState<'public' | 'private'>('public');
  const [emailVisibility, setEmailVisibility] = useState<'public' | 'private'>('public');
  const [bioVisibility, setBioVisibility] = useState<'public' | 'private'>('public');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverCropSrc, setCoverCropSrc] = useState<string | null>(null);
  const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [myInterests, setMyInterests] = useState<Set<string>>(new Set());
  const [allInterests, setAllInterests] = useState<Interest[]>([]);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const loadInterests = useCallback(async () => {
    try {
      const [interestsRes, myRes] = await Promise.all([fetch('/api/interests'), fetch('/api/interests/my')]);
      if (interestsRes.ok) {
        const data = await interestsRes.json();
        const flat = ((data.interests ?? []) as { group: string; interests: Interest[] }[]).flatMap((g) => g.interests ?? []);
        setAllInterests(flat);
      }
      if (myRes.ok) {
        const data = await myRes.json();
        setMyInterests(new Set(data.interests ?? []));
      }
    } catch {
      setAllInterests([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) {
        router.push('/login?next=/profile/edit');
        return;
      }
      setUser(u);
      const { data: p } = await supabase.from('profiles').select('display_name, avatar_url, cover_url, gender, date_of_birth, marital_status, bio, notification_sound, about_visibility, phone_visibility, email_visibility, bio_visibility').eq('user_id', u.id).single();
      setProfile(p ?? null);
      setDisplayName(p?.display_name || '');
      setGender((p as { gender?: string })?.gender ?? '');
      setDateOfBirth((p as { date_of_birth?: string })?.date_of_birth?.split('T')[0] ?? '');
      setMaritalStatus((p as { marital_status?: string })?.marital_status ?? '');
      setBio((p as { bio?: string })?.bio ?? '');
      setNotificationSound((p as { notification_sound?: string })?.notification_sound ?? 'default');
      setAboutVisibility(((p as { about_visibility?: 'public' | 'private' })?.about_visibility) ?? 'public');
      setPhoneVisibility(((p as { phone_visibility?: 'public' | 'private' })?.phone_visibility) ?? 'public');
      setEmailVisibility(((p as { email_visibility?: 'public' | 'private' })?.email_visibility) ?? 'public');
      setBioVisibility(((p as { bio_visibility?: 'public' | 'private' })?.bio_visibility) ?? 'public');
      loadInterests();
      setLoading(false);
    })();
  }, [router, loadInterests]);

  const toggleInterest = async (slug: string) => {
    const has = myInterests.has(slug);
    try {
      if (has) {
        await fetch(`/api/interests/my?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' });
        setMyInterests((prev) => {
          const next = new Set(prev);
          next.delete(slug);
          return next;
        });
      } else {
        await fetch('/api/interests/my', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interest_slug: slug }),
        });
        setMyInterests((prev) => new Set([...prev, slug]));
      }
    } catch {
      // ignore
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let avatarUrl = profile?.avatar_url ?? null;
      let coverUrl = profile?.cover_url ?? null;

      if (avatarFile) {
        const fd = new FormData();
        fd.append('file', avatarFile);
        fd.append('bucket', 'profile-images');
        const r = await fetch('/api/storage/upload', { method: 'POST', body: fd });
        const d = await r.json();
        if (d.url) avatarUrl = d.url;
      }
      if (coverFile) {
        const fd = new FormData();
        fd.append('file', coverFile);
        fd.append('bucket', 'profile-images');
        const r = await fetch('/api/storage/upload', { method: 'POST', body: fd });
        const d = await r.json();
        if (d.url) coverUrl = d.url;
      }

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          avatar_url: avatarUrl,
          cover_url: coverUrl,
          gender: gender || undefined,
          date_of_birth: dateOfBirth || undefined,
          marital_status: maritalStatus || undefined,
          bio: bio || undefined,
          notification_sound: notificationSound,
          about_visibility: aboutVisibility,
          phone_visibility: phoneVisibility,
          email_visibility: emailVisibility,
          bio_visibility: bioVisibility,
        }),
      });
      if (res.ok) {
        router.push('/profile');
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/profile" className="text-brand-600 font-medium">Cancel</Link>
          <h1 className="font-semibold text-stone-900">Edit Profile</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-brand-600 font-semibold disabled:opacity-50"
          >
            {saving ? '...' : 'Save'}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
          >
            <option value="">Not set</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <p className="text-xs text-stone-500 mt-1">Used for avatar icon when no profile photo</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Date of birth</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          <p className="text-xs text-stone-500 mt-1">Age will be shown to people you chat with</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Marital status</label>
          <select
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
          >
            <option value="">Not set</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          <p className="text-xs text-stone-500 mt-1">Shown with age & gender in chat</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Bio / About</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
            placeholder="Tell others about yourself..."
          />
          <p className="text-xs text-stone-500 mt-1">{bio.length}/500 characters</p>
          <div className="mt-2">
            <label className="block text-xs font-medium text-stone-600 mb-1">Bio visibility</label>
            <select
              value={bioVisibility}
              onChange={(e) => setBioVisibility(e.target.value === 'private' ? 'private' : 'public')}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white"
            >
              <option value="public">Public</option>
              <option value="private">Only me</option>
            </select>
          </div>
        </div>

        <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50">
          <h3 className="text-sm font-semibold text-stone-800 mb-3">Profile visibility (Facebook-style)</h3>
          <p className="text-xs text-stone-500 mb-3">Har item ko public ya personal kar sakte hain</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">About section (overall)</label>
              <select
                value={aboutVisibility}
                onChange={(e) => setAboutVisibility(e.target.value === 'private' ? 'private' : 'public')}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white"
              >
                <option value="public">Public</option>
                <option value="private">Only me</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Phone visibility</label>
              <select
                value={phoneVisibility}
                onChange={(e) => setPhoneVisibility(e.target.value === 'private' ? 'private' : 'public')}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white"
              >
                <option value="public">Public</option>
                <option value="private">Only me</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Email visibility</label>
              <select
                value={emailVisibility}
                onChange={(e) => setEmailVisibility(e.target.value === 'private' ? 'private' : 'public')}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white"
              >
                <option value="public">Public</option>
                <option value="private">Only me</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Notification sound</label>
          <div className="flex flex-wrap gap-2">
            {NOTIFICATION_SOUNDS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setNotificationSound(s.id);
                  playNotificationSound(s.id);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  notificationSound === s.id ? 'bg-brand-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-stone-500 mt-1">Sound for new message notifications</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Profile photo</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-stone-200 flex items-center justify-center">
              {avatarFile ? (
                <img src={URL.createObjectURL(avatarFile)} alt="" className="w-full h-full object-cover" />
              ) : profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="" width={80} height={80} className="object-cover w-full h-full" unoptimized />
              ) : (
                <span className="text-3xl">👤</span>
              )}
            </div>
            <div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setAvatarCropSrc(url);
                  }
                }}
                className="text-sm"
              />
              <p className="mt-1 text-xs text-stone-500">Profile photo crop karke adjust kar sakte hain</p>
            </div>
          </div>
          {avatarCropSrc && (
            <CoverCropModal
              variant="avatar"
              imageSrc={avatarCropSrc}
              onComplete={async (blob) => {
                setAvatarFile(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
                URL.revokeObjectURL(avatarCropSrc);
                setAvatarCropSrc(null);
              }}
              onCancel={() => {
                URL.revokeObjectURL(avatarCropSrc);
                setAvatarCropSrc(null);
                if (avatarInputRef.current) avatarInputRef.current.value = '';
              }}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Interests</label>
          <p className="text-xs text-stone-500 mb-2">
            Add interests to connect with like-minded people. You can also manage them from{' '}
            <Link href="/chat/interests" className="text-brand-600 font-medium hover:underline">Interested People</Link>.
          </p>
          <div className="flex flex-wrap gap-2">
            {allInterests.slice(0, 20).map((int) => {
              const has = myInterests.has(int.slug);
              return (
                <button
                  key={int.slug}
                  type="button"
                  onClick={() => toggleInterest(int.slug)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    has ? 'bg-brand-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>{int.icon}</span>
                  {int.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Cover photo</label>
          <div className="relative aspect-[3/1] rounded-xl overflow-hidden bg-stone-200">
            {coverFile ? (
              <img src={URL.createObjectURL(coverFile)} alt="" className="w-full h-full object-cover" />
            ) : profile?.cover_url ? (
              <Image src={profile.cover_url} alt="" fill className="object-cover" unoptimized sizes="600px" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white/50">
                No cover
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-stone-500">Cover crop karke adjust kar sakte hain</p>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                setCoverCropSrc(url);
              }
            }}
            className="mt-2 text-sm"
          />
          {coverCropSrc && (
            <CoverCropModal
              imageSrc={coverCropSrc}
              onComplete={async (blob) => {
                setCoverFile(new File([blob], 'cover.jpg', { type: 'image/jpeg' }));
                URL.revokeObjectURL(coverCropSrc);
                setCoverCropSrc(null);
              }}
              onCancel={() => {
                URL.revokeObjectURL(coverCropSrc);
                setCoverCropSrc(null);
                if (coverInputRef.current) coverInputRef.current.value = '';
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
