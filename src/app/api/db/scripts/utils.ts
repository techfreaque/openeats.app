import {
  Day,
  DeliveryStatus,
  DeliveryType,
  MessageType,
  OrderStatus,
  PaymentMethod,
  UiType,
  UserRoleValue,
} from "@prisma/client";
import { hash } from "bcrypt";
import { debugLogger } from "next-vibe/shared/utils/logger";
import { timeToSeconds } from "next-vibe/shared/utils/time";

import { db } from "@/app/api/db";
import { Countries, currencyByCountry } from "@/translations";

import { CATEGORY_NAME_TO_ID, SEED_IDS, type UUID } from "./seed-constants";

// Helper to create a random date within the last n days
const randomDate = (daysAgo = 30): Date => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
};

// Create admin user
export async function createAdminUser(): Promise<void> {
  debugLogger("Creating admin user...");

  const password = await hash("password", 10);

  const user = await db.user.upsert({
    where: { id: SEED_IDS.adminUser },
    update: {
      email: "admin@example.com",
      password,
      firstName: "Admin",
      lastName: "User",
      imageUrl: "/placeholder.svg",
    },
    create: {
      id: SEED_IDS.adminUser,
      email: "admin@example.com",
      password,
      firstName: "Admin",
      lastName: "User",
      imageUrl: "/placeholder.svg",
      userRoles: {
        create: [
          {
            role: UserRoleValue.ADMIN,
          },
          {
            role: UserRoleValue.CUSTOMER,
          },
        ],
      },
    },
  });

  debugLogger(`Admin user created with ID: ${user.id}`);
}

// Create categories
export async function createCategories(): Promise<void> {
  debugLogger("Creating categories...");

  const mainCategories = [
    {
      id: CATEGORY_NAME_TO_ID["Pizza"],
      name: "Pizza",
      image: "/placeholder.svg",
    },
    {
      id: CATEGORY_NAME_TO_ID["Burger"],
      name: "Burger",
      image: "/placeholder.svg",
    },
    {
      id: CATEGORY_NAME_TO_ID["Sushi"],
      name: "Sushi",
      image: "/placeholder.svg",
    },
    {
      id: CATEGORY_NAME_TO_ID["Italian"],
      name: "Italian",
      image: "/placeholder.svg",
    },
    {
      id: CATEGORY_NAME_TO_ID["Mexican"],
      name: "Mexican",
      image: "/placeholder.svg",
    },
  ];

  for (const category of mainCategories) {
    await db.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        image: category.image,
        published: true,
      },
      create: {
        id: category.id,
        name: category.name,
        image: category.image,
        published: true,
      },
    });
  }

  const subCategories = [
    {
      id: CATEGORY_NAME_TO_ID["Appetizers"],
      name: "Appetizers",
      image: "/placeholder.svg",
      parentId: CATEGORY_NAME_TO_ID["Italian"],
    },
    {
      id: CATEGORY_NAME_TO_ID["Pasta"],
      name: "Pasta",
      image: "/placeholder.svg",
      parentId: CATEGORY_NAME_TO_ID["Italian"],
    },
    {
      id: CATEGORY_NAME_TO_ID["Tacos"],
      name: "Tacos",
      image: "/placeholder.svg",
      parentId: CATEGORY_NAME_TO_ID["Mexican"],
    },
    {
      id: CATEGORY_NAME_TO_ID["Burritos"],
      name: "Burritos",
      image: "/placeholder.svg",
      parentId: CATEGORY_NAME_TO_ID["Mexican"],
    },
  ];

  for (const category of subCategories) {
    await db.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        image: category.image,
        published: true,
        parentCategoryId: category.parentId,
      },
      create: {
        id: category.id,
        name: category.name,
        image: category.image,
        published: true,
        parentCategoryId: category.parentId,
      },
    });
  }

  debugLogger(
    `${mainCategories.length + subCategories.length} categories created`,
  );
}

