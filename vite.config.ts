import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { Buffer } from 'buffer'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import { nodePolyfills } from 'vite-plugin-node-polyfills'


// Determine if we are in a development environment
const isDevelopment = process.env.NODE_ENV !== 'production';

export default defineConfig({
  plugins: [
    react(),
    // Conditionally apply polyfills based on the environment
    ...(isDevelopment ? [nodePolyfills()] : [
      NodeGlobalsPolyfillPlugin({
        buffer: true,
      }),
      NodeModulesPolyfillPlugin(),
    ]),
  ],
  base: "./",
  resolve: {
    alias: {
      'stream': 'stream-browserify',
      'buffer': 'buffer',
      'util': 'util',
    },
  },
  define: {
    'process.env': {},
    'process.browser': true,
    'global.Buffer': isDevelopment ? Buffer : 'Buffer.from',
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
  build: {
    rollupOptions: {
      external: isDevelopment ? [] : ['buffer', 'util', 'stream'],
    },
  },
})
