import { testEndpoint } from "next-query-portal/server";

import { meEndpoint } from "./me";
import { GET } from "./route";

testEndpoint(meEndpoint, GET);
