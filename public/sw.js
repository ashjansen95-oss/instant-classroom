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

    // No cached copy of *this* page exists — a teacher tapping an activity
    // that's never been opened before, right as school wifi drops. This used
    // to silently serve the cached "/" document here instead: the browser
    // kept the activity's URL in the address bar, but every byte on screen
    // was Home's, hydrated against Home's own data. No error, no clue
    // anything had gone wrong — just "I tapped an activity and it took me
    // back to Home". Fixed pages (the shell itself) still recover via the
    // cache lookup above; only this never-seen-before case needs honesty
    // instead of a silent substitution.
    return offlineFallbackResponse();
  }
}

function offlineFallbackResponse() {
  return new Response(OFFLINE_HTML, {
    status: 503,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

const OFFLINE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Offline &middot; Instant Classroom</title>
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 0; min-height: 100dvh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    padding: 2rem 1.5rem; gap: 0.75rem; box-sizing: border-box;
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    background: #fdf8f0; color: #1c1a17;
  }
  @media (prefers-color-scheme: dark) { body { background: #1c1a17; color: #fdf8f0; } }
  p.emoji { font-size: 3rem; margin: 0; }
  h1 { font-size: 1.5rem; margin: 0; }
  p.sub { margin: 0; opacity: 0.7; max-width: 32ch; }
  .row { display: flex; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap; justify-content: center; }
  button, a {
    font: inherit; font-weight: 700; padding: 0.75rem 1.5rem; border-radius: 999px;
    border: 2px solid currentColor; background: transparent; color: inherit;
    text-decoration: none; cursor: pointer;
  }
</style>
</head>
<body>
<p class="emoji" aria-hidden="true">📡</p>
<h1>Couldn&rsquo;t load that page</h1>
<p class="sub">No connection right now, and this one hasn&rsquo;t been opened before on this device.</p>
<div class="row">
  <button type="button" onclick="location.reload()">Try again</button>
  <a href="/">Go to the generator</a>
</div>
</body>
</html>`;

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
