import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Dev API
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  },
  // 👇 This helps during dev but isn't used in production. Vercel uses vercel.json instead.
  preview: {
    port: 4173,
  }
});