// Create customers
export async function createCustomers(): Promise<void> {
  debugLogger("Creating customers...");

  const customers = [
    {
      id: SEED_IDS.customers[0]!,
      email: "customer1@example.com",
      firstName: "John",
      lastName: "Doe",
    },
    {
      id: SEED_IDS.customers[1]!,
      email: "customer2@example.com",
      firstName: "Jane",
      lastName: "Smith",
    },
    {
      id: SEED_IDS.customers[2]!,
      email: "customer3@example.com",
      firstName: "Bob",
      lastName: "Johnson",
    },
  ];

  const password = await hash("password123", 10);

  for (const customer of customers) {
    await db.user.upsert({
      where: { id: customer.id },
      update: {
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
      create: {
        id: customer.id,
        email: customer.email,
        password,
        firstName: customer.firstName,
        lastName: customer.lastName,
        imageUrl: "/placeholder.svg",
        userRoles: {
          create: {
            role: UserRoleValue.CUSTOMER,
          },
        },
      },
    });
  }

  debugLogger(`${customers.length} customers created`);
}

// Create partners (restaurants)
export async function createPartners(): Promise<void> {
  debugLogger("Creating partners...");

  const partners = [
    {
      id: SEED_IDS.partners[0]!,
      name: "Pizza Palace",
      description: "Best pizza in town",
      categoryId: CATEGORY_NAME_TO_ID["Pizza"],
      countryCode: Countries.DE,
    },
    {
      id: SEED_IDS.partners[1]!,
      name: "Burger Heaven",
      description: "Juicy burgers and crispy fries",
      categoryId: CATEGORY_NAME_TO_ID["Burger"],
      countryCode: Countries.DE,
    },
    {
      id: SEED_IDS.partners[2]!,
      name: "Sushi World",
      description: "Fresh sushi and Japanese cuisine",
      categoryId: CATEGORY_NAME_TO_ID["Sushi"],
      countryCode: Countries.DE,
    },
  ];

  for (const [index, partner] of partners.entries()) {
    // Create partner user first
    const password = await hash("partner123", 10);
    const userId = `33333333-3333-3333-3333-00000000000${index + 1}`;

    await db.user.upsert({
      where: { id: userId },
      update: {
        email: `partner${index + 1}@example.com`,
        firstName: "Partner",
        lastName: `${index + 1}`,
      },
      create: {
        id: userId,
        email: `partner${index + 1}@example.com`,
        password,
        firstName: "Partner",
        lastName: `${index + 1}`,
        imageUrl: "/placeholder.svg",
      },
    });

    // Create partner
    await db.partner.upsert({
      where: { id: partner.id },
      update: {
        name: partner.name,
        description: partner.description,
        published: true,
        countryId: partner.countryCode,
        mainCategoryId: partner.categoryId,
      },
      create: {
        id: partner.id,
        name: partner.name,
        description: partner.description,
        delivery: true,
        pickup: true,
        dineIn: true,
        rating: 4.5,

        priceLevel: 2,
        published: true,
        street: "Bachstraße",
        streetNumber: `1`,
        zip: "84359",
        city: "Simbach am Inn",
        phone: `555-123-${1000 + index}`,
        email: `contact@${partner.name.toLowerCase().replace(" ", "")}.com`,
        image: "/placeholder.svg",
        latitude: 40.7128 + index * 0.01,
        longitude: -74.006 + index * 0.01,
        countryId: partner.countryCode,
        mainCategoryId: partner.categoryId,
      },
    });

    // Create partner admin role
    await db.userRole.upsert({
      where: {
        userId_role_partnerId: {
          userId: userId,
          role: UserRoleValue.PARTNER_ADMIN,
          partnerId: partner.id,
        },
      },
      update: {},
      create: {
        role: UserRoleValue.PARTNER_ADMIN,
        userId: userId,
        partnerId: partner.id,
      },
    });
  }

  debugLogger(`${partners.length} partners created`);
}

// Create drivers
export async function createDrivers(): Promise<void> {
  debugLogger("Creating drivers...");

  const drivers = [
    {
      id: SEED_IDS.drivers[0]!,
      userId: `44444444-4444-4444-4444-000000000001` as UUID,
      email: "driver1@example.com",
      firstName: "Dave",
      lastName: "Driver",
      vehicle: "Car",
      licensePlate: "ABC123",
    },
    {
      id: SEED_IDS.drivers[1]!,
      userId: `44444444-4444-4444-4444-000000000002` as UUID,
      email: "driver2@example.com",
      firstName: "Mike",
      lastName: "Moto",
      vehicle: "Motorcycle",
      licensePlate: "XYZ789",
    },
  ];

  const password = await hash("driver123", 10);

  for (const [index, driver] of drivers.entries()) {
    // Create user
    await db.user.upsert({
      where: { id: driver.userId },
      update: {
        email: driver.email,
        firstName: driver.firstName,
        lastName: driver.lastName,
      },
      create: {
        id: driver.userId,
        email: driver.email,
        password,
        firstName: driver.firstName,
        lastName: driver.lastName,
        imageUrl: "/placeholder.svg",
        userRoles: {
          create: {
            role: UserRoleValue.COURIER,
          },
        },
      },
    });

    // Create driver profile
    const driverData = {
      userId: driver.userId,
      isActive: true,
      vehicle: driver.vehicle,
      licensePlate: driver.licensePlate,
      radius: 10.0, // 10km radius
      latitude: 40.7128 + index * 0.01,
      longitude: -74.006 + index * 0.01,
      street: "Driver Street",
      streetNumber: `${index + 1}`,
      zip: "10001",
      city: "Driver City",
      phone: `555-555-${1000 + index}`,
      countryId: Countries.DE,
    };

    await db.driver.upsert({
      where: { id: driver.id },
      update: driverData,
      create: {
        id: driver.id,
        ...driverData,
      },
    });
  }

  debugLogger(`${drivers.length} drivers created`);
}

// Create addresses
export async function createAddresses(): Promise<void> {
  debugLogger("Creating addresses...");

  for (const [customerIndex, customerId] of SEED_IDS.customers.entries()) {
    // Create 2 addresses per customer: Home and Work
    const addressTypes = ["Home", "Work"];

    for (const [i, label] of addressTypes.entries()) {
      const addressId = `55555555-0000-0000-0000-${customerId.substring(24, 36)}${i}`;

      await db.address.upsert({
        where: { id: addressId },
        update: {
          userId: customerId,
          label,
          name: "Delivery Address",
          street: `Customer Street`,
          streetNumber: `${100 + customerIndex * 10 + i}`,
          zip: `${10000 + customerIndex * 100 + i}`,
          city: "Customer City",
          phone: `555-555-${1000 + customerIndex * 10 + i}`,
          isDefault: i === 0,
          countryId: Countries.DE,
        },
        create: {
          id: addressId,
          userId: customerId,
          label,
          name: "Delivery Address",
          street: `Customer Street`,
          streetNumber: `${100 + customerIndex * 10 + i}`,
          zip: `${10000 + customerIndex * 100 + i}`,
          city: "Customer City",
          phone: `555-555-${1000 + customerIndex * 10 + i}`,
          isDefault: i === 0,
          countryId: Countries.DE,
        },
      });
    }
  }

  debugLogger("Addresses created");
}

// Create opening times
export async function createOpeningTimes(): Promise<void> {
  debugLogger("Creating opening times...");

  for (const partnerId of SEED_IDS.partners) {
    for (const day of Object.values(Day)) {
      // Different hours for weekends
      const isWeekend = day === Day.SATURDAY || day === Day.SUNDAY;

      // First, check if the record exists
      const existingOpeningTime = await db.openingTimes.findFirst({
        where: {
          restaurantId: partnerId,
          day,
        },
      });

      if (existingOpeningTime) {
        // Update existing record
        await db.openingTimes.update({
          where: {
            id: existingOpeningTime.id,
          },
          data: {
            published: true,
            open: timeToSeconds(isWeekend ? "10:00" : "09:00"),
            close: timeToSeconds(isWeekend ? "22:00" : "21:00"),
          },
        });
      } else {
        // Create new record
        await db.openingTimes.create({
          data: {
            restaurantId: partnerId,
            published: true,
            day,
            open: timeToSeconds(isWeekend ? "10:00" : "09:00"),
            close: timeToSeconds(isWeekend ? "22:00" : "21:00"),
          },
        });
      }
    }
  }

  debugLogger("Opening times created");
}

// Create restaurant site content
export async function createRestaurantSiteContent(): Promise<void> {
  debugLogger("Creating restaurant site content...");

  const contentTypes = [
    {
      title: "About Us",
      key: "about",
      icon: "info-circle",
      code: "<p>We are a family restaurant serving delicious food since 2010.</p>",
    },
    {
      title: "Contact",
      key: "contact",
      icon: "phone",
      code: "<p>Call us: 555-123-4567</p>",
    },
    {
      title: "Terms",
      key: "terms",
      icon: "file-contract",
      code: "<p>Our terms and conditions...</p>",
    },
  ];

  for (const partnerId of SEED_IDS.partners) {
    for (const content of contentTypes) {
      // First, check if the record exists
      const existingContent = await db.restaurantSiteContent.findFirst({
        where: {
          restaurantId: partnerId,
          key: content.key,
        },
      });

      if (existingContent) {
        // Update existing record
        await db.restaurantSiteContent.update({
          where: {
            id: existingContent.id,
          },
          data: {
            title: content.title,
            icon: content.icon,
            code: content.code,
          },
        });
      } else {
        // Create new record
        await db.restaurantSiteContent.create({
          data: {
            restaurantId: partnerId,
            title: content.title,
            key: content.key,
            icon: content.icon,
            code: content.code,
          },
        });
      }
    }
  }

  debugLogger("Restaurant site content created");
}

// Create menu items
export async function createMenuItems(): Promise<void> {
  debugLogger("Creating menu items...");

  const getMenuItemId = (index: number): string => {
    return SEED_IDS.menuItems[index]!;
  };

  const menuItemsByCategory = {
    Pizza: [
      {
        id: getMenuItemId(0),
        name: "Margherita",
        description: "Classic tomato and cheese",
        price: 10.99,
      },
      {
        id: getMenuItemId(1),
        name: "Pepperoni",
        description: "Pepperoni and cheese",
        price: 12.99,
      },
      {
        id: getMenuItemId(2),
        name: "Vegetarian",
        description: "Mixed vegetables",
        price: 11.99,
      },
    ],
    Burger: [
      {
        id: getMenuItemId(3),
        name: "Classic Burger",
        description: "Beef patty with lettuce and tomato",
        price: 8.99,
      },
      {
        id: getMenuItemId(4),
        name: "Cheeseburger",
        description: "Classic with cheese",
        price: 9.99,
      },
      {
        id: getMenuItemId(5),
        name: "Veggie Burger",
        description: "Plant-based patty",
        price: 10.99,
      },
    ],
    Sushi: [
      {
        id: getMenuItemId(6),
        name: "California Roll",
        description: "Crab, avocado, cucumber",
        price: 14.99,
      },
      {
        id: getMenuItemId(7),
        name: "Salmon Nigiri",
        description: "Fresh salmon",
        price: 16.99,
      },
      {
        id: getMenuItemId(8),
        name: "Tuna Roll",
        description: "Fresh tuna roll",
        price: 15.99,
      },
    ],
  };

  for (const partnerId of SEED_IDS.partners) {
    // Get partner's category
    const partner = await db.partner.findUnique({
      where: { id: partnerId },
      include: { mainCategory: true },
    });

    if (!partner) {
      continue;
    }

    const categoryName = partner.mainCategory.name;
    const menuItems =
      menuItemsByCategory[categoryName as keyof typeof menuItemsByCategory] ||
      menuItemsByCategory["Pizza"];

    for (const item of menuItems) {
      await db.menuItem.upsert({
        where: {
          id: item.id,
        },
        update: {
          restaurantId: partnerId,
          description: item.description,
          price: item.price,
          taxPercent: 8.5,
          published: true,
          image: "/placeholder.svg",
          categoryId: partner.mainCategoryId,
        },
        create: {
          id: item.id,
          restaurantId: partnerId,
          categoryId: partner.mainCategoryId,
          name: item.name,
          description: item.description,
          price: item.price,
          taxPercent: 8.5,
          availableFrom: new Date(),
          isAvailable: true,
          published: true,
          currency: currencyByCountry[Countries.DE],
          image: "/placeholder.svg",
        },
      });
    }
  }

  debugLogger("Menu items created");
}

// Create cart items
export async function createCartItems(): Promise<void> {
  debugLogger("Creating cart items...");

  // Add a few random cart items
  for (let i = 0; i < 5; i++) {
    const customerId =
      SEED_IDS.customers[
        Math.floor(Math.random() * SEED_IDS.customers.length)
      ]!;
    const menuItem = await db.menuItem.findUnique({
      where: {
        id: SEED_IDS.menuItems[
          Math.floor(Math.random() * SEED_IDS.menuItems.length)
        ]!,
      },
      include: { restaurant: true },
    });

    if (!menuItem) {
      continue;
    }

    await db.cartItem.upsert({
      where: {
        userId_menuItemId_restaurantId: {
          userId: customerId,
          menuItemId: menuItem.id,
          restaurantId: menuItem.restaurantId,
        },
      },
      update: {
        quantity: Math.floor(Math.random() * 3) + 1,
      },
      create: {
        userId: customerId,
        menuItemId: menuItem.id,
        restaurantId: menuItem.restaurantId,
        quantity: Math.floor(Math.random() * 3) + 1,
      },
    });
  }

  debugLogger("Cart items created");
}

// Create orders
export async function createOrders(): Promise<void> {
  debugLogger("Creating orders...");

  const statuses = [
    OrderStatus.NEW,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.DELIVERED,
  ];

  for (let i = 0; i < SEED_IDS.orders.length; i++) {
    const customerId = SEED_IDS.customers[i % SEED_IDS.customers.length]!;
    const partnerId = SEED_IDS.partners[i % SEED_IDS.partners.length]!;
    const status = statuses[i % statuses.length]!;
    const orderId = SEED_IDS.orders[i]!;

    await db.order.upsert({
      where: { id: orderId },
      update: {
        customerId,
        restaurantId: partnerId,
        status,
        paymentMethod: [
          PaymentMethod.CARD,
          PaymentMethod.CASH,
          PaymentMethod.ONLINE,
        ][i % 3]!,
        tax: 8.5,
        total: 30 + i * 5, // Deterministic total
        deliveryFee: 5.99,
        driverTip: i + 1, // Deterministic tip
        restaurantTip: i * 0.5,
        createdAt: randomDate(30),
      },
      create: {
        id: orderId,
        customerId,
        restaurantId: partnerId,
        status,
        paymentMethod: [
          PaymentMethod.CARD,
          PaymentMethod.CASH,
          PaymentMethod.ONLINE,
        ][i % 3]!,
        tax: 8.5,
        total: 30 + i * 5, // Deterministic total
        deliveryFee: 5.99,
        driverTip: i + 1, // Deterministic tip
        restaurantTip: i * 0.5,
        createdAt: randomDate(30),
        currency: currencyByCountry[Countries.DE],
      },
    });
  }

  debugLogger("Orders created");
}

// Create order items
export async function createOrderItems(): Promise<void> {
  debugLogger("Creating order items...");

  let orderItemIndex = 0;

  for (const orderId of SEED_IDS.orders) {
    // Add 1-3 items to each order
    const itemCount = 1 + Math.floor(Math.random() * 3);

    for (let i = 0; i < itemCount; i++) {
      const menuItemId =
        SEED_IDS.menuItems[
          Math.floor(Math.random() * SEED_IDS.menuItems.length)
        ]!;
      const menuItem = await db.menuItem.findUnique({
        where: { id: menuItemId },
      });

      if (!menuItem) {
        continue;
      }

      const orderItemId = SEED_IDS.orderItems[orderItemIndex++]!;

      // Use the id directly instead of the compound key
      await db.orderItem.upsert({
        where: {
          id: orderItemId,
        },
        update: {
          quantity: 1 + Math.floor(Math.random() * 3),
          price: menuItem.price,
          taxPercent: menuItem.taxPercent,
          currency: currencyByCountry[Countries.DE],
          message: "Hello, please add extra cheese.",
          menuItemId,
        },
        create: {
          id: orderItemId,
          orderId,
          currency: currencyByCountry[Countries.DE],
          message: "Hello, please add extra cheese.",
          menuItemId,
          quantity: 1 + Math.floor(Math.random() * 3),
          price: menuItem.price,
          taxPercent: menuItem.taxPercent,
        },
      });
    }
  }

  debugLogger("Order items created");
}

// Create deliveries
export async function createDeliveries(): Promise<void> {
  debugLogger("Creating deliveries...");

  // Only create deliveries for orders that are OUT_FOR_DELIVERY or DELIVERED
  const eligibleOrders = await db.order.findMany({
    where: {
      status: { in: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED] },
    },
  });

  for (const [index, order] of eligibleOrders.entries()) {
    const driverId = SEED_IDS.drivers[index % SEED_IDS.drivers.length]!;
    const status =
      order.status === OrderStatus.DELIVERED
        ? DeliveryStatus.DELIVERED
        : DeliveryStatus.PICKED_UP;

    // Prepare delivery data
    const deliveryData = {
      driverId,
      type: DeliveryType.DELIVERY,
      status,
      estimatedPreparationTime: 20 + Math.floor(Math.random() * 20),
      estimatedDeliveryTime: 15 + Math.floor(Math.random() * 15),
      distance: 2 + Math.random() * 8, // 2-10km
      street: "Bachstraße",
      streetNumber: `1`,
      zip: "84359",
      city: "Simbach am Inn",
      phone: `555-555-${1000 + Math.floor(Math.random() * 9000)}`,
      latitude: 40.7128 + Math.random() * 0.1,
      longitude: -74.006 + Math.random() * 0.1,
      countryId: Countries.DE,
    };

    // Use upsert instead of create to handle existing deliveries
    await db.delivery.upsert({
      where: { id: SEED_IDS.deliveries[index]! },
      update: deliveryData,
      create: {
        id: SEED_IDS.deliveries[index]!,
        orderId: order.id,
        ...deliveryData,
      },
    });
  }

  debugLogger("Deliveries created");
}

