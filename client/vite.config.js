import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { NGROK_HOSTNAME } from './vite.config.constants.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173,
    allowedHosts: [NGROK_HOSTNAME],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
