import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { createClient } from '@/lib/supabase';

export default function AuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (url) {
        const parsed = Linking.parse(url);
        const code = parsed.queryParams?.code;
        if (code) {
          const supabase = createClient();
          await supabase.auth.exchangeCodeForSession(code as string);
        }
      }
      router.replace('/(tabs)/feed');
    };

    Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafaf9' },
  text: { fontSize: 16, color: '#57534e' },
});
