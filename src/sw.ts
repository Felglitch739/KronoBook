/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: any
}

import { precacheAndRoute } from 'workbox-precaching'

// Inyecta el manifiesto de archivos para precache generados por Vite
precacheAndRoute(self.__WB_MANIFEST)

// Evento que escucha los mensajes push enviados desde el servidor (Supabase)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json()
    const title = data.title || 'Nueva Notificación de KronoBook'
    const options: NotificationOptions = {
      body: data.body || 'Tienes una nueva actualización en tu negocio.',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: {
        url: data.url || '/'
      }
    }

    event.waitUntil(self.registration.showNotification(title, options))
  } catch (error) {
    // Si no es JSON, mostrar como texto plano
    event.waitUntil(
      self.registration.showNotification('Notificación de KronoBook', {
        body: event.data.text(),
        icon: '/pwa-192x192.png'
      })
    )
  }
})

// Evento cuando el usuario hace clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  // Intenta enfocar una ventana existente o abre una nueva si no hay ninguna
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})
