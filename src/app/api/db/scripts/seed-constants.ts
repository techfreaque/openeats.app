// Define specific ID types with UUID format validation
export type UUID = `${string}-${string}-${string}-${string}-${string}`;

// Define predefined UUIDs for each entity type
export const SEED_IDS = {
  // Users and roles
  adminUser: "11111111-1111-1111-1111-111111111111" as UUID,
  customers: [
    "22222222-2222-2222-2222-222222222201" as UUID,
    "22222222-2222-2222-2222-222222222202" as UUID,
    "22222222-2222-2222-2222-222222222203" as UUID,
  ],
  partners: [
    "33333333-3333-3333-3333-333333333301" as UUID,
    "33333333-3333-3333-3333-333333333302" as UUID,
    "33333333-3333-3333-3333-333333333303" as UUID,
  ],
  drivers: [
    "44444444-4444-4444-4444-444444444401" as UUID,
    "44444444-4444-4444-4444-444444444402" as UUID,
  ],
  
  // Menu related
  categories: [
    "55555555-5555-5555-5555-555555555501" as UUID, // Pizza
    "55555555-5555-5555-5555-555555555502" as UUID, // Burger
    "55555555-5555-5555-5555-555555555503" as UUID, // Sushi
    "55555555-5555-5555-5555-555555555504" as UUID, // Italian
    "55555555-5555-5555-5555-555555555505" as UUID, // Mexican
    "55555555-5555-5555-5555-555555555506" as UUID, // Appetizers
    "55555555-5555-5555-5555-555555555507" as UUID, // Pasta
    "55555555-5555-5555-5555-555555555508" as UUID, // Tacos
    "55555555-5555-5555-5555-555555555509" as UUID, // Burritos
  ],
  
  // Orders and deliveries
  orders: Array.from({ length: 10 }, (_, i) => 
    `66666666-6666-6666-6666-66666666660${i+1}` as UUID
  ),
  
  // UI related
  uis: Array.from({ length: 5 }, (_, i) => 
    `77777777-7777-7777-7777-77777777770${i+1}` as UUID
  ),
  subPrompts: Array.from({ length: 15 }, (_, i) => 
    `88888888-8888-8888-8888-88888888880${i+1}` as UUID
  ),
  
  // Others
  messages: Array.from({ length: 20 }, (_, i) => 
    `99999999-9999-9999-9999-99999999990${i+1}` as UUID
  ),
  bugReports: Array.from({ length: 3 }, (_, i) => 
    `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa00${i+1}` as UUID
  ),
};

// Define main category names to IDs mapping for easy reference
export const CATEGORY_NAME_TO_ID: Record<string, UUID> = {
  "Pizza": SEED_IDS.categories[0],
  "Burger": SEED_IDS.categories[1],
  "Sushi": SEED_IDS.categories[2],
  "Italian": SEED_IDS.categories[3],
  "Mexican": SEED_IDS.categories[4],
  "Appetizers": SEED_IDS.categories[5],
  "Pasta": SEED_IDS.categories[6],
  "Tacos": SEED_IDS.categories[7],
  "Burritos": SEED_IDS.categories[8],
};

// Main category IDs for reference
export const MAIN_CATEGORY_IDS: UUID[] = [
  SEED_IDS.categories[0], // Pizza
  SEED_IDS.categories[1], // Burger
  SEED_IDS.categories[2], // Sushi
  SEED_IDS.categories[3], // Italian
  SEED_IDS.categories[4], // Mexican
];
