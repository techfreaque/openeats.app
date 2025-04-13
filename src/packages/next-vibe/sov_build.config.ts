import type { BuildConfig } from "sovendus-builder";

const buildConfig: BuildConfig = {
  foldersToClean: ["dist"],
  filesToCompile: [
    // Main entry point
    {
      input: "src/index.ts",
      output: "dist/index",
      options: {
        type: "react",
        packageConfig: {
          dtsEntryRoot: "src",
          dtsInclude: ["src/**/*"],
          isPackage: true,
        },
        modulesToExternalize: [
          "react",
          "react-dom",
          "zustand",
          "@tanstack/react-query",
          "next",
          "socket.io-client",
          "socket.io",
        ],
      },
    },
    // Shared utilities
    {
      input: "src/shared/index.ts",
      output: "dist/shared/index",
      options: {
        type: "react",
        packageConfig: {
          dtsEntryRoot: "src/shared",
          dtsInclude: ["src/shared/**/*"],
          isPackage: true,
        },
        modulesToExternalize: ["react", "react-dom", "zustand"],
      },
    },
    // Client utilities
    {
      input: "src/client/index.ts",
      output: "dist/client/index",
      options: {
        type: "react",
        packageConfig: {
          dtsEntryRoot: "src/client",
          dtsInclude: ["src/client/**/*"],
          isPackage: true,
        },
        modulesToExternalize: [
          "react",
          "react-dom",
          "zustand",
          "@tanstack/react-query",
          "next",
          "socket.io-client",
        ],
      },
    },
    // Server utilities
    {
      input: "src/server/index.ts",
      output: "dist/server/index",
      options: {
        type: "node",
        packageConfig: {
          dtsEntryRoot: "src/server",
          dtsInclude: ["src/server/**/*"],
          isPackage: true,
        },
        modulesToExternalize: [
          "@prisma/client",
          "next",
          "socket.io",
          "server-only",
        ],
      },
    },
    // Testing utilities
    {
      input: "src/testing/index.ts",
      output: "dist/testing/index",
      options: {
        type: "node",
        packageConfig: {
          dtsEntryRoot: "src/testing",
          dtsInclude: ["src/testing/**/*"],
          isPackage: true,
        },
        modulesToExternalize: ["vitest", "supertest", "@prisma/client", "next"],
      },
    },
  ],
};

export default buildConfig;
