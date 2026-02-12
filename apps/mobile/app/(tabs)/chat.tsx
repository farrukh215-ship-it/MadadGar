import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  useWindowDimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

type Thread = {
  id: string;
  updated_at: string;
  post_id: string | null;
  title: string;
  unread_count?: number;
  last_message?: string | null;
  is_friend?: boolean;
  other_user?: { id: string; display_name: string } | null;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 86400) return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  if (diff < 86400 * 2) return 'Yesterday';
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}

export default function ChatScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isNarrow = width < 400;
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authError, setAuthError] = useState(false);

  const fetchThreads = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setAuthError(true);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setAuthError(false);
    try {
      const res = await fetch(`${API_URL}/api/chat/threads`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (res.status === 401) {
        setAuthError(true);
        setThreads([]);
        return;
      }
      setThreads(data.threads ?? []);
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchThreads();
  };

  const openChat = (threadId: string) => {
    const url = `${WEB_URL}/chat/${threadId}`;
    Linking.openURL(url).catch(() => {});
  };

  if (authError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>Chats</Text>
        <Text style={styles.emptyText}>Login required</Text>
        <Text style={styles.hint}>Sign in to view and send messages</Text>
        <Pressable style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginBtnText}>Login</Text>
        </Pressable>
      </View>
    );
  }

  if (loading && threads.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>Chats</Text>
        <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, isNarrow && styles.headerNarrow]}>
        <Text style={[styles.title, isNarrow && styles.titleNarrow]}>Chats</Text>
        <Text style={[styles.subtitle, isNarrow && styles.subtitleNarrow]}>
          Tap to open conversation
        </Text>
      </View>

      {threads.length === 0 ? (
        <View style={[styles.empty, styles.centered]}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyText}>No chats yet</Text>
          <Text style={styles.hint}>
            Start by tapping Chat on any helper in the feed
          </Text>
          <Pressable style={styles.feedBtn} onPress={() => router.push('/(tabs)/feed')}>
            <Text style={styles.feedBtnText}>Browse helpers</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, isNarrow && styles.listNarrow]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                isNarrow && styles.cardNarrow,
                pressed && styles.cardPressed,
              ]}
              onPress={() => openChat(item.id)}
              android_ripple={{ color: 'rgba(13,148,136,0.1)' }}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>💬</Text>
                {(item.unread_count ?? 0) > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {item.unread_count! > 99 ? '99+' : item.unread_count}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.cardPreview} numberOfLines={1}>
                  {item.last_message || 'No messages yet'}
                </Text>
                <Text style={styles.cardTime}>{formatTime(item.updated_at)}</Text>
              </View>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>›</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaf9',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#0d9488',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  headerNarrow: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  titleNarrow: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  subtitleNarrow: {
    fontSize: 12,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  listNarrow: {
    padding: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f5f5f4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardNarrow: {
    padding: 12,
  },
  cardPressed: {
    opacity: 0.9,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1917',
  },
  cardPreview: {
    fontSize: 14,
    color: '#78716c',
    marginTop: 2,
  },
  cardTime: {
    fontSize: 11,
    color: '#a8a29e',
    marginTop: 2,
  },
  arrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 24,
    color: '#0d9488',
    fontWeight: '300',
  },
  empty: {
    flex: 1,
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#57534e',
  },
  hint: {
    fontSize: 14,
    color: '#78716c',
    marginTop: 6,
    textAlign: 'center',
  },
  loginBtn: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: '#0d9488',
    borderRadius: 14,
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  feedBtn: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: '#0d9488',
    borderRadius: 14,
  },
  feedBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
