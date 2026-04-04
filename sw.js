self.addEventListener('push', event => {
  const data = event.data?.json() || {};

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(data.title || 'נדנוד! 🔔', {
        body: data.body || 'יש לך משימה',
        vibrate: [300, 100, 300, 100, 300],
        tag: data.type === 'confirmation' ? 'confirmation' : 'nudge',
        renotify: true,
        requireInteraction: data.type !== 'confirmation',
        data: {
          url: self.location.origin,
          sender: data.sender,
          taskTitle: data.taskTitle,
          type: data.type
        }
      });

      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });

      if (data.type === 'nudge') {
        clients.forEach(client => client.postMessage({
          type: 'PLAY_SOUND',
          sender: data.sender,
          taskTitle: data.taskTitle
        }));
      }

      if (data.type === 'confirmation') {
        clients.forEach(client => client.postMessage({
          type: 'CONFIRMATION_SOUND'
        }));
      }
    })()
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const { url, sender, taskTitle, type } = event.notification.data;

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(async clients => {
      if (clients.length > 0) {
        await clients[0].focus();
        clients[0].postMessage({
          type: type === 'confirmation' ? 'CONFIRMATION_SOUND' : 'PLAY_SOUND',
          sender,
          taskTitle
        });
      } else {
        await self.clients.openWindow(
          type === 'nudge'
            ? `${url}?play=1&sender=${encodeURIComponent(sender)}&task=${encodeURIComponent(taskTitle)}`
            : url
        );
      }
    })
  );
});
