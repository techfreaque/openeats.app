// vitest.config.ts
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Create an alias for server-only for testing purposes
      "server-only": path.resolve(
        __dirname,
        "src/packages/next-vibe/server/utils/server-only.ts",
      ),
    },
  },
  test: {
    environment: "node",
    globals: true,
    // setupFiles: ["./src/tests/setup.ts"],
    globalSetup: "./src/packages/next-vibe/testing/test-server/global-setup.ts",
    include: ["./**/*.test.ts"],
    isolate: false, // Important - keep test files in the same process
    sequence: {
      hooks: "list", // Run hooks in sequence
      setupFiles: "list", // Run setup files in sequence
    },
    testTimeout: 30000,
    // Run tests sequentially to avoid server port conflicts
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    mockReset: true,
  },
});
