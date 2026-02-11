'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { subscribeToMessages } from '@/lib/supabase/realtime';

type Message = {
  id: string;
  content: string | null;
  message_type: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
};

export default function ChatScreen() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
      const { data } = await supabase
        .from('messages')
        .select('id, content, message_type, sender_id, created_at, read_at')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });
      setMessages(data ?? []);
      const unreadFromOther = (data ?? []).filter((m) => m.sender_id !== user.id && !m.read_at);
      if (unreadFromOther.length > 0) {
        const now = new Date().toISOString();
        for (const m of unreadFromOther) {
          await supabase.from('messages').update({ read_at: now }).eq('id', m.id);
        }
      }
    })();
  }, [threadId, router]);

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
          prev.map((m) => (m.id === updated.id ? { ...m, read_at: updated.read_at } : m))
        );
      }
    );
    return unsub;
  }, [threadId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;
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
    setInput('');
  };

  return (
    <main className="min-h-screen bg-[#f8faf9] flex flex-col">
      <header className="sticky top-0 z-10 bg-brand-800 text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/10 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-semibold flex-1 truncate">Chat</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-stone-500 text-sm py-8">No messages yet. Say hello!</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] p-3 rounded-2xl ${
              m.sender_id === userId
                ? 'ml-auto bg-brand-600 text-white rounded-br-md'
                : 'mr-auto bg-white border border-stone-200 text-stone-900 rounded-bl-md'
            }`}
          >
            <span>{m.content}</span>
            {m.sender_id === userId && (
              <span className="ml-2 text-xs opacity-80">{m.read_at ? '✓✓' : '✓'}</span>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-stone-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type message..."
            className="flex-1 h-12 px-4 rounded-xl border-2 border-stone-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
          />
          <button
            type="submit"
            className="h-12 px-6 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition"
          >
            Send
          </button>
        </div>
      </form>
    </main>
  );
}
