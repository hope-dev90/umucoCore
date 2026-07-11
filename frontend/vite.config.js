import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
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
})
