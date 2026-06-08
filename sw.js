/* GRT Free — service worker: receives push messages and shows the notification */
self.addEventListener('push', (event) => {
  let data = { title: 'GRT Free', body: 'Your bus is approaching.' };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch (e) { /* plain text */ }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'assets/icon-512.png',
      badge: 'assets/icon-512.png',
      tag: data.tag || 'grt-arrival',
      renotify: true,
      data: { url: data.url || './' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