// Create restaurant ratings
export async function createRestaurantRatings(): Promise<void> {
  debugLogger("Creating restaurant ratings...");

  // Create ratings
  for (const [index, customerId] of SEED_IDS.customers.entries()) {
    for (const partnerId of SEED_IDS.partners) {
      // 50% chance to create a rating
      if (Math.random() > 0.5) {
        continue;
      }

      await db.restaurantRating.upsert({
        where: {
          userId_restaurantId: {
            userId: customerId,
            restaurantId: partnerId,
          },
        },
        update: {
          rating: 3 + (index % 3), // Rating between 3 and 5
        },
        create: {
          userId: customerId,
          restaurantId: partnerId,
          rating: 3 + (index % 3), // Rating between 3 and 5
        },
      });
    }
  }

  debugLogger("Restaurant ratings created");
}

// Create driver ratings
export async function createDriverRatings(): Promise<void> {
  debugLogger("Creating driver ratings...");

  // Create ratings
  for (const [index, customerId] of SEED_IDS.customers.entries()) {
    for (const driverId of SEED_IDS.drivers) {
      // 50% chance to create a rating
      if (Math.random() > 0.5) {
        continue;
      }

      // Generate random rating value between 3 and 5
      const rating = 3 + (index % 3);

      // Use upsert instead of create to handle the unique constraint
      await db.driverRating.upsert({
        where: {
          userId_ratedUserId: {
            userId: customerId,
            ratedUserId: driverId,
          },
        },
        update: { rating }, // Update the rating if the record already exists
        create: {
          userId: customerId,
          ratedUserId: driverId,
          rating,
        },
      });
    }
  }

  debugLogger("Driver ratings created");
}

