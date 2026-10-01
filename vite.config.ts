import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
    server: {
      proxy: {
        "/api": env.API_PROXY_TARGET || "http://localhost:8000",
        "/mail": env.MAIL_PROXY_TARGET || "http://localhost:8080",
        "/auth": env.MAIL_PROXY_TARGET || "http://localhost:8080",
      },
    },
  };
});
