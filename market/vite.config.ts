import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Empty = same-origin; Market SPA served by the same uvicorn process.
  const apiBaseUrl = env.BASE_URL ?? "";
  // Market standalone server defaults to 8089 (Ydsz Worker itself is 8088).
  const apiPort = process.env.VITE_API_PORT ?? env.VITE_API_PORT ?? "8090";
  const devServerPort = Number(process.env.VITE_DEV_PORT || 5174);

  return {
    build: {
      outDir: path.resolve(__dirname, "../src/ydsz/market"),
      emptyOutDir: true,
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        maxParallelFileOps: 3,
        output: {
          entryFileNames: "assets/index.[hash].js",
          chunkFileNames: "assets/[name].[hash].js",
          assetFileNames: "assets/[name].[hash].[ext]",
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react-dom")) return "vendor-react";
              if (id.includes("react-router")) return "vendor-react";
              if (/\/node_modules\/react\//.test(id)) return "vendor-react";
              if (id.includes("rc-")) return "vendor-antd";
              if (id.includes("/antd/")) return "vendor-antd";
              if (id.includes("antd-style")) return "vendor-antd";
              if (id.includes("@ant-design")) return "vendor-antd";
              if (id.includes("lucide-react")) return "vendor-icons";
              if (id.includes("i18next")) return "vendor-utils";
              if (id.includes("dayjs")) return "vendor-utils";
            }
          },
        },
      },
    },
    define: {
      BASE_URL: JSON.stringify(apiBaseUrl),
    },
    plugins: [react()],
    css: {
      modules: {
        localsConvention: "camelCase",
        generateScopedName: "[name]__[local]__[hash:base64:5]",
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom"],
    },
    server: {
      host: "0.0.0.0",
      port: devServerPort,
      proxy: {
        "/api": {
          target: `http://127.0.0.1:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
  };
});
