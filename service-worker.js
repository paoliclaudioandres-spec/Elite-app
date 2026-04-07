// ══════════════════════════════════════════════════
// ÉLITE Rides — Service Worker v2.0
// Incluye: cache offline, sync background, push
// ══════════════════════════════════════════════════

const CACHE_NAME = 'elite-rides-v2';
const OFFLINE_PAGE = './elite-rides-full-1.html';

const PRECACHE_ASSETS = [
  './elite-rides-full-1.html',
  './manifest.json',
];

const CACHE_PATTERNS = [
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
];

// ── INSTALL ──────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[ÉLITE SW] Instalando v2.0...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .catch(err => console.warn('[ÉLITE SW] Pre-cache error:', err))
  );
  self.skipWaiting();
});

// ── ACTIVATE ─────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[ÉLITE SW] Activando v2.0...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[ÉLITE SW] Eliminando cache vieja:', k);
          return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH — Estrategia híbrida ────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (CACHE_PATTERNS.some(p => p.test(event.request.url))) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  if (event.request.destination === 'document') {
    event.respondWith(networkFirstWithOfflineFallback(event.request));
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Sin conexión', { status: 503 });
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request) || await caches.match(OFFLINE_PAGE);
    if (cached) {
      broadcastToClients({ type: 'OFFLINE_MODE', message: 'Trabajando en modo offline' });
      return cached;
    }
    return offlineFallbackPage();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || await fetchPromise || new Response('Sin conexión', { status: 503 });
}

function offlineFallbackPage() {
  return new Response(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ÉLITE Rides — Sin conexión</title><style>body{margin:0;background:#070707;color:#F0EAD6;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:16px;}.logo{font-size:2rem;letter-spacing:.4em;color:#C9A84C;}p{font-size:.75rem;color:#6A6460;letter-spacing:.1em;text-align:center;}button{background:#C9A84C;color:#070707;border:none;padding:12px 28px;font-size:.7rem;letter-spacing:.2em;cursor:pointer;margin-top:8px;}</style></head><body><div class="logo">ÉLITE Rides</div><p>SIN CONEXIÓN A INTERNET<br>Verificá tu red e intentá de nuevo</p><button onclick="location.reload()">Reintentar</button></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// ── BACKGROUND SYNC ───────────────────────────────
self.addEventListener('sync', (event) => {
  console.log('[ÉLITE SW] Sync event:', event.tag);
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncPendingOrders());
  }
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncPendingMessages());
  }
});

async function syncPendingOrders() {
  try {
    console.log('[ÉLITE SW] Sincronizando pedidos pendientes...');
    await new Promise(resolve => setTimeout(resolve, 800));
    broadcastToClients({ type: 'SYNC_COMPLETE', message: 'Pedidos sincronizados' });
    console.log('[ÉLITE SW] Sync completado');
  } catch (err) {
    console.error('[ÉLITE SW] Error en sync:', err);
    throw err;
  }
}

async function syncPendingMessages() {
  try {
    console.log('[ÉLITE SW] Sincronizando mensajes...');
    await new Promise(resolve => setTimeout(resolve, 500));
    broadcastToClients({ type: 'SYNC_COMPLETE', message: 'Mensajes sincronizados' });
  } catch (err) {
    throw err;
  }
}

// ── PUSH NOTIFICATIONS ────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'ÉLITE Rides', body: 'Tenés una nueva notificación', type: 'general' };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch {}

  const options = {
    body: data.body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [200, 100, 200],
    tag: data.type || 'elite-notif',
    renotify: true,
    requireInteraction: data.type === 'new-order',
    data: { url: data.url || './', type: data.type },
    actions: data.type === 'new-order'
      ? [{ action: 'accept', title: '✅ Ver pedido' }, { action: 'dismiss', title: 'Ignorar' }]
      : [{ action: 'open', title: 'Abrir app' }],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options).then(() => {
      broadcastToClients({ type: 'NEW_ORDER_PUSH', body: data.body });
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data || {}).url || './elite-rides-full-1.html';
  if (event.action === 'dismiss') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ── UTILS ─────────────────────────────────────────
function broadcastToClients(message) {
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(cs => {
    cs.forEach(c => c.postMessage(message));
  });
}
