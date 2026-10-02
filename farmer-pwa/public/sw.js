const CACHE = "kisan-soil-advisor-v5";
const APP_SHELL = [
  "/",
  "/login",
  "/dashboard",
  "/soil-icon.svg",
  "/soil-icon-192.png",
  "/soil-icon-512.png",
  "/field-soil-illustration.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith("kisan-soil-advisor-") && key !== CACHE).map((key) => caches.delete(key)),
  )));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname === "/sw.js") return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(async (response) => {
      if (response.ok) await (await caches.open(CACHE)).put(url.pathname, response.clone());
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match(url.pathname)) || (await caches.match("/")) || Response.error()));
    return;
  }

  if (!url.pathname.startsWith("/_next/static/") && !/\.(?:css|js|svg|png|ico|woff2?)$/i.test(url.pathname)) return;
  event.respondWith(caches.match(request).then(async (cached) => {
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await (await caches.open(CACHE)).put(request, response.clone());
    return response;
  }));
});
