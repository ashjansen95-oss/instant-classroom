/**
 * Offline support for Instant Classroom.
 *
 * Written by hand rather than generated: the app has no API and ships its whole
 * activity library inside the JS bundle, so "working offline" only needs the
 * shell and the static chunks to be cached. That's a few lines of runtime
 * caching, not a build-time manifest and a dependency.
 *
 * Strategy per request type:
 *   /_next/static/*  cache-first     — immutable, content-hashed filenames
 *   navigations      network-first   — fresh pages when online, cache when not
 *   other same-origin GETs           stale-while-revalidate
 */

const VERSION = "v1";
const SHELL_CACHE = `shell-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;
const PAGE_CACHE = `pages-${VERSION}`;

const OFFLINE_FALLBACK = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll([OFFLINE_FALLBACK, "/icon-192.png"]))
      // A failed precache must not block activation — the runtime caches will
      // fill in on the next request anyway.
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.endsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    void cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGE_CACHE);
      void cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Any page is better than the browser's dinosaur — the generator on "/"
    // works with no network at all.
    const fallback = await caches.match(OFFLINE_FALLBACK);
    if (fallback) return fallback;

    return new Response("You're offline, and this page hasn't been opened before.", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);

  const network = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(cacheName);
        void cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached ?? network;
}
