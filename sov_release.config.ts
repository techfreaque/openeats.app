import type { ReleaseConfig } from "sovendus-release-tool/types";

const releaseConfig: ReleaseConfig = {
  packages: [
    {
      directory: "./src/packages/next-vibe",
      updateDeps: true,
      test: false,
      lint: false,
      build: true,
      release: {
        version: "1.0.0",
      },
    },
    {
      directory: "./src/packages/base-station",
      updateDeps: true,
      test: false,
      lint: false,
      build: true,
      release: {
        version: "1.0.0",
      },
    },
  ],
};
export default releaseConfig;
