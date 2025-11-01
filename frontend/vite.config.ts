import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 6180,
    host: true, // Listen on all addresses (required for WSL)
    watch: {
      usePolling: true, // Enable polling for WSL2 file system watching
      interval: 100, // Check for changes every 100ms
    },
    hmr: {
      overlay: true, // Show errors as overlay
    },
    // Allow domain access
    allowedHosts: [
      'localhost',
      'app.hackathon-haufe-teo.com'
    ],
    proxy: {
      '/api': {
        target: 'http://backend:9000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
