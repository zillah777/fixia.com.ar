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
    chunkSizeWarningLimit: 1000,
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
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    assetsDir: 'assets',
    emptyOutDir: true,
    minify: 'esbuild',
    cssCodeSplit: true,
  },
  server: {
    port: 3000,
    host: true,
    // Enable SPA fallback for development
    historyApiFallback: true,
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://sdk.mercadopago.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://res.cloudinary.com https://fonts.googleapis.com https://fonts.gstatic.com http://localhost:* http://127.0.0.1:*; connect-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:* https://api.fixia.app https://fixia-api.onrender.com wss://fixia-api.onrender.com https://res.cloudinary.com https://api.cloudinary.com https://fonts.googleapis.com https://fonts.gstatic.com https://api.mercadopago.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' http://localhost:* https://api.fixia.app https://fixia-api.onrender.com https://api.mercadopago.com",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  preview: {
    port: 4173,
    host: true,
    // Enable SPA fallback for preview
    historyApiFallback: true,
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://sdk.mercadopago.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://res.cloudinary.com https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self' https://api.fixia.app https://fixia-api.onrender.com wss://fixia-api.onrender.com https://res.cloudinary.com https://api.cloudinary.com https://fonts.googleapis.com https://fonts.gstatic.com https://api.mercadopago.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' https://api.fixia.app https://fixia-api.onrender.com https://api.mercadopago.com; upgrade-insecure-requests",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
});