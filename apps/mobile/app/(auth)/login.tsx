import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { createClient } from '@/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'madadgar://auth/callback',
      },
    });
    if (error) {
      console.error(error);
      return;
    }
    if (data?.url) {
      Linking.openURL(data.url);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in with Google</Text>
      <Text style={styles.subtitle}>Use your Gmail account to continue</Text>
      <Pressable style={styles.button} onPress={handleGoogleLogin}>
        <Text style={styles.buttonText}>Continue with Google</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fafaf9' },
  title: { fontSize: 24, fontWeight: '600', color: '#1c1917' },
  subtitle: { fontSize: 14, color: '#57534e', marginTop: 8 },
  button: { marginTop: 24, height: 48, backgroundColor: '#14b8a6', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '500' },
});
