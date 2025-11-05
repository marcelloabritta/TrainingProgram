import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({ 
      registerType: 'autoUpdate', 
      

      manifest: {
        name: 'Training Program',
        short_name: 'TrainingApp', 
        description: 'A web app for managing training programs.',
        theme_color: '#1f2937', 
        background_color: '#1f2937',
        

        icons: [
          {
            src: 'pwa-192x192.png', 
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', 
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })],
  appType: 'spa'
})
