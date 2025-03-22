import type { ReleaseConfig } from "sovendus-release-tool/types";

const releaseConfig: ReleaseConfig = {
  packages: [
    {
      directory: "./",
      updateDeps: true,
      test: false,
      lint: true,
      build: true,
      release: {
        version: "1.0.0",
        foldersToScanAndBumpThisPackage: [
          // scan whole dev env
          { folder: "./examples" },
        ],
      },
    },
  ],
};
export default releaseConfig;
