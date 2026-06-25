import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readFileSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 8080,
    strictPort: false,
    historyApiFallback: true,
    // 🔌 Proxy all /api/* calls to Express backend — eliminates CORS in dev
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        router: () => {
          try {
            const portPath = path.resolve(__dirname, '../.backend-port');
            const portStr = readFileSync(portPath, 'utf8').trim();
            if (portStr && !isNaN(Number(portStr))) {
              return `http://localhost:${portStr}`;
            }
          } catch (e) {
            // ignore and fallback
          }
          return 'http://localhost:5000';
        },
        changeOrigin: true,
        secure: false,
      },
    },
  },
  envPrefix: "VITE_",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        // Split large chunks to eliminate chunk size warnings
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});