import { testEndpoint } from "next-query-portal/testing/test-endpoint";

import meEndpoint from "./definition";
import { GET } from "./route";

testEndpoint(meEndpoint, GET);
