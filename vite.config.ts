/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 3000,
    open: "http://localhost:3000",
    hmr: {
      port: 3000,
      host: "localhost",
      clientPort: 3000
    },
    cors: true,
    strictPort: true
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: mode === 'production',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined,
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
    include: ['react', 'react-dom'],
    force: true
  }
}));