// Define type for message data
interface MessageData {
  type: MessageType;
  createdAt: Date;
  userId?: string;
  restaurantId?: string;
  orderId?: string;
}

// Create messages
export async function createMessages(): Promise<void> {
  debugLogger("Creating messages...");

  const messageTypes = [
    MessageType.CUSTOMER,
    MessageType.RESTAURANT,
    MessageType.ORDER,
  ];

  // Create 20 random messages
  for (let i = 0; i < 20; i++) {
    const type = messageTypes[Math.floor(Math.random() * messageTypes.length)]!;
    const messageId = SEED_IDS.messages[i]!;

    let data: MessageData = {
      type,
      createdAt: randomDate(30),
    };

    if (type === MessageType.CUSTOMER) {
      data.userId =
        SEED_IDS.customers[
          Math.floor(Math.random() * SEED_IDS.customers.length)
        ]!;
    } else if (type === MessageType.RESTAURANT) {
      data.restaurantId =
        SEED_IDS.partners[
          Math.floor(Math.random() * SEED_IDS.partners.length)
        ]!;
    } else if (type === MessageType.ORDER) {
      data.orderId =
        SEED_IDS.orders[Math.floor(Math.random() * SEED_IDS.orders.length)]!;
    }

    await db.messages.upsert({
      where: { id: messageId },
      update: data,
      create: {
        id: messageId,
        ...data,
      },
    });
  }

  debugLogger("Messages created");
}

