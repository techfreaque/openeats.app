import type { ReleaseConfig } from "sovendus-release-tool/types";

const releaseConfig: ReleaseConfig = {
  packages: [
    {
      directory: "./src/packages/next-query-portal",
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
