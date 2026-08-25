import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Build output is consumed by the WordPress plugin from assets/dist.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: '.',
  // Relative base so hashed assets (e.g. the Vazir Matn woff2) resolve from
  // the plugin's own directory instead of the WordPress site root.
  base: './',
  build: {
    outDir: 'assets/dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: 'index.html',
    },
  },
  server: {
    port: 5173,
  },
});