// Create earnings
export async function createEarnings(): Promise<void> {
  debugLogger("Creating earnings...");

  // Create earnings for each driver for the last 30 days
  for (const [index, driverId] of SEED_IDS.drivers.entries()) {
    const driver = await db.driver.findUnique({
      where: { id: driverId },
      include: { user: true },
    });

    if (!driver) {
      continue;
    }

    // Last 30 days of earnings
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // First check if a record already exists for this user and date
      const existingEarning = await db.earning.findFirst({
        where: {
          userId: driver.userId,
          date: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999)),
          },
        },
      });

      if (existingEarning) {
        // Update existing record
        await db.earning.update({
          where: { id: existingEarning.id },
          data: {
            amount: 50 + (index % 150), // $50-$200 per day
            deliveries: 5 + (index % 10), // 5-15 deliveries
          },
        });
      } else {
        // Create new record
        await db.earning.create({
          data: {
            userId: driver.userId,
            date,
            amount: 50 + (index % 150), // $50-$200 per day
            deliveries: 5 + (index % 10), // 5-15 deliveries
          },
        });
      }
    }
  }

  debugLogger("Earnings created");
}

// Create UIs
export async function createUIs(): Promise<void> {
  debugLogger("Creating UIs...");

  const uiTypes = [UiType.SHADCN_REACT, UiType.NEXTUI_REACT];

  // Create 5 UI entries
  for (let i = 0; i < 5; i++) {
    const uiId = SEED_IDS.uis[i]!;

    await db.uI.upsert({
      where: { id: uiId },
      update: {
        userId:
          SEED_IDS.users[Math.floor(Math.random() * SEED_IDS.users.length)]!,
        prompt: `Design a ${i % 2 === 0 ? "restaurant" : "food delivery"} interface`,
        img: "/placeholder.svg",
        uiType: uiTypes[i % 2]!,
        public: true,
        updatedAt: new Date(),
        likesCount: Math.floor(Math.random() * 50),
        viewCount: 50 + Math.floor(Math.random() * 200),
      },
      create: {
        id: uiId,
        userId:
          SEED_IDS.users[Math.floor(Math.random() * SEED_IDS.users.length)]!,
        prompt: `Design a ${i % 2 === 0 ? "restaurant" : "food delivery"} interface`,
        img: "/placeholder.svg",
        uiType: uiTypes[i % 2]!,
        public: true,
        updatedAt: new Date(),
        likesCount: Math.floor(Math.random() * 50),
        viewCount: 50 + Math.floor(Math.random() * 200),
      },
    });
  }

  debugLogger("UIs created");
}

