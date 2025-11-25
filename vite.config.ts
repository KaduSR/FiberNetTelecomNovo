import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api-proxy': {
        // ⚠️ ATENÇÃO: Usando http conforme seu teste bem-sucedido
        target: 'http://api.centralfiber.online', 
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-proxy/, '')
      }
    }
  }
})