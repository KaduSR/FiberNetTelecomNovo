import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      // Proxy API requests to the backend server during development
      '/api': {
        target: 'http://localhost:3001', // Your backend server port
        changeOrigin: true,
      }
    }
  }
})
