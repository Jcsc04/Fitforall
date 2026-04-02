import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 3000,
    target: ['es2019', 'safari13'],  // Ensures Safari 13+ (iPad iOS 13+) compatibility
  }
})
