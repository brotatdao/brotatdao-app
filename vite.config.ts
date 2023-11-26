import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { Buffer } from 'buffer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    alias: {
      // Provide correct module for 'stream' when required by dependencies
      'stream': require.resolve('stream-browserify'),
    },
  },
  define: {
    // Provide global variables to all the scripts so that they're usable without import
    'process.env': {},
    'process.browser': true,
    'Buffer': Buffer,
  },
  build: {
    rollupOptions: {
      external: ['buffer', 'util', 'stream'],
    },
  },
})
