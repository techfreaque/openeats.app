import { testEndpoint } from "@/packages/next-vibe/testing/test-endpoint";

import definitions from "./definition";

testEndpoint(definitions.GET);

testEndpoint(definitions.POST);
