import { defineConfig } from 'vite';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true
  }
});
