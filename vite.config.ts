import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['KronoBookLogo_192px.png', 'KronoBookLogo_512px.png'],
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      manifest: {
        name: 'KronoBook Admin',
        short_name: 'KronoBook',
        description: 'Plataforma administrativa para negocios',
        theme_color: '#0b0c0e',
        background_color: '#0b0c0e',
        display: 'standalone',
        icons: [
          {
            src: '/KronoBookLogo_192px.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/KronoBookLogo_512px.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
