import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const CREATE_OPTIONS = [
  {
    id: 'post',
    label: 'Recommend Helper',
    icon: '🔧',
    description: 'Share a trusted mechanic, cook, driver, etc.',
    href: '/post',
  },
  {
    id: 'ask-for-help',
    label: 'Ask for Help',
    icon: '💡',
    description: 'Get suggestions — beauty parlour, restaurant, doctor',
    href: '/ask-for-help',
  },
  {
    id: 'donation',
    label: 'Request Donation',
    icon: '💝',
    description: 'Create a verified donation request',
    href: '/donation/create',
  },
];

export default function PostScreen() {
  const openUrl = (path: string) => {
    Linking.openURL(`${WEB_URL}${path}`).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create</Text>
      <Text style={styles.subheader}>Choose what you want to share</Text>
      <View style={styles.options}>
        {CREATE_OPTIONS.map((opt) => (
          <Pressable
            key={opt.id}
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            onPress={() => openUrl(opt.href)}
          >
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{opt.icon}</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>{opt.label}</Text>
              <Text style={styles.optionDesc}>{opt.description}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.hint}>Opens in browser for full experience</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafaf9', padding: 20 },
  header: { fontSize: 24, fontWeight: '600', color: '#0d9488' },
  subheader: { fontSize: 14, color: '#57534e', marginTop: 4 },
  options: { marginTop: 24, gap: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f5f5f4',
  },
  optionPressed: { opacity: 0.85 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 24 },
  optionContent: { flex: 1, marginLeft: 14 },
  optionLabel: { fontSize: 16, fontWeight: '600', color: '#1c1917' },
  optionDesc: { fontSize: 13, color: '#78716c', marginTop: 2 },
  arrow: { fontSize: 18, color: '#14b8a6', fontWeight: '500' },
  hint: { marginTop: 20, fontSize: 12, color: '#a8a29e', textAlign: 'center' },
});
