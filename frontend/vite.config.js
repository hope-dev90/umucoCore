import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_BASE = env.VITE_API_BASE || 'https://umucocore.onrender.com'
  
  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['framer-motion', '@react-oauth/google'],
          },
        },
      },
      chunkSizeWarningLimit: 1000, // Increase limit if needed
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
    define: {
      'API': JSON.stringify(API_BASE),
    },
  }
})
