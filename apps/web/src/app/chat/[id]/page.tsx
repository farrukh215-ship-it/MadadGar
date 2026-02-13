'use client';

import { useEffect, useState, useRef } from 'react';

function formatMaritalStatus(s: string | null | undefined): string {
  if (!s) return '';
  const m: Record<string, string> = { single: 'Single', married: 'Married', divorced: 'Divorced', widowed: 'Widowed', prefer_not_to_say: 'Prefer not to say' };
  return m[s] ?? s;
}

function formatLastSeen(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = (now - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 86400 * 2) return 'yesterday';
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} days ago`;
  return d.toLocaleDateString();
}
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { subscribeToMessages, subscribeToTyping, broadcastTyping } from '@/lib/supabase/realtime';
import { hapticLight } from '@/lib/haptic';
type Message = {
  id: string;
  content: string | null;
  message_type: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
  deleted_at: string | null;
  metadata?: { duration?: number };
};

export default function ChatScreen() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<{ id: string; display_name: string; avatar_url: string | null; gender?: string | null; age?: number | null; marital_status?: string | null; bio?: string | null } | null>(null);
  const [online, setOnline] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<'none' | 'friends' | 'pending_sent' | 'pending_received' | 'self' | null>(null);
  const [friendRequestId, setFriendRequestId] = useState<string | null>(null);
  const [addingFriend, setAddingFriend] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [searching, setSearching] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [postId, setPostId] = useState<string | null>(null);
  const [hasRatedPost, setHasRatedPost] = useState(false);
  const [showJobDoneReminder, setShowJobDoneReminder] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
      const [threadRes, { data: messagesData }] = await Promise.all([
        fetch(`/api/chat/threads/${threadId}`),
        supabase.from('messages').select('id, content, message_type, sender_id, created_at, read_at, deleted_at, metadata').eq('thread_id', threadId).order('created_at', { ascending: true }),
      ]);
      const threadData = await threadRes.json();
      setMessages(messagesData ?? []);
      if (threadRes.ok && threadData.other_user) {
        setOtherUser(threadData.other_user);
        setPostId(threadData.post_id ?? null);
        const oid = threadData.other_user.id;
        Promise.all([
          fetch(`/api/presence?ids=${oid}`).then((r) => r.json())
            .then((d) => { setOnline(!!d.online?.[oid]); setLastSeenAt(d.last_seen?.[oid] ?? null); }),
          fetch(`/api/friends/status?user_id=${oid}`).then((r) => r.json())
            .then((d) => { setFriendStatus(d.status ?? 'none'); setFriendRequestId(d.request_id ?? null); }),
          fetch('/api/premium/status').then((r) => r.json())
            .then((d) => setIsPremium(!!d.is_premium)),
        ]).catch(() => {});
        if (threadData.post_id) {
          fetch(`/api/ratings/check?post_id=${encodeURIComponent(threadData.post_id)}`)
            .then((r) => r.json())
            .then((d) => setHasRatedPost(d.has_rated ?? false))
            .catch(() => {});
        }
      }
      const unreadFromOther = (messagesData ?? []).filter((m: Message) => m.sender_id !== user.id && !m.read_at);
      if (unreadFromOther.length > 0) {
        const now = new Date().toISOString();
        for (const m of unreadFromOther) {
          supabase.from('messages').update({ read_at: now }).eq('id', m.id).then(() => {});
        }
      }
    })();
  }, [threadId, router]);

  useEffect(() => {
    if (postId && !hasRatedPost && messages.length >= 6) {
      setShowJobDoneReminder(true);
    } else if (hasRatedPost) {
      setShowJobDoneReminder(false);
    }
  }, [postId, hasRatedPost, messages.length]);

  useEffect(() => {
    const unsub = subscribeToMessages(
      threadId,
      (payload) => {
        const m = (payload as { new: Message }).new;
        setMessages((prev) => [...prev, m]);
      },
      (payload) => {
        const { new: updated } = payload as { new: Message };
        setMessages((prev) =>
          prev.map((m) => (m.id === updated.id ? { ...m, read_at: updated.read_at, deleted_at: updated.deleted_at } : m))
        );
      }
    );
    return unsub;
  }, [threadId]);

  useEffect(() => {
    if (!userId || !otherUser) return;
    const unsub = subscribeToTyping(threadId, (uid, typing) => {
      if (uid === otherUser.id) setOtherUserTyping(typing);
    });
    return unsub;
  }, [threadId, userId, otherUser?.id]);

  useEffect(() => {
    if (!userId || !input.trim()) return;
    broadcastTyping(threadId, userId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      broadcastTyping(threadId, userId, false);
      typingTimeoutRef.current = null;
    }, 2000);
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [threadId, userId, input]);

  const [sendingImage, setSendingImage] = useState(false);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;
    hapticLight();
    const supabase = createClient();
    const { error } = await supabase.from('messages').insert({
      thread_id: threadId,
      sender_id: userId,
      content: input.trim(),
      message_type: 'text',
    });
    if (error) {
      console.error('Send message error:', error);
      alert(error.message ?? 'Failed to send message. Please try again.');
      return;
    }
    await supabase.from('chat_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId);
    broadcastTyping(threadId, userId, false);
    setInput('');
  };

  const MAX_VIDEO_MB = isPremium ? 100 : 25;
  const sendImage = async (file: File) => {
    if (!userId) return;
    setSendingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bucket', 'chat-images');
      const r = await fetch('/api/storage/upload', { method: 'POST', body: fd });
      const d = await r.json();
      if (!d.url) throw new Error(d.error ?? 'Upload failed');
      const supabase = createClient();
      const { error } = await supabase.from('messages').insert({
        thread_id: threadId,
        sender_id: userId,
        content: d.url,
        message_type: 'image',
      });
      if (error) throw new Error(error.message);
      await supabase.from('chat_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send image');
    } finally {
      setSendingImage(false);
    }
  };

  const sendVideo = async (file: File) => {
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      alert(isPremium ? `Video must be under ${MAX_VIDEO_MB}MB` : `Video limit ${MAX_VIDEO_MB}MB. Upgrade to Premium for 100MB.`);
      return;
    }
    if (!userId) return;
    setSendingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bucket', 'chat-media');
      const r = await fetch('/api/storage/upload', { method: 'POST', body: fd });
      const d = await r.json();
      if (!d.url) throw new Error(d.error ?? 'Upload failed');
      const supabase = createClient();
      await supabase.from('messages').insert({
        thread_id: threadId,
        sender_id: userId,
        content: d.url,
        message_type: 'video',
      });
      await supabase.from('chat_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send video');
    } finally {
      setSendingImage(false);
    }
  };

  const MAX_AUDIO_SEC = 60;
  const startRecording = async () => {
    if (!userId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
        recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setSendingImage(true);
        try {
          const fd = new FormData();
          fd.append('file', blob, 'audio.webm');
          fd.append('bucket', 'chat-media');
          const r = await fetch('/api/storage/upload', { method: 'POST', body: fd });
          const d = await r.json();
          if (!d.url) throw new Error(d.error ?? 'Upload failed');
          const supabase = createClient();
          await supabase.from('messages').insert({
            thread_id: threadId,
            sender_id: userId,
            content: d.url,
            message_type: 'audio',
            metadata: { duration_sec: MAX_AUDIO_SEC },
          });
          await supabase.from('chat_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId);
        } finally {
          setSendingImage(false);
        }
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setTimeout(() => { if (recorderRef.current?.state === 'recording') recorderRef.current.stop(); setRecording(false); }, MAX_AUDIO_SEC * 1000);
    } catch {
      alert('Microphone access needed for voice messages');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
      setRecording(false);
    }
  };

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/chat/search?thread_id=${encodeURIComponent(threadId)}&q=${encodeURIComponent(q)}`);
        const d = await r.json();
        setSearchResults(d.messages ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, threadId]);

  const scrollToMessage = (messageId: string) => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setTimeout(() => {
      document.getElementById(`msg-${messageId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const deleteMessage = async (messageId: string, forEveryone: boolean) => {
    try {
      const res = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'x-delete-for-everyone': forEveryone ? 'true' : 'false' },
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, deleted_at: new Date().toISOString() } : m))
        );
      } else {
        const d = await res.json();
        alert(d.error ?? 'Failed to delete');
      }
    } catch {
      alert('Failed to delete message');
    }
  };

  const sendFriendRequest = async () => {
    if (!otherUser || addingFriend) return;
    setAddingFriend(true);
    try {
      const res = await fetch('/api/friends/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_user_id: otherUser.id }),
      });
      const data = await res.json();
      if (res.ok) setFriendStatus('pending_sent');
      else alert(data.error ?? 'Failed to send request');
    } catch {
      alert('Failed to send friend request');
    } finally {
      setAddingFriend(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8faf9] flex flex-col min-h-[100dvh]">
      <header className="sticky top-0 z-10 bg-brand-800 text-white px-3 sm:px-4 py-2 sm:py-3 pt-[max(0.5rem,env(safe-area-inset-top))] shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/10 transition shrink-0 -ml-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {otherUser && (
            <>
              <Link href={`/profile/${otherUser.id}`} className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-90 transition">
                <div className="relative w-9 h-9 rounded-full bg-brand-600 overflow-hidden shrink-0">
                  {otherUser.avatar_url ? (
                    <Image src={otherUser.avatar_url} alt="" width={36} height={36} className="object-cover" unoptimized />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-lg">
                      {otherUser.gender === 'female' ? '👩' : otherUser.gender === 'male' ? '👨' : '👤'}
                    </span>
                  )}
                  {online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-brand-800" title="Online" />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="font-semibold truncate">{otherUser.display_name}</h1>
                  <p className="text-xs text-brand-200 truncate">
                    {otherUser.gender && `${otherUser.gender === 'female' ? 'Female' : otherUser.gender === 'male' ? 'Male' : 'Other'}`}
                    {otherUser.gender && otherUser.age != null && ' • '}
                    {otherUser.age != null && `${otherUser.age} yrs`}
                    {(otherUser.gender || otherUser.age != null) && (online || lastSeenAt) && ' • '}
                    {online ? 'Online' : lastSeenAt ? `Last seen ${formatLastSeen(lastSeenAt)}` : 'Offline'}
                    {formatMaritalStatus(otherUser.marital_status) && ` (${formatMaritalStatus(otherUser.marital_status)})`}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSearch(true)}
                  className="p-2 rounded-lg hover:bg-white/10 transition"
                  title="Search messages"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                {friendStatus === 'none' && (
                  <button
                    type="button"
                    onClick={sendFriendRequest}
                    disabled={addingFriend}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-medium transition"
                    title="Add as friend"
                  >
                    {addingFriend ? '…' : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>Add friend</span>
                      </>
                    )}
                  </button>
                )}
                {friendStatus === 'pending_sent' && (
                  <span className="px-3 py-2 rounded-xl bg-white/10 text-xs font-medium">Request sent</span>
                )}
                {friendStatus === 'pending_received' && friendRequestId && (
                  <>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const r = await fetch('/api/friends/decline', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ request_id: friendRequestId }),
                          });
                          if (r.ok) setFriendStatus('none');
                        } catch {}
                      }}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setAddingFriend(true);
                        try {
                          const r = await fetch('/api/friends/accept', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ request_id: friendRequestId }),
                          });
                          if (r.ok) setFriendStatus('friends');
                        } catch {}
                        setAddingFriend(false);
                      }}
                      disabled={addingFriend}
                      className="px-3 py-2 rounded-xl bg-green-500/80 hover:bg-green-500 text-xs font-medium disabled:opacity-50"
                    >
                      {addingFriend ? '…' : 'Accept'}
                    </button>
                  </>
                )}
                {friendStatus === 'friends' && (
                  <span className="px-3 py-2 rounded-xl bg-green-500/20 text-green-300 text-xs font-medium">✓ Friends</span>
                )}
              </div>
            </>
          )}
          {!otherUser && <h1 className="font-semibold flex-1 truncate">Chat</h1>}
        </div>
      </header>
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/50 flex flex-col items-center pt-20 px-4" onClick={() => setShowSearch(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="flex-1 h-10 px-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                autoFocus
              />
              <button type="button" onClick={() => setShowSearch(false)} className="p-2 text-stone-500 hover:text-stone-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {searching && <p className="text-sm text-stone-500 py-2">Searching...</p>}
              {!searching && searchQuery.trim().length >= 2 && searchResults.length === 0 && <p className="text-sm text-stone-500 py-2">No matches</p>}
              {!searching && searchResults.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => scrollToMessage(m.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-stone-100 text-sm"
                >
                  <span className="text-stone-600 truncate block">{m.content}</span>
                  <span className="text-xs text-stone-400">{new Date(m.created_at).toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0" ref={messagesEndRef}>
        {showJobDoneReminder && postId && !hasRatedPost && (
          <div className="max-w-[85%] mx-auto p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <p className="text-sm font-medium text-amber-900">Kya kaam ho gaya?</p>
            <p className="text-xs text-amber-700 mt-0.5">Review do – helpers ko madad milti hai</p>
            <Link
              href={`/post/${postId}?rate=1`}
              className="mt-3 inline-block px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition"
            >
              Review do
            </Link>
            <button
              type="button"
              onClick={() => setShowJobDoneReminder(false)}
              className="block mx-auto mt-2 text-xs text-amber-600 hover:underline"
            >
              Baad mein
            </button>
          </div>
        )}
        {messages.length === 0 && !otherUserTyping && (
          <p className="text-center text-stone-500 text-sm py-8">No messages yet. Say hello!</p>
        )}
        {otherUserTyping && (
          <div className="max-w-[85%] mr-auto p-3 rounded-2xl rounded-bl-md bg-white border border-stone-200">
            <span className="text-sm text-stone-500 italic">{otherUser?.display_name ?? 'Someone'} is typing...</span>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            id={`msg-${m.id}`}
            className={`max-w-[85%] p-3 rounded-2xl ${
              m.sender_id === userId
                ? 'ml-auto bg-brand-600 text-white rounded-br-md'
                : 'mr-auto bg-white border border-stone-200 text-stone-900 rounded-bl-md'
            }`}
          >
            {m.deleted_at ? (
              <span className="italic opacity-70">This message was deleted</span>
            ) : m.message_type === 'image' && m.content ? (
              <a href={m.content} target="_blank" rel="noopener noreferrer" className="block">
                <img src={m.content} alt="" className="max-w-full rounded-lg max-h-64 object-cover" />
              </a>
            ) : m.message_type === 'audio' && m.content ? (
              <audio src={m.content} controls className="max-w-full h-10" />
            ) : m.message_type === 'video' && m.content ? (
              <video src={m.content} controls className="max-w-full max-h-64 rounded-lg" />
            ) : (
              <span>{m.content}</span>
            )}
            {m.sender_id === userId && !m.deleted_at && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 pt-1 border-t border-white/20">
                <span className="text-xs opacity-80">{m.read_at ? '✓✓' : '✓'}</span>
                <button
                  type="button"
                  onClick={() => deleteMessage(m.id, false)}
                  className="text-xs opacity-70 hover:opacity-100"
                  title="Delete for me"
                >
                  Delete
                </button>
                {isPremium && (
                  <button
                    type="button"
                    onClick={() => deleteMessage(m.id, true)}
                    className="text-xs opacity-70 hover:opacity-100"
                    title="Delete for everyone"
                  >
                    Delete for all
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="p-3 sm:p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white border-t border-stone-200 shrink-0">
        {showAttachMenu && (
          <div className="flex gap-2 p-2 mb-2 rounded-xl bg-stone-50 border border-stone-200 overflow-x-auto">
            <label className="flex-1 flex flex-col items-center gap-1 p-3 rounded-lg bg-white border border-stone-200 hover:border-brand-400 cursor-pointer transition disabled:opacity-50" style={{ pointerEvents: sendingImage ? 'none' : 'auto' }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { sendImage(f); setShowAttachMenu(false); } e.target.value = ''; }}
                disabled={sendingImage}
              />
              <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-stone-600">Photo</span>
            </label>
            <label className="flex-1 flex flex-col items-center gap-1 p-3 rounded-lg bg-white border border-stone-200 hover:border-brand-400 cursor-pointer transition disabled:opacity-50" style={{ pointerEvents: sendingImage ? 'none' : 'auto' }}>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { sendVideo(f); setShowAttachMenu(false); } e.target.value = ''; }}
                disabled={sendingImage}
              />
              <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-stone-600">Video</span>
            </label>
            <button
              type="button"
              onClick={() => { startRecording(); setShowAttachMenu(false); }}
              disabled={sendingImage}
              className="flex-1 flex flex-col items-center gap-1 p-3 rounded-lg bg-white border border-stone-200 hover:border-brand-400 transition disabled:opacity-50"
            >
              <svg className="w-6 h-6 text-brand-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
              </svg>
              <span className="text-xs font-medium text-stone-600">Voice</span>
            </button>
          </div>
        )}
        <div className="flex gap-1.5 sm:gap-2 items-center min-w-0">
          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`p-2 rounded-xl transition shrink-0 flex-shrink-0 ${showAttachMenu ? 'bg-brand-100 text-brand-700' : 'hover:bg-stone-100 text-stone-500'}`}
            title="Attach - Image, Video, Voice"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          {recording ? (
            <button type="button" onClick={stopRecording} className="p-2 rounded-xl bg-red-100 text-red-600 animate-pulse shrink-0" title="Stop recording">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            </button>
          ) : (
            <button type="button" onClick={startRecording} className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 shrink-0" title="Voice message (max 1 min)">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" /></svg>
            </button>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type message..."
            className="flex-1 min-w-0 h-11 sm:h-12 px-3 sm:px-4 rounded-xl border-2 border-stone-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition text-base"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-50 transition shrink-0 flex-shrink-0"
          >
            Send
          </button>
        </div>
        {/* Chat suggestions & quick replies */}
        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-hide">
          {['Thanks', 'Call you soon', 'Job done', 'Ok', 'Yes', 'No', 'Will check', 'Thik hai'].map((quick) => (
            <button
              key={quick}
              type="button"
              onClick={() => {
                setInput(quick);
                hapticLight();
              }}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 hover:bg-brand-100 hover:text-brand-700 transition"
            >
              {quick}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-stone-400 mt-1 truncate">📎 Attach • 🎤 Voice • Quick replies</p>
      </form>
    </main>
  );
}
