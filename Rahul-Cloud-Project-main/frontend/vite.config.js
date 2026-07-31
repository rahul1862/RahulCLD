import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    allowedHosts: ["rahul-cloud-project-1.onrender.com"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/main.jsx", "src/setupTests.js", "src/**/*.test.{js,jsx}", "src/tests/**"],
      thresholds: {
        "src/services/**/*.js": {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
        "src/utils/**/*.js": {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
        "src/context/AuthContext.jsx": {
          lines: 80,
          functions: 70,
          branches: 70,
          statements: 80,
        },
      },
    },
  },
});
