import { defineConfig } from 'vite'
import type { ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

/** Potree 2.x lee octree.bin / hierarchy.bin por rangos (HTTP Range). */
function potreeRangeHeaders() {
  return {
    name: 'potree-range-headers',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? ''
        if (/\.(bin|json)(\?|$)/i.test(url) && url.includes('/data/pointclouds/')) {
          res.setHeader('Accept-Ranges', 'bytes')
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), potreeRangeHeaders()],
  build: {
    // MapLibre + Turf + Firebase en un solo chunk; sin code-splitting suele pasar ~1.6 MB.
    chunkSizeWarningLimit: 2048,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
