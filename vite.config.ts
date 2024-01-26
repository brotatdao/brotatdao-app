import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

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
    'global.Buffer': 'Buffer.from',
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
 optimizeDeps: {
    include: ['buffer']
 },
})
