import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { createClient } from '@/lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
    })();
  }, []);

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafaf9' }}>
        <Pressable onPress={() => router.replace('/(auth)/login')} style={{ padding: 16, backgroundColor: '#14b8a6', borderRadius: 12 }}>
          <Text style={{ color: 'white', fontWeight: '500' }}>Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#fafaf9' }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>My profile</Text>
      <Text style={{ marginTop: 16, color: '#57534e' }}>{user.phone ?? '—'}</Text>
    </View>
  );
}
