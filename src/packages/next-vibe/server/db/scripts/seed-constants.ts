// Define specific ID types with UUID format validation
export type UUID = string; //`${string}-${string}-${string}-${string}-${string}`;

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

  menuItems: [
    "66666666-6666-6666-6666-666666666601" as UUID,
    "66666666-6666-6666-6666-666666666602" as UUID,
    "66666666-6666-6666-6666-666666666603" as UUID,
    "66666666-6666-6666-6666-666666666604" as UUID,
    "66666666-6666-6666-6666-666666666605" as UUID,
    "66666666-6666-6666-6666-666666666606" as UUID,
    "66666666-6666-6666-6666-666666666607" as UUID,
    "66666666-6666-6666-6666-666666666608" as UUID,
    "66666666-6666-6666-6666-666666666609" as UUID,
  ],

  // Orders and deliveries
  orders: Array.from(
    { length: 10 },
    (_, i) => `66666666-6666-6666-6666-66666666660${i + 1}`,
  ),

  // Order items - add 30 UUIDs for order items (3 items max per 10 orders)
  orderItems: Array.from(
    { length: 30 },
    (_, i) =>
      `77777777-7777-7777-0000-00000000${String(i + 1).padStart(4, "0")}`,
  ),

  // Add deliveries array for createDeliveries function
  deliveries: Array.from(
    { length: 10 },
    (_, i) =>
      `77777777-7777-7777-7777-77777777${String(i + 1).padStart(4, "0")}`,
  ),

  // UI related
  uis: Array.from(
    { length: 5 },
    (_, i) => `77777777-7777-7777-7777-77777777770${i + 1}`,
  ),
  subPrompts: Array.from(
    { length: 15 },
    (_, i) => `88888888-8888-8888-8888-88888888880${i + 1}`,
  ),

  // For createLikes and other functions
  users: [
    "22222222-2222-2222-2222-222222222201" as UUID,
    "22222222-2222-2222-2222-222222222202" as UUID,
    "22222222-2222-2222-2222-222222222203" as UUID,
    "44444444-4444-4444-4444-000000000001" as UUID,
    "44444444-4444-4444-4444-000000000002" as UUID,
  ],

  // Others
  messages: Array.from(
    { length: 20 },
    (_, i) => `99999999-9999-9999-9999-99999999990${i + 1}`,
  ),
  bugReports: Array.from(
    { length: 3 },
    (_, i) => `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa00${i + 1}`,
  ),
};

// Define main category names to IDs mapping for easy reference
export const CATEGORY_NAME_TO_ID = {
  Pizza: SEED_IDS.categories[0]!,
  Burger: SEED_IDS.categories[1]!,
  Sushi: SEED_IDS.categories[2]!,
  Italian: SEED_IDS.categories[3]!,
  Mexican: SEED_IDS.categories[4]!,
  Appetizers: SEED_IDS.categories[5]!,
  Pasta: SEED_IDS.categories[6]!,
  Tacos: SEED_IDS.categories[7]!,
  Burritos: SEED_IDS.categories[8]!,
};

// Main category IDs for reference
export const MAIN_CATEGORY_IDS = [
  SEED_IDS.categories[0]!, // Pizza
  SEED_IDS.categories[1]!, // Burger
  SEED_IDS.categories[2]!, // Sushi
  SEED_IDS.categories[3]!, // Italian
  SEED_IDS.categories[4]!, // Mexican
];
