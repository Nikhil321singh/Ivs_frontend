import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// base: './' keeps asset URLs relative so the build works inside Capacitor's WebView.
// cacheDir/root/dedupe are pinned to THIS project because a stray node_modules exists
// in the parent (Desktop) folder — without pinning, Vite optimized deps into the parent
// and pulled a duplicate React, breaking the JSX runtime.
export default defineConfig({
  base: './',
  root: fileURLToPath(new URL('.', import.meta.url)),
  cacheDir: fileURLToPath(new URL('./node_modules/.vite', import.meta.url)),
  plugins: [react({ jsxRuntime: 'automatic' })],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: true,
    port: 5713, // must match backend CORS CLIENT_URL (Ivs_backend .env)
    strictPort: true,
    fs: { strict: true },
  },
})
