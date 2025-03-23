import type { NextConfig } from "next";
import { resolve } from "path";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {
  webpack: (config: Configuration) => {
    config.resolve = config.resolve || {};
    if (!config.resolve.alias || Array.isArray(config.resolve.alias)) {
      config.resolve.alias = {};
    }
    config.resolve.alias["next-query-portal/client"] = resolve(
      __dirname,
      "src/package/client",
    );
    config.resolve.alias["next-query-portal/server"] = resolve(
      __dirname,
      "src/package/server",
    );
    config.resolve.alias["next-query-portal/shared"] = resolve(
      __dirname,
      "src/package/shared",
    );
    return config;
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    typedRoutes: true,
  },
};

export default nextConfig;
