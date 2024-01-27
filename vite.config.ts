import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  console.log(`Running in mode: ${mode}`);
  console.log('NODE_ENV:', process.env.NODE_ENV);

  // Plugins for development
  let plugins = [react(), nodePolyfills()];

  // Plugins for production
  if (mode === 'production') {
    plugins = [
      react(),
      NodeGlobalsPolyfillPlugin({ buffer: true }),
      NodeModulesPolyfillPlugin(),
    ];
  }

  return {
    plugins: plugins,
    base: './',
    resolve: {
      alias: {
        stream: 'stream-browserify',
        buffer: 'buffer',
        util: 'util',
      },
    },
    define: {
      'process.env': {},
      'process.browser': true,
      'global.Buffer': Buffer,
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
      include: ['buffer'],
    },
    build: {
      rollupOptions: {
        external: mode === 'development' ? [] : ['buffer', 'util', 'stream'],
      },
    },
  };
});
