/**
 * Service Worker for Battletech Mercenary Command
 * Provides offline functionality and performance optimizations
 */

const CACHE_NAME = 'battletech-command-v1.0.0';
const CACHE_ASSETS = [
  // Core files
  '/web/',
  '/web/index.html',
  '/web/manifest.json',
  '/web/styles.css',
  '/web/game_professional.js',
  
  // Core JavaScript modules
  '/web/src/systems/js/GameEngine.js',
  '/web/src/systems/js/AudioManager.js',
  '/web/src/systems/js/MobileOptimizer.js',
  '/web/src/systems/js/DataManager.js',
  '/web/src/systems/js/ScreenManager.js',
  '/web/src/systems/js/GameState.js',
  '/web/src/utils/EventBus.js',
  '/web/src/utils/Logger.js',
  '/web/src/utils/NotificationSystem.js',
  
  // Game systems
  '/web/src/systems/js/CompanySystem.js',
  '/web/src/systems/js/PilotSystem.js',
  '/web/src/systems/js/MechSystem.js',
  '/web/src/systems/js/ContractSystem.js',
  '/web/src/systems/js/CombatSystem.js',
  '/web/src/systems/js/FactionSystem.js',
  '/web/src/systems/js/TutorialSystem.js',
  
  // Critical audio files
  '/web/src/assets/audio/ui/button-click.wav',
  '/web/src/assets/audio/ui/button-hover.wav',
  '/web/src/assets/audio/ui/menu-select.wav',
  '/web/src/assets/audio/ui/notification.wav',
  
  // Fonts and icons (if any)
  '/web/src/assets/fonts/',
  '/web/src/assets/images/'
];

/**
 * Install event - cache critical resources
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching core assets...');
        
        // Cache critical assets first
        const criticalAssets = [
          '/web/',
          '/web/index.html',
          '/web/styles.css',
          '/web/game_professional.js'
        ];
        
        return cache.addAll(criticalAssets);
      })
      .then(() => {
        // Pre-cache other assets in background
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache assets during install:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - serve from cache with network fallback
 */
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          // For critical assets, also check for updates in background
          if (isCriticalAsset(event.request.url)) {
            updateCacheInBackground(event.request);
          }
          return cachedResponse;
        }
        
        // Network fallback
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache if not successful
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone response before caching
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch((error) => {
            console.error('[SW] Network request failed:', error);
            
            // Return offline page for HTML requests
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/web/index.html');
            }
            
            // Return empty response for other failed requests
            return new Response('', { status: 408, statusText: 'Offline' });
          });
      })
  );
});

/**
 * Background sync for game saves
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-save') {
    event.waitUntil(handleBackgroundSync());
  }
});

/**
 * Push notifications for game events
 */
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New game event available',
      icon: '/web/src/assets/images/icon-192x192.png',
      badge: '/web/src/assets/images/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1
      },
      actions: [
        {
          action: 'explore',
          title: 'View Game',
          icon: '/web/src/assets/images/checkmark.png'
        },
        {
          action: 'close',
          title: 'Dismiss',
          icon: '/web/src/assets/images/xmark.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Battletech Command', options)
    );
  }
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.matchAll()
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url === '/web/' && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/web/');
          }
        })
    );
  }
});

/**
 * Message handling from main thread
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'CACHE_AUDIO':
        cacheAudioAsset(event.data.url);
        break;
      case 'CLEAR_CACHE':
        clearAllCaches();
        break;
      case 'GET_CACHE_STATUS':
        getCacheStatus().then(status => {
          event.ports[0].postMessage(status);
        });
        break;
    }
  }
});

/**
 * Helper Functions
 */

/**
 * Check if asset is critical for initial load
 */
function isCriticalAsset(url) {
  const criticalPaths = [
    '/web/index.html',
    '/web/styles.css',
    '/web/game_professional.js',
    '/web/src/systems/js/GameEngine.js',
    '/web/src/systems/js/AudioManager.js'
  ];
  
  return criticalPaths.some(path => url.includes(path));
}

/**
 * Update cache in background without affecting current response
 */
function updateCacheInBackground(request) {
  fetch(request)
    .then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(request, response.clone());
          });
      }
    })
    .catch((error) => {
      console.log('[SW] Background cache update failed:', error);
    });
}

/**
 * Handle background sync for game saves
 */
async function handleBackgroundSync() {
  try {
    // Get pending saves from IndexedDB
    const saves = await getPendingSaves();
    
    for (const save of saves) {
      try {
        // Attempt to sync save to server
        await syncSaveToServer(save);
        
        // Mark as synced
        await markSaveAsSynced(save.id);
        
      } catch (error) {
        console.error('[SW] Failed to sync save:', error);
        // Save will remain pending for next sync attempt
      }
    }
    
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

/**
 * Cache audio asset
 */
function cacheAudioAsset(url) {
  caches.open(CACHE_NAME)
    .then((cache) => {
      return fetch(url)
        .then((response) => {
          if (response.status === 200) {
            cache.put(url, response);
            console.log('[SW] Audio asset cached:', url);
          }
        });
    })
    .catch((error) => {
      console.error('[SW] Failed to cache audio asset:', error);
    });
}

/**
 * Clear all caches
 */
function clearAllCaches() {
  caches.keys()
    .then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    })
    .then(() => {
      console.log('[SW] All caches cleared');
      // Notify main thread
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'CACHE_CLEARED' });
        });
      });
    });
}

/**
 * Get cache status information
 */
async function getCacheStatus() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  const storage = await navigator.storage.estimate();
  
  return {
    cacheSize: keys.length,
    storageUsed: storage.usage,
    storageQuota: storage.quota,
    cachePercentage: storage.quota > 0 ? (storage.usage / storage.quota) * 100 : 0
  };
}

/**
 * IndexedDB helpers for background sync
 */
async function getPendingSaves() {
  // This would connect to IndexedDB to get pending saves
  // For now, return empty array as placeholder
  return [];
}

async function syncSaveToServer(save) {
  // This would sync the save to a remote server
  // For now, just simulate success
  return Promise.resolve();
}

async function markSaveAsSynced(saveId) {
  // This would mark the save as synced in IndexedDB
  // For now, just simulate success
  return Promise.resolve();
}

/**
 * Periodic cleanup task
 */
setInterval(() => {
  // Clean up old cached resources periodically
  caches.open(CACHE_NAME)
    .then((cache) => {
      return cache.keys();
    })
    .then((keys) => {
      // Could implement cache size limits or TTL here
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      keys.forEach((request) => {
        // Check if cached response is too old (would need timestamp storage)
        // For now, just log cache size
        if (keys.length > 100) {
          console.log('[SW] Cache is getting large, consider cleanup');
        }
      });
    });
}, 60000); // Check every minute

console.log('[SW] Service Worker registered and ready');