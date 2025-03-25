// Mock restaurant data
const mockRestaurants = [
  {
    id: "1",
    name: "Burger Palace",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    rating: 4.8,
    deliveryTime: "15-25 min",
    category: "American",
    description:
      "Serving the juiciest burgers in town with fresh ingredients and homemade sauces.",
    address: "123 Burger St, Foodville",
  },
  {
    id: "2",
    name: "Pizza Heaven",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    rating: 4.5,
    deliveryTime: "20-30 min",
    category: "Italian",
    description:
      "Authentic Italian pizzas made in a wood-fired oven with imported ingredients.",
    address: "456 Pizza Ave, Foodville",
  },
  {
    id: "3",
    name: "Sushi Express",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    rating: 4.7,
    deliveryTime: "25-35 min",
    category: "Japanese",
    description:
      "Fresh sushi and sashimi prepared by expert chefs using the finest ingredients.",
    address: "789 Sushi Blvd, Foodville",
  },
  {
    id: "4",
    name: "Taco Fiesta",
    image:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    rating: 4.6,
    deliveryTime: "15-25 min",
    category: "Mexican",
    description:
      "Authentic Mexican tacos, burritos, and quesadillas with homemade salsas.",
    address: "101 Taco Lane, Foodville",
  },
  {
    id: "5",
    name: "Noodle House",
    image:
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    rating: 4.4,
    deliveryTime: "20-30 min",
    category: "Chinese",
    description:
      "Handmade noodles and authentic Chinese dishes prepared with traditional recipes.",
    address: "202 Noodle St, Foodville",
  },
  {
    id: "6",
    name: "Salad Bar",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    rating: 4.3,
    deliveryTime: "10-20 min",
    category: "Healthy",
    description:
      "Fresh, organic salads and healthy bowls for the health-conscious food lover.",
    address: "303 Green Ave, Foodville",
  },
];

// Mock menu items data
const mockMenuItems = [
  // Burger Palace menu items
  {
    id: "m1_1",
    restaurant_id: "1",
    name: "Classic Cheeseburger",
    price: 8.99,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description:
      "Beef patty with cheddar cheese, lettuce, tomato, onion, and special sauce.",
  },
  {
    id: "m1_2",
    restaurant_id: "1",
    name: "Bacon Deluxe",
    price: 10.99,
    image:
      "https://images.unsplash.com/photo-1553979459-d2229ba7433b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description:
      "Beef patty with bacon, cheddar cheese, lettuce, tomato, and BBQ sauce.",
  },
  {
    id: "m1_3",
    restaurant_id: "1",
    name: "Veggie Burger",
    price: 9.99,
    image:
      "https://images.unsplash.com/photo-1520072959219-c595dc870360?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description:
      "Plant-based patty with lettuce, tomato, onion, and vegan mayo.",
  },
  {
    id: "m1_4",
    restaurant_id: "1",
    name: "French Fries",
    price: 3.99,
    image:
      "https://images.unsplash.com/photo-1576107232684-1279f390859f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Crispy golden fries seasoned with sea salt.",
  },

  // Pizza Heaven menu items
  {
    id: "m2_1",
    restaurant_id: "2",
    name: "Margherita Pizza",
    price: 12.99,
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description:
      "Classic pizza with tomato sauce, mozzarella, and fresh basil.",
  },
  {
    id: "m2_2",
    restaurant_id: "2",
    name: "Pepperoni Pizza",
    price: 14.99,
    image:
      "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Pizza with tomato sauce, mozzarella, and pepperoni slices.",
  },
  {
    id: "m2_3",
    restaurant_id: "2",
    name: "Vegetarian Pizza",
    price: 13.99,
    image:
      "https://images.unsplash.com/photo-1511689660979-10d2b1aada49?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description:
      "Pizza with tomato sauce, mozzarella, bell peppers, mushrooms, and olives.",
  },
  {
    id: "m2_4",
    restaurant_id: "2",
    name: "Garlic Bread",
    price: 4.99,
    image:
      "https://images.unsplash.com/photo-1573140401552-3fab0b24427f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Toasted bread with garlic butter and herbs.",
  },

  // Sushi Express menu items
  {
    id: "m3_1",
    restaurant_id: "3",
    name: "California Roll",
    price: 7.99,
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Sushi roll with crab, avocado, and cucumber.",
  },
  {
    id: "m3_2",
    restaurant_id: "3",
    name: "Salmon Nigiri",
    price: 8.99,
    image:
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Fresh salmon slices on top of seasoned rice.",
  },
  {
    id: "m3_3",
    restaurant_id: "3",
    name: "Spicy Tuna Roll",
    price: 9.99,
    image:
      "https://images.unsplash.com/photo-1617196034183-421b4917c92d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Sushi roll with spicy tuna, cucumber, and avocado.",
  },
  {
    id: "m3_4",
    restaurant_id: "3",
    name: "Miso Soup",
    price: 3.99,
    image:
      "https://images.unsplash.com/photo-1607301406259-dfb186e15de8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description:
      "Traditional Japanese soup with tofu, seaweed, and green onions.",
  },

  // Taco Fiesta menu items
  {
    id: "m4_1",
    restaurant_id: "4",
    name: "Beef Tacos",
    price: 8.99,
    image:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description:
      "Three corn tortillas with seasoned beef, lettuce, cheese, and salsa.",
  },
  {
    id: "m4_2",
    restaurant_id: "4",
    name: "Chicken Quesadilla",
    price: 9.99,
    image:
      "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description:
      "Flour tortilla filled with grilled chicken, cheese, and peppers.",
  },
  {
    id: "m4_3",
    restaurant_id: "4",
    name: "Veggie Burrito",
    price: 8.99,
    image:
      "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description:
      "Large flour tortilla filled with rice, beans, vegetables, cheese, and guacamole.",
  },
  {
    id: "m4_4",
    restaurant_id: "4",
    name: "Nachos",
    price: 7.99,
    image:
      "https://images.unsplash.com/photo-1582169296194-e4d644c48063?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description:
      "Tortilla chips topped with cheese, jalapeños, salsa, and sour cream.",
  },

  // Noodle House menu items
  {
    id: "m5_1",
    restaurant_id: "5",
    name: "Beef Chow Mein",
    price: 11.99,
    image:
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Stir-fried noodles with beef, vegetables, and savory sauce.",
  },
  {
    id: "m5_2",
    restaurant_id: "5",
    name: "Pork Dumplings",
    price: 6.99,
    image:
      "https://images.unsplash.com/photo-1563245424-9aae2244d7b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description:
      "Steamed dumplings filled with pork and chives, served with dipping sauce.",
  },
  {
    id: "m5_3",
    restaurant_id: "5",
  },
];
