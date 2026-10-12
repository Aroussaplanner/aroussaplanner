// Aroussa Planner — Service Worker
// Versie: 1.0.0
// Strategie: network-first overal. Alleen de statische homepage-shell wordt gecachet
// als offline-fallback. Authenticatie, producten en functies worden NOOIT gecachet.

const CACHE_NAME = 'aroussa-shell-v1';

// Paden die de SW volledig OVERSLAAT — altijd rechtstreeks naar het netwerk
const BYPASS_PATHS = [
  '/.netlify/',          // Netlify Functions én Identity
  '/mijn-account',       // Beveiligd klantportaal
  '/producten/',         // Tokengebeveiligde producten
  '/aanmelden',          // Aanmeldformulier
  '/geheim-admin/',      // Adminpaneel
  '/kaart/',             // Privacy Kaart
  '/login',              // Login redirect
];

// Alleen deze bestanden worden gecachet als offline-fallback
const PRECACHE_URLS = [
  '/',
  '/logo-512.png',
  '/icon-192.png',
];

// ─── Install: precache shell ──────────────────────────────────────────────────
self.addEventListener('install', event => {
  // Activeer de nieuwe SW direct, zonder te wachten op bestaande clients
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Fouten bij individuele bestanden mogen de installatie niet blokkeren
      return Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => {
            console.warn('[SW] Precache mislukt voor', url, err);
          })
        )
      );
    })
  );
});

// ─── Activate: verwijder oude caches ─────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('[SW] Oude cache verwijderd:', key);
              return caches.delete(key);
            })
        )
      )
      .then(() => self.clients.claim()) // Beheer bestaande tabs direct
  );
});

// ─── Fetch: network-first met veilige fallback ────────────────────────────────
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Alleen GET-verzoeken behandelen — POST (formulieren, functies) altijd bypassen
  if (request.method !== 'GET') {
    return; // Geen respondWith → browser handelt zelf af
  }

  // 2. Externe domeinen volledig bypassen
  //    (Netlify Identity, Google Fonts, Supabase)
  if (url.hostname !== self.location.hostname) {
    return;
  }

  // 3. Beschermde paden bypassen — altijd rechtstreeks naar netwerk
  const path = url.pathname;
  if (BYPASS_PATHS.some(bypass => path.startsWith(bypass))) {
    return;
  }

  // 4. Network-first voor alles wat overblijft
  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  try {
    // Probeer altijd het netwerk eerst
    const networkResponse = await fetch(request);

    // Sla succesvolle responses op (alleen voor gecachete shell-bestanden)
    if (networkResponse.ok) {
      const url = new URL(request.url);
      const isCacheable =
        url.pathname === '/' ||
        url.pathname === '/index.html' ||
        url.pathname.endsWith('.png');

      if (isCacheable) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone()).catch(() => {});
      }
    }

    return networkResponse;
  } catch (networkError) {
    // Netwerk niet beschikbaar — probeer cache als fallback
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Geen cache voor dit verzoek — stuur homepage als ultimate fallback
    const fallback = await caches.match('/');
    if (fallback) {
      return fallback;
    }

    // Echt niets beschikbaar
    throw networkError;
  }
}
