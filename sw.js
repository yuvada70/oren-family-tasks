self.addEventListener('push', event => {
  const data = event.data?.json() || {};

  event.waitUntil(
    self.registration.showNotification(data.title || 'נדנוד! 🔔', {
      body: data.body || 'יש לך משימה',
      vibrate: [200, 100, 200, 100, 200],
      tag: 'nudge',
      renotify: true,
      data: { url: self.location.origin }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
