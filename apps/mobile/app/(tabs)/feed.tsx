import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Linking, StyleSheet } from 'react-native';
import { createClient } from '@/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function FeedScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lat, setLat] = useState(31.52);
  const [lng, setLng] = useState(74.35);

  useEffect(() => {
    fetch(`${API_URL}/api/feed/nearby?lat=${lat}&lng=${lng}&radius=5000`)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  const formatDistance = (m?: number) => {
    if (m == null) return '';
    if (m < 1000) return `${Math.round(m)} m`;
    return `${(m / 1000).toFixed(1)} km`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Madadgar</Text>
      <Text style={styles.subheader}>Nearby</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>No posts nearby. Be the first to share!</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          removeClippedSubviews
          maxToRenderPerBatch={8}
          initialNumToRender={6}
          windowSize={5}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.category}>{item.category_name}</Text>
              <Text style={styles.meta}>
                ⭐ {item.avg_rating ?? '—'} • Recommended by {item.rec_count ?? 0} • {formatDistance(item.distance_m)}
              </Text>
              {(item.reason || item.relation_tag) && (
                <Text style={styles.reason}>{item.reason ?? item.relation_tag}</Text>
              )}
              <Text style={styles.madad}>Madad ki ❤️ {item.madad_count}</Text>
              <View style={styles.actions}>
                <Pressable
                  style={styles.callButton}
                  onPress={() => Linking.openURL(`tel:${item.phone}`)}
                >
                  <Text style={styles.callText}>📞 Call</Text>
                </Pressable>
                <Pressable style={styles.chatButton}>
                  <Text style={styles.chatText}>💬 Chat</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafaf9', padding: 16 },
  header: { fontSize: 24, fontWeight: '600', color: '#0d9488' },
  subheader: { fontSize: 14, color: '#57534e', marginTop: 4 },
  loading: { textAlign: 'center', marginTop: 48, color: '#78716c' },
  empty: { textAlign: 'center', marginTop: 48, color: '#78716c' },
  card: { marginTop: 16, padding: 16, backgroundColor: '#fff', borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
  category: { fontSize: 16, fontWeight: '500' },
  meta: { fontSize: 12, color: '#57534e', marginTop: 4 },
  reason: { fontSize: 14, color: '#57534e', marginTop: 4 },
  madad: { fontSize: 12, color: '#57534e', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  callButton: { flex: 1, backgroundColor: '#14b8a6', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  callText: { color: 'white', fontWeight: '500' },
  chatButton: { flex: 1, borderWidth: 1, borderColor: '#14b8a6', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  chatText: { color: '#0d9488', fontWeight: '500' },
});
