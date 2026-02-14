import { View, Text, Pressable, StyleSheet, Linking, Image } from 'react-native';
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
      <Image source={require('@/assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Sign in with Google</Text>
      <Text style={styles.subtitle}>Use your Gmail account to continue</Text>
      <Pressable style={styles.button} onPress={handleGoogleLogin}>
        <Image
          source={{ uri: 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png' }}
          style={styles.googleIcon}
          resizeMode="contain"
        />
        <Text style={styles.buttonText}>Continue with Google</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fafaf9', alignItems: 'center' },
  logo: { width: 64, height: 64, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '600', color: '#1c1917', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#57534e', marginTop: 8, textAlign: 'center' },
  button: { marginTop: 24, height: 52, paddingHorizontal: 24, backgroundColor: '#fff', borderWidth: 2, borderColor: '#e7e5e4', borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 12 },
  googleIcon: { width: 24, height: 24 },
  buttonText: { color: '#44403c', fontWeight: '600', fontSize: 16 },
});
