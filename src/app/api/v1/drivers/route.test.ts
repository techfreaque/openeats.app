import { testEndpoint } from "@/packages/next-vibe/testing/test-endpoint";

import definitions from "./definition";
import { GET, POST, PUT } from "./route";

testEndpoint(definitions.GET, GET);

testEndpoint(definitions.POST, POST);

testEndpoint(definitions.PUT, PUT);
