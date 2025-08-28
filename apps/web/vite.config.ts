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
        // Force new filenames with timestamp to bust Vercel cache
        entryFileNames: `assets/[name]-${Date.now()}.[hash].js`,
        chunkFileNames: `assets/[name]-${Date.now()}.[hash].js`,
        assetFileNames: `assets/[name]-${Date.now()}.[hash].[ext]`,
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