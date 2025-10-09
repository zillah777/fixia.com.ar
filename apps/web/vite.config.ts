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
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
    assetsDir: 'assets',
    emptyOutDir: true,
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