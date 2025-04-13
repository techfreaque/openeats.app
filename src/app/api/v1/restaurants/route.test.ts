import { testEndpoint } from "@/packages/next-vibe/testing/test-endpoint";

import restaurantsEndpoint from "./definition";

testEndpoint(restaurantsEndpoint.POST);
