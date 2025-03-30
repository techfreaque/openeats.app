import { testEndpoint } from "next-query-portal/testing/test-endpoint";

import meEndpoint from "./definition";

testEndpoint(meEndpoint.GET);

testEndpoint(meEndpoint.POST);
