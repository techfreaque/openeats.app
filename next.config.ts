import type { NextConfig } from "next";
import type { Configuration } from "webpack";

import nextPortalConfig from "./next.portal.config";
import { generateEndpoints } from "./src/packages/next-query-portal/scripts/generate-endpoints";

const nextConfig: NextConfig = {
  webpack: (config: Configuration, { dev, isServer }) => {
    if (!isServer) {
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      config.module.rules.push({
        test: /\.native\.tsx$/,
        use: "ignore-loader",
      });
    }

    // Set up path aliases for the next-query-portal package
    config.resolve = config.resolve || {};
    if (!config.resolve.alias || Array.isArray(config.resolve.alias)) {
      config.resolve.alias = {};
    }
    config.resolve.alias["react-native"] = "react-native-web";

    if (!nextPortalConfig.useNextQueryPortalPackage) {
      config.resolve.alias["next-query-portal"] =
        "./src/packages/next-query-portal";
    }

    // Add a plugin to generate endpoints during development
    if (dev) {
      config.plugins = config.plugins || [];
      config.plugins.push({
        apply: (compiler) => {
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
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