// Create subPrompts
export async function createSubPrompts(): Promise<void> {
  debugLogger("Creating subPrompts...");

  // Create 2-3 subPrompts for each UI
  for (const [index, uiId] of SEED_IDS.uis.entries()) {
    const count = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < count; i++) {
      const subId = SEED_IDS.subPrompts[index * 3 + i]!;
      // Generate unique SUBId by including the UI index
      const SUBId = `${String.fromCharCode(97 + i)}-${index}-0`; // 'a-0-0', 'b-0-0', etc. for first UI, 'a-1-0', 'b-1-0' for second UI

      await db.subPrompt.upsert({
        where: { id: subId },
        update: {
          UIId: uiId,
          SUBId,
          subPrompt: `Create a ${i === 0 ? "header" : i === 1 ? "main content" : "footer"} component`,
        },
        create: {
          id: subId,
          UIId: uiId,
          SUBId,
          subPrompt: `Create a ${i === 0 ? "header" : i === 1 ? "main content" : "footer"} component`,
        },
      });
    }
  }

  debugLogger("SubPrompts created");
}

// Create codes
export async function createCodes(): Promise<void> {
  debugLogger("Creating codes...");

  // First, get all subPrompts that actually exist in the database
  const subPrompts = await db.subPrompt.findMany();

  if (subPrompts.length === 0) {
    debugLogger("No SubPrompts found to create Codes for");
    return;
  }

  // Create code for each existing subPrompt
  for (const subPrompt of subPrompts) {
    await db.code.upsert({
      where: { subPromptId: subPrompt.id },
      update: {
        code: `function Component() {
  return <div>Sample component code</div>;
}`,
      },
      create: {
        subPromptId: subPrompt.id,
        code: `function Component() {
  return <div>Sample component code</div>;
}`,
      },
    });
  }

  debugLogger(`${subPrompts.length} Codes created`);
}

