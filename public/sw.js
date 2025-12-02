const CACHE_NAME = 'aviva-cache-v1';
const APP_VERSION = '1.0.0';

// URLs para cache
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/logo.jpeg',
  '/admin.html',
  '/meditacao.html',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando versão:', APP_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Todos os recursos foram cacheados');
        return self.skipWaiting();
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Ativado versão:', APP_VERSION);
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  // Ignorar requisições não-GET e para APIs
  if (event.request.method !== 'GET' || 
      event.request.url.includes('/api/') ||
      event.request.url.includes('/uploads/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se encontrado
        if (response) {
          return response;
        }
        
        // Clona a requisição para usar novamente
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Verifica se é uma resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clona a resposta para usar no cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(error => {
          console.error('[Service Worker] Erro ao buscar:', error);
          
          // Para páginas, retornar offline.html se disponível
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          
          return null;
        });
      })
  );
});

// Mensagens do Service Worker
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Sincronização em background
self.addEventListener('sync', event => {
  if (event.tag === 'sync-inscricoes') {
    console.log('[Service Worker] Sincronizando inscrições');
    // Aqui você pode implementar a sincronização de dados offline
  }
});

// Notificações push
self.addEventListener('push', event => {
  console.log('[Service Worker] Notificação push recebida.');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova mensagem da AVIVA',
    icon: '/logo.jpeg',
    badge: '/logo.jpeg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/logo.jpeg'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/logo.jpeg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('AVIVA App', options)
  );
});

self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notificação clicada.');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Abrir o app quando clicar na notificação
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});