import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { ordersApi } from "./server/ordersApi";

const localApi: Plugin = {
  name: "platterbook-local-api",
  configureServer(server) {
    server.middlewares.use(ordersApi);
  },
};

export default defineConfig({
  plugins: [react(), localApi],
  server: { port: 5173, strictPort: false },
});
