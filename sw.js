// Service worker de Ferjusanz: permite abrir la app sin conexión.
// Guarda la propia app y la librería de Supabase. Los datos NUNCA se guardan aquí
// (las llamadas a supabase.co siempre van a la red).
const CACHE = 'ferjusanz-v15';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
// Librería de Supabase (la misma dirección que usa index.html): se guarda en la instalación
// para que la app arranque aunque no haya conexión.
const LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    // Cada archivo por separado: si falta uno (p. ej. un icono), los demás se guardan igualmente y la app sigue funcionando sin conexión.
    await Promise.all(SHELL.map(f => c.add(f).catch(() => { })));
    // La librería se guarda sin bloquear la instalación (con mala cobertura no debe retrasarla); si falla, se guarda al navegar.
    fetch(LIB, { mode: 'cors' }).then(r => { if (r.ok) c.put(LIB, r); }).catch(() => { });
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
  // Primero red (para recibir versiones nuevas); si tarda más de 4 s o falla (poca cobertura), lo guardado.
  const red = fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque')) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
    return res;
  });
  red.catch(() => { });
  const guardado = () => caches.match(req, { ignoreSearch: !esLib }).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : undefined));
  e.respondWith(
    Promise.race([red, new Promise(ok => setTimeout(() => ok(null), 4000))])
      .then(async res => res || (await guardado()) || red)
      .catch(() => guardado().then(r => r || Response.error()))
  );
});
