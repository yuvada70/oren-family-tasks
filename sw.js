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
          type: data.type
        }
      });

      // אם זה נדנוד — שולח אישור קבלה אוטומטית
      if (data.type === 'nudge' && data.sender) {
        const myName = await self.clients.matchAll({ type: 'window' })
          .then(clients => clients.length > 0 
            ? clients[0].evaluate?.('localStorage.getItem("myName")') 
            : null
          ).catch(() => null);

        // מודיע לאפליקציה לשלוח אישור
        const clients = await self.clients.matchAll({ 
          type: 'window', 
          includeUncontrolled: true 
        });
        clients.forEach(client => client.postMessage({ 
          type: 'PLAY_SOUND'
        }));
      }

      // אם זה אישור קבלה — רק מנגן צליל קצר
      if (data.type === 'confirmation') {
        const clients = await self.clients.matchAll({ 
          type: 'window', 
          includeUncontrolled: true 
        });
        clients.forEach(client => client.postMessage({ 
          type: 'CONFIRMATION_SOUND'
        }));
      }
    })()
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const { url, sender, type } = event.notification.data;

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(async clients => {
      if (clients.length > 0) {
        await clients[0].focus();
        clients[0].postMessage({ 
          type: type === 'confirmation' ? 'CONFIRMATION_SOUND' : 'PLAY_SOUND',
          sender
        });
      } else {
        const newClient = await self.clients.openWindow(
          type === 'nudge' ? `${url}?play=1&sender=${sender}` : url
        );
      }
    })
  );
});
