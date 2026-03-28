self.addEventListener('push', event => {
  const data = event.data?.json() || {};

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(data.title || 'נדנוד! 🔔', {
        body: data.body || 'יש לך משימה',
        vibrate: [300, 100, 300, 100, 300],
        tag: 'nudge',
        renotify: true,
        requireInteraction: true,
        data: { url: self.location.origin }
      });

      // מנגן צליל אם האפליקציה פתוחה
      const clients = await self.clients.matchAll({ 
        type: 'window', 
        includeUncontrolled: true 
      });
      clients.forEach(client => client.postMessage({ type: 'PLAY_SOUND' }));
    })()
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(async clients => {
      if (clients.length > 0) {
        await clients[0].focus();
        clients[0].postMessage({ type: 'PLAY_SOUND' });
      } else {
        await self.clients.openWindow(event.notification.data.url + '?play=1');
      }
    })
  );
});
