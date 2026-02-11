import { useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { createClient } from '@/lib/supabase';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications(userId: string | undefined) {
  const registered = useRef(false);

  useEffect(() => {
    if (!userId || !Device.isDevice || registered.current) return;

    (async () => {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let final = existing;
      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        final = status;
      }
      if (final !== 'granted') return;

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
      const supabase = createClient();
      await supabase.from('push_tokens').upsert(
        { user_id: userId, token, platform },
        { onConflict: 'user_id,platform' }
      );
      registered.current = true;
    })();
  }, [userId]);
}
