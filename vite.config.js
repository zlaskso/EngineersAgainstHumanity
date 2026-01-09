import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    allowedHosts: true, // Tillåter ngrok (som vi fixade sist)
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3000', // Skicka vidare socket-trafik till servern
        ws: true, // Viktigt för websockets
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})