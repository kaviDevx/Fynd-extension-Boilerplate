import { defineConfig } from "vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

const proxyOptions = {
  target: `http://127.0.0.1:${process.env.BACKEND_PORT || 8080}`,
  changeOrigin: false,
  secure: true,
  ws: false,
};

const host = process.env.HOST
  ? process.env.HOST.replace(/https?:\/\//, "")
  : "localhost";

const hmrConfig =
  host === "localhost"
    ? { protocol: "ws", host: "localhost", port: 64999, clientPort: 64999 }
    : {
        protocol: "wss",
        host,
        port: process.env.FRONTEND_PORT,
        clientPort: 443,
      };

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
  },
  build: {
    // Vite builds to frontend/public/dist — Express serves this directory
    outDir: "public/dist",
  },
  server: {
    host: "localhost",
    port: process.env.FRONTEND_PORT || 5173,
    allowedHosts: true,
    hmr: hmrConfig,
    proxy: {
      // Proxy auth/session routes to backend during development
      "^/(\\?.*)?$": proxyOptions,
      "^/api(/|(\\?.*)?$)": proxyOptions,
      "^/fp(/|(\\?.*)?$)": proxyOptions,
      "^/adm(/|(\\?.*)?$)": proxyOptions,
      "^/env.js$": proxyOptions,
    },
  },
});
