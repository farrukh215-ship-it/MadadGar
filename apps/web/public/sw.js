self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Madadgar', body: event.data.text() || 'New notification' };
  }
  const title = data.title || 'Madadgar';
  const body = data.body || '';
  const url = data.url || '/';
  const options = {
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    data: { url },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      if (list.length > 0) {
        const client = list.find((c) => c.url.startsWith(self.location.origin));
        if (client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
