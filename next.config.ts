import { withExpo } from "@expo/next-adapter";
import type { NextConfig } from "next";
import { generateEndpoints } from "next-vibe/scripts/generate-endpoints";
import type { Compiler, Configuration } from "webpack";

const useNextQueryPortalPackage = false;

const nextConfig: NextConfig = withExpo({
  webpack: (config: Configuration, { dev, isServer }) => {
    if (!isServer) {
      config.module = config.module ?? {};
      config.module.rules = config.module.rules ?? [];
      config.module.rules.push({
        test: /\.native\.tsx$/,
        use: "ignore-loader",
      });
    }

    // Set up path aliases for the next-vibe package
    config.resolve = config.resolve ?? {};
    if (!config.resolve.alias || Array.isArray(config.resolve.alias)) {
      config.resolve.alias = {};
    }
    config.resolve.alias["react-native"] = "react-native-web";

    if (!useNextQueryPortalPackage) {
      config.resolve.alias["next-vibe"] = "./src/packages/next-vibe";
    }

    // Add a plugin to generate endpoints during development
    if (dev) {
      config.plugins = config.plugins ?? [];
      config.plugins.push({
        apply: (compiler: Compiler) => {
          compiler.hooks.done.tap("GenerateApiEndpoints", () => {
            generateEndpoints(__dirname);
          });
        },
      });
    }

    return config;
  },
  experimental: {
    // disabling turbo as typed routes are not working with it
    // turbo: {},
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    typedRoutes: true,
  },
  // TODO remove
  eslint: {
    dirs: ["fg"],
    ignoreDuringBuilds: true,
  },
} as NextConfig);

export default nextConfig;
