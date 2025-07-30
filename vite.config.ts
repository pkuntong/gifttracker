import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: mode === 'production',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core - ensure this is isolated and comes first
          if (id.includes('react/') || id.includes('react-dom/') || 
              (id.includes('react') && !id.includes('@radix-ui') && !id.includes('react-router') && !id.includes('react-i18next'))) {
            return 'react-core';
          }
          
          // Radix UI components
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          
          // Charts
          if (id.includes('recharts')) {
            return 'charts';
          }
          
          // Stripe
          if (id.includes('@stripe')) {
            return 'stripe';
          }
          
          // Internationalization
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n';
          }
          
          // Date utilities
          if (id.includes('date-fns')) {
            return 'date-utils';
          }
          
          // Router
          if (id.includes('react-router')) {
            return 'router';
          }
          
          // Utils and smaller libraries
          if (id.includes('clsx') || id.includes('class-variance-authority') || id.includes('tailwind-merge')) {
            return 'utils';
          }
          
          // Icons
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          
          // Sonner (toast)
          if (id.includes('sonner')) {
            return 'sonner';
          }
          
          // Other vendor libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\\.[^.]+$/, '') || 'chunk'
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  define: {
    __DEV__: mode === 'development'
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
}));
