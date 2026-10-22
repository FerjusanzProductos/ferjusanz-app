// Service worker de Ferjusanz: permite abrir la app sin conexión.
// Guarda la propia app y la librería de Supabase. Los datos NUNCA se guardan aquí
// (las llamadas a supabase.co siempre van a la red).
const CACHE = 'ferjusanz-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
// Librería de Supabase (la misma dirección que usa index.html): se guarda en la instalación
// para que la app arranque aunque no haya conexión.
const LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(SHELL);
    try { const r = await fetch(LIB, { mode: 'cors' }); if (r.ok) await c.put(LIB, r); } catch (err) { /* se reintenta al navegar */ }
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('supabase.co')) return;               // datos: siempre red
  const esApp = url.origin === self.location.origin;
  const esLib = url.hostname === 'cdn.jsdelivr.net';
  if (!esApp && !esLib) return;
  // Primero red (para recibir versiones nuevas); si falla, lo guardado.
  e.respondWith(
    fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: !esLib }).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