// Create likes
export async function createLikes(): Promise<void> {
  debugLogger("Creating likes...");

  // Create 15 random likes
  for (let i = 0; i < 15; i++) {
    const userId =
      SEED_IDS.users[Math.floor(Math.random() * SEED_IDS.users.length)]!;
    const uiId = SEED_IDS.uis[Math.floor(Math.random() * SEED_IDS.uis.length)]!;

    // First check if a like already exists for this user and UI
    const existingLike = await db.like.findFirst({
      where: {
        userId: userId,
        UIId: uiId,
      },
    });

    if (existingLike) {
      // Like already exists, nothing to do
      continue;
    } else {
      // Create new like
      await db.like.create({
        data: {
          userId,
          UIId: uiId,
        },
      });
    }
  }

  debugLogger("Likes created");
}

// Create bug reports
export async function createBugReports(): Promise<void> {
  debugLogger("Creating bug reports...");

  const bugReports = [
    {
      id: SEED_IDS.bugReports[0]!,
      title: "Checkout not working",
      description: "When I try to checkout, the page freezes",
      type: "Bug",
      severity: "High",
    },
    {
      id: SEED_IDS.bugReports[1]!,
      title: "Menu images not loading",
      description: "Images are showing broken links",
      type: "UI Issue",
      severity: "Medium",
    },
    {
      id: SEED_IDS.bugReports[2]!,
      title: "Feature request: Save favorite restaurants",
      description: "Would like to bookmark favorite places",
      type: "Feature Request",
      severity: "Low",
    },
  ];

  for (const [index, report] of bugReports.entries()) {
    const userId = SEED_IDS.customers[index % SEED_IDS.customers.length]!;

    await db.bugReport.upsert({
      where: { id: report.id },
      update: {
        userId,
        title: report.title,
        description: report.description,
        reportType: report.type,
        severity: report.severity,
        steps:
          report.type === "Bug"
            ? "1. Go to checkout\n2. Click Pay Now\n3. Page freezes"
            : null,
      },
      create: {
        id: report.id,
        userId,
        title: report.title,
        description: report.description,
        reportType: report.type,
        severity: report.severity,
        steps:
          report.type === "Bug"
            ? "1. Go to checkout\n2. Click Pay Now\n3. Page freezes"
            : null,
      },
    });
  }

  debugLogger("Bug reports created");
}
