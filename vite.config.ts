// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { Buffer } from 'buffer'
import { createRequire } from 'module'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const require = createRequire(import.meta.url)

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  base: "./",
  resolve: {
    alias: {
      'stream': 'stream-browserify',
      'buffer': 'buffer/',
      'util': 'util',
    },
  },
  define: {
    'process.env': {},
    'process.browser': true,
    'Buffer': Buffer,
  },
  build: {
    rollupOptions: {
      external: ['buffer', 'util', 'stream'],
    },
  },
  server: {
    proxy: {
      '/api/public_v1': {
        target: 'https://namestone.xyz',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
})
