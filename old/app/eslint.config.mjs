// eslint.config.js (ESLint 9+ Flat Config)

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import eslintPluginPrettier from "eslint-plugin-prettier";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// If you want to “clean” up browser globals to remove weird whitespace:
function cleanGlobals(globalsObj) {
  return Object.fromEntries(
    Object.entries(globalsObj).map(([key, value]) => [key.trim(), value]),
  );
}

export default [
  // 1) Ignored files/folders
  {
    ignores: [
      ".expo",
      "dist",
      "eslint.config.mjs",
    ],
  },

  // 2) Base config, TypeScript support
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.d.ts", "**/*.test.ts", "**/*.test.tsx"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        project: [resolve(__dirname, "tsconfig.json")],
        tsconfigRootDir: __dirname,
      },
      // Add whichever globals you need here
      globals: {
        ...globals.node,
        ...cleanGlobals(globals.browser), // If you want browser
        ...globals.webextensions,         // If you want webextensions
        ...globals.node,
        // ...globals.jest,
      },
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    plugins: {
      "@typescript-eslint": ts,
      "react-hooks": reactHooks,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
      "react-compiler": reactCompiler,
      import: importPlugin,
      prettier: eslintPluginPrettier,
    },

    rules: {
      // Pull in ESLint’s base recommended rules
      ...js.configs.recommended.rules,
      // Merge TS recommended
      ...ts.configs.recommended.rules,
      ...ts.configs["recommended-requiring-type-checking"].rules,

      // TypeScript custom rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-empty-function": [
        "error",
        { allow: ["arrowFunctions"] },
      ],

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",

      // Other plugin rules
      "react-compiler/react-compiler": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "unused-imports/no-unused-imports": "error",
      "import/no-unresolved": "error", // optional from eslint-plugin-import

      // General code-quality rules
      curly: "error",
      eqeqeq: ["error", "always"],
      "prefer-template": "error",
      "no-console": "warn",
      "no-debugger": "error",

      // Prettier (linting for code style)
      "prettier/prettier": [
        "error",
        {
          plugins: ["prettier-plugin-sort-json"],
          jsonRecursiveSort: true,
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
          semi: true,
          singleQuote: false,
          trailingComma: "all",
          bracketSpacing: true,
          arrowParens: "always",
          endOfLine: "lf",
          jsxSingleQuote: false,
          proseWrap: "preserve",
          quoteProps: "consistent",
        },
      ],
    },
  },

  // 3) For plain JS files
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...cleanGlobals(globals.browser),
        ...globals.webextensions,
      },
    },
  },
];
