// ===== RSC CHAIN - SERVICE WORKER =====

const CACHE_NAME = 'rsc-chain-v1.0.0';
const STATIC_CACHE_NAME = 'rsc-chain-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'rsc-chain-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles/app.css',
  '/styles/advanced-components.css',
  '/styles/mobile-navbar.css',
  '/scripts/main.js',
  '/scripts/component-system.js',
  '/scripts/blockchain-integration.js',
  '/scripts/social-ecosystem.js',
  '/scripts/defi-protocols.js',
  '/scripts/ai-assistant.js',
  '/scripts/nft-marketplace.js',
  '/scripts/mobile-navbar.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - serve cached content and implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(request.url)) {
    // Static assets - Cache First strategy
    event.respondWith(cacheFirst(request));
  } else if (isAPIRequest(request.url)) {
    // API requests - Network First strategy
    event.respondWith(networkFirst(request));
  } else if (isImageRequest(request.url)) {
    // Images - Cache First with fallback
    event.respondWith(cacheFirstWithFallback(request));
  } else {
    // Everything else - Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Cache First strategy - for static assets
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE_NAME);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.error('Cache First failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

// Network First strategy - for API requests
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({ 
      error: 'Offline - no cached data available',
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache First with Fallback - for images
async function cacheFirstWithFallback(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return fallback image for failed image requests
    return new Response(
      '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="200" fill="#1a1a1a"/><text x="150" y="100" text-anchor="middle" fill="#00ff88" font-family="Arial" font-size="16">RSC Chain</text><text x="150" y="120" text-anchor="middle" fill="#666" font-family="Arial" font-size="12">Image offline</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

// Stale While Revalidate - for other requests
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch fresh content in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached version if available
    return cachedResponse;
  });
  
  // Return cached content immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Helper functions
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.includes(asset)) ||
         url.includes('.css') ||
         url.includes('.js') ||
         url.includes('.woff') ||
         url.includes('.woff2') ||
         url.includes('fonts.googleapis.com') ||
         url.includes('cdnjs.cloudflare.com');
}

function isAPIRequest(url) {
  return url.includes('/api/') ||
         url.includes('supabase.co') ||
         url.includes('blockchain.info') ||
         url.includes('etherscan.io');
}

function isImageRequest(url) {
  return url.includes('.jpg') ||
         url.includes('.jpeg') ||
         url.includes('.png') ||
         url.includes('.gif') ||
         url.includes('.webp') ||
         url.includes('.svg') ||
         url.includes('placeholder.com') ||
         url.includes('images') ||
         url.includes('avatar');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'blockchain-sync') {
    event.waitUntil(syncBlockchainData());
  } else if (event.tag === 'social-sync') {
    event.waitUntil(syncSocialData());
  } else if (event.tag === 'defi-sync') {
    event.waitUntil(syncDeFiData());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New update from RSC Chain',
    icon: 'https://via.placeholder.com/192x192/00ff88/000000?text=RSC',
    badge: 'https://via.placeholder.com/72x72/00ff88/000000?text=RSC',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: 'https://via.placeholder.com/32x32/00ff88/000000?text=📱'
      },
      {
        action: 'close',
        title: 'Close',
        icon: 'https://via.placeholder.com/32x32/00ff88/000000?text=❌'
      }
    ],
    requireInteraction: true,
    tag: 'rsc-chain-notification'
  };
  
  event.waitUntil(
    self.registration.showNotification('RSC Chain Update', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// Sync functions
async function syncBlockchainData() {
  try {
    console.log('🔗 Syncing blockchain data...');
    
    // Get pending blockchain transactions from IndexedDB
    const pendingTxs = await getPendingTransactions();
    
    for (const tx of pendingTxs) {
      try {
        const response = await fetch('/api/blockchain/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tx)
        });
        
        if (response.ok) {
          await removePendingTransaction(tx.id);
          console.log('✅ Transaction synced:', tx.id);
        }
      } catch (error) {
        console.error('❌ Failed to sync transaction:', tx.id, error);
      }
    }
  } catch (error) {
    console.error('❌ Blockchain sync failed:', error);
  }
}

async function syncSocialData() {
  try {
    console.log('👥 Syncing social data...');
    
    // Get pending social posts from IndexedDB
    const pendingPosts = await getPendingSocialPosts();
    
    for (const post of pendingPosts) {
      try {
        const response = await fetch('/api/social/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(post)
        });
        
        if (response.ok) {
          await removePendingSocialPost(post.id);
          console.log('✅ Social post synced:', post.id);
        }
      } catch (error) {
        console.error('❌ Failed to sync social post:', post.id, error);
      }
    }
  } catch (error) {
    console.error('❌ Social sync failed:', error);
  }
}

async function syncDeFiData() {
  try {
    console.log('🌾 Syncing DeFi data...');
    
    // Get pending DeFi actions from IndexedDB
    const pendingActions = await getPendingDeFiActions();
    
    for (const action of pendingActions) {
      try {
        const response = await fetch('/api/defi/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action)
        });
        
        if (response.ok) {
          await removePendingDeFiAction(action.id);
          console.log('✅ DeFi action synced:', action.id);
        }
      } catch (error) {
        console.error('❌ Failed to sync DeFi action:', action.id, error);
      }
    }
  } catch (error) {
    console.error('❌ DeFi sync failed:', error);
  }
}

// IndexedDB helper functions (simplified)
async function getPendingTransactions() {
  // Implementation would use IndexedDB to get pending transactions
  return [];
}

async function removePendingTransaction(id) {
  // Implementation would remove transaction from IndexedDB
}

async function getPendingSocialPosts() {
  // Implementation would use IndexedDB to get pending social posts
  return [];
}

async function removePendingSocialPost(id) {
  // Implementation would remove social post from IndexedDB
}

async function getPendingDeFiActions() {
  // Implementation would use IndexedDB to get pending DeFi actions
  return [];
}

async function removePendingDeFiAction(id) {
  // Implementation would remove DeFi action from IndexedDB
}

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'GET_CACHE_INFO') {
    getCacheInfo().then(info => {
      event.ports[0].postMessage(info);
    });
  }
});

async function getCacheInfo() {
  const cacheNames = await caches.keys();
  const cacheInfo = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    cacheInfo[cacheName] = {
      size: keys.length,
      urls: keys.map(req => req.url)
    };
  }
  
  return cacheInfo;
}

console.log('🚀 RSC Chain Service Worker loaded successfully!');
