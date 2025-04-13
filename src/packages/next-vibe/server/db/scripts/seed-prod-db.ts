import "dotenv/config";

import { seedDatabase } from "../seed-manager";

void seedDatabase("prod");
