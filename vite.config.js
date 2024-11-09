import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  optimizeDeps: {
    include: ['some-dependency', 'another-dependency'],
  },
  build: {
    outDir: 'dist',
    minify: true,
    sourcemap: true,
  },
  server: {
    port: 4000,
    open: true,
    hmr: true,
  },
  plugins: [react()],
});
