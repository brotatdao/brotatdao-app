import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { Buffer } from 'buffer'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig(({ mode }) => {
  console.log(`Running in mode: ${mode}`);
  console.log('NODE_ENV:', process.env.NODE_ENV);

  return {
     plugins: [
       react(),
       // Conditionally apply polyfills based on the environment
       ...(mode === 'development' ? [nodePolyfills()] : [
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
    'global.Buffer': mode === 'development' ? Buffer : 'Buffer.from',
  },
  server: {
    proxy: {
      '/api/public_v1': {
        target: 'https://namestone.xyz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/public_v1/, ''),
      },
    },
  },
  optimizeDeps: {
    include: ['buffer']
  },
  build: {
    rollupOptions: {
      external: mode === 'development' ? [] : ['buffer', 'util', 'stream'],
    },
  },
  }});
