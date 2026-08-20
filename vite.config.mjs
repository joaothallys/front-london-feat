import { defineConfig, loadEnv } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(rootDir, "..");

function normalizeApiOrigin(raw, fallback) {
  const value = String(raw || "").trim().replace(/\/$/, "");
  if (!value) return fallback;
  if (/^https?:\/\//i.test(value)) return value;
  return "https://" + value;
}

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, repoRoot, ""), ...loadEnv(mode, rootDir, "") };
  const apiPort = Number(env.PORT) || 3000;
  const webPort = Number(env.WEB_PORT) || 4173;
  const api = normalizeApiOrigin(env.VITE_API_URL || env.API_URL, "http://127.0.0.1:" + apiPort);
  const proxy = {
    "/api": { target: api, changeOrigin: true, secure: api.startsWith("https://") }
  };

  if (apiPort === webPort) {
    throw new Error("PORT e WEB_PORT não podem ser iguais. API usa PORT, Vite usa WEB_PORT.");
  }

  return {
    envDir: rootDir,
    publicDir: "public",
    resolve: {
      alias: {
        "@shared": path.resolve(rootDir, "src/shared"),
        "@web": path.resolve(rootDir, "src/web")
      }
    },
    server: {
      host: "127.0.0.1",
      port: webPort,
      strictPort: true,
      proxy
    },
    preview: {
      host: "127.0.0.1",
      port: webPort,
      strictPort: true,
      proxy
    }
  };
});
