// vitest.config.advanced.ts
import react from "@vitejs/plugin-react";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "next-vibe": path.resolve(__dirname, "."),
      "test-utils": path.resolve(__dirname, "./__tests__/test-utils"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./__tests__/setup.advanced.ts"],
    include: ["./**/__tests__/**/*.{test,spec}.{ts,tsx}"],
    exclude: [...configDefaults.exclude, "**/node_modules/**", "**/dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        ...configDefaults.coverage.exclude,
        "node_modules/",
        "dist/",
        "**/*.d.ts",
        "**/types.ts",
        "**/*.config.ts",
        "**/__mocks__/**",
        "**/__tests__/setup*.ts",
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
    reporters: ["default", "html"],
    outputFile: {
      html: "./test-results/html/index.html",
    },
    pool: "forks", // Use forks for better isolation
    poolOptions: {
      forks: {
        isolate: true,
      },
    },
    maxConcurrency: 10,
    maxThreads: 3,
    minThreads: 1,
    sequence: {
      hooks: "stack", // Run hooks in sequence
    },
    testTimeout: 10000, // 10 seconds timeout
    hookTimeout: 10000, // 10 seconds timeout for hooks
    teardownTimeout: 5000, // 5 seconds timeout for teardown
    retry: 2, // Retry failed tests up to 2 times
    bail: 5, // Stop after 5 failures
  },
});
