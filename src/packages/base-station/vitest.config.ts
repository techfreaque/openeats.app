import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/"],
    },
    setupFiles: ["./src/tests/setup.ts"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
