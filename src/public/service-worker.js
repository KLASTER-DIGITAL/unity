const CACHE_NAME = 'achievement-diary-v1';
const urlsToCache = [
  '/',
  '/App.tsx',
  '/styles/globals.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
  // Не вызываем skipWaiting автоматически, ждем сообщения от клиента
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);

  let notificationData = {
    title: 'Дневник Достижений',
    body: 'Время записать новое достижение!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {}
  };

  // Парсим данные из push события
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        data: payload.data || {}
      };
    } catch (error) {
      console.error('[Service Worker] Failed to parse push data:', error);
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [200, 100, 200],
    data: {
      ...notificationData.data,
      dateOfArrival: Date.now(),
      url: notificationData.data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Открыть'
      },
      {
        action: 'close',
        title: 'Закрыть'
      }
    ],
    requireInteraction: false,
    tag: 'achievement-diary-notification'
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
      .then(() => {
        console.log('[Service Worker] Notification shown');
        // Отправляем событие о доставке уведомления
        return self.clients.matchAll({ type: 'window' });
      })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'PUSH_DELIVERED',
            data: notificationData
          });
        });
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to show notification:', error);
      })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Проверяем есть ли уже открытое окно
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Если нет, открываем новое окно
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
      .then(() => {
        // Отправляем событие о клике на уведомление
        return self.clients.matchAll({ type: 'window' });
      })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'PUSH_CLICKED',
            data: event.notification.data
          });
        });
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to handle notification click:', error);
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event);

  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'PUSH_CLOSED',
            data: event.notification.data
          });
        });
      })
  );
});

// ==========================================
// BACKGROUND SYNC
// ==========================================

/**
 * Background Sync event handler
 * Syncs pending entries when connection is restored
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event triggered:', event.tag);

  if (event.tag === 'sync-entries') {
    event.waitUntil(syncPendingEntries());
  }
});

/**
 * Sync pending entries from IndexedDB
 */
async function syncPendingEntries() {
  console.log('[SW] Starting sync of pending entries...');

  try {
    // Open IndexedDB
    const db = await openDB();
    const transaction = db.transaction(['pending_entries'], 'readonly');
    const store = transaction.objectStore('pending_entries');
    const pendingEntries = await getAllFromStore(store);

    console.log(`[SW] Found ${pendingEntries.length} pending entries`);

    let synced = 0;
    let failed = 0;

    for (const entry of pendingEntries) {
      // Skip if already syncing or exceeded retry limit
      if (entry.syncStatus === 'syncing' || entry.retryCount >= 3) {
        continue;
      }

      try {
        // Mark as syncing
        await updateEntryStatus(db, entry.id, 'syncing');

        // Sync entry to server
        const response = await fetch('/api/entries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: entry.userId,
            text: entry.text,
            sentiment: entry.sentiment,
            category: entry.category,
            mood: entry.mood,
            media: entry.media,
            tags: entry.tags,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const savedEntry = await response.json();
        console.log(`[SW] Entry ${entry.id} synced successfully`);

        // Delete from pending entries
        await deleteEntry(db, entry.id);
        synced++;

        // Notify clients
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({
            type: 'ENTRY_SYNCED',
            entryId: entry.id,
            savedEntry,
          });
        });
      } catch (error) {
        console.error(`[SW] Failed to sync entry ${entry.id}:`, error);

        // Update retry count
        await updateEntryRetry(db, entry.id, error.message);
        failed++;

        // Notify clients
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({
            type: 'ENTRY_SYNC_FAILED',
            entryId: entry.id,
            error: error.message,
          });
        });
      }
    }

    console.log(`[SW] Sync complete: ${synced} synced, ${failed} failed`);

    // Notify clients about completion
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETE',
        synced,
        failed,
      });
    });
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
    throw error;
  }
}

/**
 * Open IndexedDB
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('unity-diary-offline', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all items from store
 */
function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update entry sync status
 */
async function updateEntryStatus(db, entryId, status) {
  const transaction = db.transaction(['pending_entries'], 'readwrite');
  const store = transaction.objectStore('pending_entries');
  const entry = await new Promise((resolve, reject) => {
    const request = store.get(entryId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  if (entry) {
    entry.syncStatus = status;
    await new Promise((resolve, reject) => {
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * Update entry retry count
 */
async function updateEntryRetry(db, entryId, errorMessage) {
  const transaction = db.transaction(['pending_entries'], 'readwrite');
  const store = transaction.objectStore('pending_entries');
  const entry = await new Promise((resolve, reject) => {
    const request = store.get(entryId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  if (entry) {
    entry.syncStatus = 'failed';
    entry.retryCount = (entry.retryCount || 0) + 1;
    entry.lastError = errorMessage;
    await new Promise((resolve, reject) => {
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * Delete entry from IndexedDB
 */
async function deleteEntry(db, entryId) {
  const transaction = db.transaction(['pending_entries'], 'readwrite');
  const store = transaction.objectStore('pending_entries');
  await new Promise((resolve, reject) => {
    const request = store.delete(entryId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
