import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // o vue() / svelte()

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.0.32:8081',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})