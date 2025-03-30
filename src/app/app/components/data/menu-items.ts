import type { MenuItemType } from "../lib/types";

export const mockMenuItems: MenuItemType[] = [
  // Burger Joint Menu Items
  {
    id: "101",
    restaurantId: "1",
    name: "Classic Cheeseburger",
    description:
      "Beef patty with American cheese, lettuce, tomato, onion, and special sauce on a brioche bun.",
    price: 8.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Burgers",
  },
  {
    id: "102",
    restaurantId: "1",
    name: "Bacon Deluxe Burger",
    description:
      "Beef patty with crispy bacon, cheddar cheese, lettuce, tomato, and mayo on a brioche bun.",
    price: 10.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Burgers",
  },
  {
    id: "103",
    restaurantId: "1",
    name: "Veggie Burger",
    description:
      "Plant-based patty with lettuce, tomato, onion, pickles, and vegan mayo on a whole wheat bun.",
    price: 9.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Burgers",
  },
  {
    id: "104",
    restaurantId: "1",
    name: "French Fries",
    description: "Crispy golden fries seasoned with sea salt.",
    price: 3.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Sides",
  },
  {
    id: "105",
    restaurantId: "1",
    name: "Onion Rings",
    description: "Crispy battered onion rings served with dipping sauce.",
    price: 4.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Sides",
  },
  {
    id: "106",
    restaurantId: "1",
    name: "Chocolate Milkshake",
    description: "Creamy chocolate milkshake topped with whipped cream.",
    price: 5.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Drinks",
  },
  {
    id: "107",
    restaurantId: "1",
    name: "Fountain Soda",
    description: "Your choice of soda with free refills.",
    price: 2.49,
    image: "/placeholder.svg?height=100&width=100",
    category: "Drinks",
  },

  // Pizza Palace Menu Items
  {
    id: "201",
    restaurantId: "2",
    name: "Margherita Pizza",
    description:
      "Classic pizza with tomato sauce, fresh mozzarella, and basil.",
    price: 12.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Pizzas",
  },
  {
    id: "202",
    restaurantId: "2",
    name: "Pepperoni Pizza",
    description: "Pizza with tomato sauce, mozzarella, and pepperoni.",
    price: 14.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Pizzas",
  },
  {
    id: "203",
    restaurantId: "2",
    name: "Vegetarian Pizza",
    description:
      "Pizza with tomato sauce, mozzarella, bell peppers, mushrooms, onions, and olives.",
    price: 15.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Pizzas",
  },
  {
    id: "204",
    restaurantId: "2",
    name: "Garlic Bread",
    description: "Toasted bread with garlic butter and herbs.",
    price: 4.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Sides",
  },
  {
    id: "205",
    restaurantId: "2",
    name: "Caesar Salad",
    description:
      "Romaine lettuce with Caesar dressing, croutons, and parmesan cheese.",
    price: 6.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Salads",
  },

  // Sushi World Menu Items
  {
    id: "301",
    restaurantId: "3",
    name: "California Roll",
    description: "Crab, avocado, and cucumber roll with sesame seeds.",
    price: 7.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Rolls",
  },
  {
    id: "302",
    restaurantId: "3",
    name: "Spicy Tuna Roll",
    description: "Spicy tuna and cucumber roll with spicy mayo.",
    price: 8.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Rolls",
  },
  {
    id: "303",
    restaurantId: "3",
    name: "Salmon Nigiri",
    description: "Fresh salmon over pressed vinegared rice.",
    price: 5.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Nigiri",
  },
  {
    id: "304",
    restaurantId: "3",
    name: "Tuna Nigiri",
    description: "Fresh tuna over pressed vinegared rice.",
    price: 5.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Nigiri",
  },
  {
    id: "305",
    restaurantId: "3",
    name: "Miso Soup",
    description:
      "Traditional Japanese soup with tofu, seaweed, and green onions.",
    price: 3.99,
    image: "/placeholder.svg?height=100&width=100",
    category: "Sides",
  },
];
