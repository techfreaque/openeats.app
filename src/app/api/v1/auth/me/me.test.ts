import { testEndpoint } from "next-query-portal/testing/test-endpoint";

import meEndpoint from "./definition";
import { GET, POST } from "./route";

testEndpoint(meEndpoint.GET, GET);

testEndpoint(meEndpoint.POST, POST);
