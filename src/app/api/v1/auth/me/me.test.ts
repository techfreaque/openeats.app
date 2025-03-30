import { testEndpoint } from "next-vibe/testing/test-endpoint";

import meEndpoint from "./definition";

testEndpoint(meEndpoint.GET);

testEndpoint(meEndpoint.POST);
