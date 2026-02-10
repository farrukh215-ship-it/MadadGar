import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { createClient } from '@/lib/supabase';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/(tabs)/feed');
      } else {
        router.replace('/(auth)/login');
      }
    })();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafaf9' }}>
      <Text style={{ fontSize: 28, fontWeight: '600', color: '#0d9488' }}>Madadgar</Text>
      <Text style={{ marginTop: 8, fontSize: 16, color: '#57534e' }}>
        Trusted logon ki madad, bilkul qareeb
      </Text>
      <Pressable
        onPress={() => router.replace('/(auth)/login')}
        style={{ marginTop: 48, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#14b8a6', borderRadius: 12 }}
      >
        <Text style={{ color: 'white', fontWeight: '500' }}>Get Started</Text>
      </Pressable>
    </View>
  );
}
