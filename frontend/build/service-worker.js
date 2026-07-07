/* public/service-worker.js */
const STATIC_CACHE = "mf-static-v1";
const RUNTIME_CACHE = "mf-runtime-v1";
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png"
];
let broadcastChannel;
try {
  broadcastChannel = new BroadcastChannel("pwa-events");
} catch (e) {
  console.error("Broadcast Channel não é suportado.");
}
async function focusOrOpen(url) {
  const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
  const targetClient = allClients.find(c => c.url.includes(url));
  if (targetClient) {
    return targetClient.focus();
  }
  return clients.openWindow(url);
}
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter(name => ![STATIC_CACHE, RUNTIME_CACHE].includes(name))
        .map(name => caches.delete(name))
    );
    await self.clients.claim();
  })());
});
self.addEventListener("push", event => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: "Notificação", body: event.data.text() };
  }

  const title = payload.title || "AtendeTicket";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/android-chrome-192x192.png",
    badge: payload.badge || "/android-chrome-192x192.png",
    tag: payload.tag || "default-tag",
    data: {
      url: payload.url || "/",
      ...payload.data
    },
    sound: payload.sound || undefined,
    vibrate: payload.vibrate || [200, 100, 200],
    requireInteraction: true
  };
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: "PUSH_EVENT", payload });
  }
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(focusOrOpen(urlToOpen));
});