var cacheName = "hello-pwa";
var filesToCache = [
  "/",
  "/index.html",
  "/assets/index.css",
  "/audio/boxing-bell.mp3",
  "/audio/countdown.mp3",
  "/audio/half-time.mp3",
  "/audio/pause.mp3",
  "/external-lib/soundjs.min.js",
  "/external-lib/mini-default.min.css",
  "/scripts/config.js",
  "/scripts/Countdown.js",
  "/scripts/event-handlers.js",
  "/scripts/events.js",
  "/scripts/helpers.js",
  "/scripts/Spartacus.js",
];

/* Start the service worker and cache all of the app's content */
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.addAll(filesToCache);
    })
  );
});

/* Serve cached content when offline */
self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (response) {
      return response || fetch(e.request);
    })
  );
});
