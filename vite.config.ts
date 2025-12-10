import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable tree-shaking and minification
    // Using terser for better compression
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production", // Remove console.log in production
        drop_debugger: true,
      },
    },
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor chunks for better caching
          if (id.includes("node_modules")) {
            // Keep React and React DOM in main chunk for Chrome extensions compatibility
            // This prevents "Cannot read properties of undefined (reading 'createContext')" errors
            if (id.includes("react") || id.includes("react-dom")) {
              // Don't split React - keep it in main bundle for extension compatibility
              return;
            }
            // Fabric.js is large, put it in its own chunk
            if (id.includes("fabric")) {
              return "fabric";
            }
            // Radix UI components together
            if (id.includes("@radix-ui")) {
              return "radix-ui";
            }
            // Other large libraries
            if (id.includes("lucide-react")) {
              return "icons";
            }
            // Everything else goes to vendor
            return "vendor";
          }
        },
        // Optimize chunk size warnings
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    // Increase chunk size warning limit (fabric.js is large)
    chunkSizeWarningLimit: 1000,
    // Enable source maps only in development
    sourcemap: mode === "development",
  },
}));
