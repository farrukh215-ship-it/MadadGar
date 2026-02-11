import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { createClient } from '@/lib/supabase';
import { usePushNotifications } from '@/lib/usePushNotifications';

export default function TabLayout() {
  const [userId, setUserId] = useState<string | undefined>();
  usePushNotifications(userId);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    })();
  }, []);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="feed" options={{ title: 'Home', tabBarLabel: 'Home' }} />
      <Tabs.Screen name="post" options={{ title: 'Post', tabBarLabel: 'Post' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarLabel: 'Chat' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarLabel: 'Profile' }} />
    </Tabs>
  );
}
