import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Enable @ imports
    },
  },
  server: {
    port: 3000, // Development server port
    open: true, // Open browser on start
    host: true, // Listen on all network interfaces
  },
  build: {
    outDir: "dist", // Output directory
    sourcemap: true, // Generate sourcemaps for debugging
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          vendor: [
            "react",
            "react-dom",
            "@chakra-ui/react",
            "framer-motion",
            "zustand",
          ],
          game: [
            "./src/stores/gameStore.js",
            "./src/stores/mapStore.js",
            "./src/stores/resourcesStore.js",
          ],
        },
      },
    },
  },
});
