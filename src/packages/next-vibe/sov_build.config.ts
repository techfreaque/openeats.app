import type { BuildConfig } from "sovendus-builder";

const buildConfig: BuildConfig = {
  foldersToClean: ["dist"],
  filesToCompile: [
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
        modulesToExternalize: ["react", "react-dom", "zustand"],
      },
    },
  ],
};

export default buildConfig;
