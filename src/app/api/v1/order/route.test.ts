import { testEndpoint } from "@/packages/next-vibe/testing/test-endpoint";

import definitions from "./definition";
import { POST } from "./route";

testEndpoint(definitions.POST, POST);
