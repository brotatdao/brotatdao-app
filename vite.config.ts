import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

export default defineConfig({
  plugins: [
    react(),
    NodeGlobalsPolyfillPlugin({
      buffer: true,
    }),
    NodeModulesPolyfillPlugin(),
  ],
  base: "./",
  resolve: {
    alias: {
      // Aliasing for browser-compatible versions
      'stream': 'stream-browserify',
      'buffer': 'buffer',
      'util': 'util',
    },
  },
  define: {
    'process.env': {},
    'process.browser': true,
    'global.Buffer': 'Buffer.from',
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
  optimizeDeps: {
    include: ['buffer']
  },
})
