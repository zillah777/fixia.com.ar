import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // AGGRESSIVE cache busting: timestamp + random string + hash
        entryFileNames: `assets/[name]-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.[hash].js`,
        chunkFileNames: `assets/[name]-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.[hash].js`,
        assetFileNames: `assets/[name]-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.[hash].[ext]`,
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
    // Ensure proper asset handling for SPA routing
    assetsDir: 'assets',
    emptyOutDir: true,
    // Force rebuild even if files haven't changed
    minify: 'terser',
    cssCodeSplit: true,
  },
  server: {
    port: 3000,
    host: true,
    // Enable SPA fallback for development
    historyApiFallback: true,
  },
  preview: {
    port: 4173,
    host: true,
    // Enable SPA fallback for preview
    historyApiFallback: true,
  },
});