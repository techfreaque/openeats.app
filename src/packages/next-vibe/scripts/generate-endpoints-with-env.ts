/**
 * scripts/generate-endpoints.ts
 *
 * This script runs at build time (or on dev onChange) to:
 * 1) Scan "src/app/api" for subdirectories containing "definition.ts".
 * 2) Generate "src/app/api/generated/endpoints.ts" with static imports used by the ApiExplorer.
 */
import "dotenv/config";
import "./generate-endpoints";
