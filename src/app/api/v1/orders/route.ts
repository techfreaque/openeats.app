import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
): Promise<NextResponse<ResponseType<OrderResponseType>>> {
  const user = await getVerifiedUser(UserRoleValue.CUSTOMER);
  if (!user) {
    return createErrorResponse("Not signed in", 401);
  }

  try {
    // Validate request body
    const validatedData = await validatePostRequest<OrderCreateType>(
      request,
      orderCreateSchema,
    );
    const order = await createOrder(validatedData);
    return createSuccessResponse<
      OrderCreateType,
      OrderResponseType,
      UndefinedType
    >(endpoint, order, orderResponseSchema);
  } catch (err) {
    const error = err as Error;
    if (error.name === "ValidationError") {
      return createErrorResponse(`Validation error: ${error.message}`, 400);
    }
    return createErrorResponse(`Login error: ${error.message}`, 500);
  }
}

export async function createOrder(
  orderForm: OrderCreateType,
  orderId?: string,
): Promise<OrderResponseType> {
  // Check if restaurant exists
  const restaurant = await db.restaurant.findUnique({
    where: { id: orderForm.restaurantId },
  });
  if (!restaurant) {
    throw new Error(`Restaurant ${orderForm.restaurantId} not found`);
  }

  try {
    // Create order with delivery
    const menuItems = await db.menuItem.findMany({
      where: {
        id: { in: orderForm.orderItems.map((item) => item.menuItemId) },
      },
    });
    let total = 0;
    let totalTax = 0;
    const orderItems = orderForm.orderItems.map((item) => {
      const menuItem = Object.values(menuItems).find(
        (mi) => mi.id === item.menuItemId,
      );
      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItemId} not found`);
      }
      total += menuItem.price * item.quantity;
      totalTax += (menuItem.price * item.quantity * menuItem.taxPercent) / 100;
      return {
        quantity: item.quantity,
        message: item.message,
        price: menuItem.price,
        taxPercent: menuItem.taxPercent,
        menuItem: {
          connect: {
            id: item.menuItemId,
          },
        },
      };
    });
    const order = await db.order.create({
      data: {
        ...(orderId ? { id: orderId } : {}),
        status: OrderStatus.NEW,
        message: orderForm.message,
        total,
        tax: totalTax,
        customer: {
          connect: {
            id: orderForm.customerId,
          },
        },
        orderItems: {
          create: orderItems,
        },
        deliveryFee: orderForm.deliveryFee,
        driverTip: orderForm.driverTip,
        restaurantTip: orderForm.restaurantTip,
        projectTip: orderForm.projectTip,
        restaurant: {
          connect: {
            id: orderForm.restaurantId,
          },
        },
        delivery: {
          create: {
            type: orderForm.delivery.type,
            status: orderForm.delivery.status,
            distance: orderForm.delivery.distance,
            estimatedPreparationTime:
              orderForm.delivery.estimatedPreparationTime,
            estimatedDeliveryTime: orderForm.delivery.estimatedDeliveryTime,
            street: orderForm.delivery.street,
            streetNumber: orderForm.delivery.streetNumber,
            zip: orderForm.delivery.zip,
            city: orderForm.delivery.city,
            phone: orderForm.delivery.phone,
            latitude: orderForm.delivery.latitude,
            longitude: orderForm.delivery.longitude,
            countryId: orderForm.delivery.countryId,
          },
        },
      },
      select: {
        id: true,
        message: true,
        status: true,
        total: true,
        deliveryFee: true,
        driverTip: true,
        restaurantTip: true,
        projectTip: true,
        createdAt: true,
        updatedAt: true,
        orderItems: {
          select: {
            id: true,
            menuItemId: true,
            message: true,
            quantity: true,
            price: true,
            taxPercent: true,
          },
        },
        delivery: {
          select: {
            id: true,
            orderId: true,
            type: true,
            status: true,
            message: true,
            updatedAt: true,
            estimatedDeliveryTime: true,
            estimatedPreparationTime: true,
            distance: true,
            street: true,
            streetNumber: true,
            zip: true,
            driver: {
              select: {
                id: true,
                vehicle: true,
                licensePlate: true,
                createdAt: true,
                user: {
                  select: {
                    firstName: true,
                  },
                },
              },
            },
            city: true,
            phone: true,
            latitude: true,
            longitude: true,
            countryId: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        customer: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
          },
        },
      },
    });
    const {
      message,
      data: validatedData,
      success,
    } = validateData<OrderResponseType>(order, orderResponseSchema);
    if (!success) {
      throw new Error(message);
    }
    return validatedData;
  } catch (err) {
    const error = err as Error;
    throw new Error(`Error creating order: ${error.message}`);
  }
}

export async function GET(request: Request) {
  // Verify authentication
  const authResult = await verifyAuth(request, [
    "CUSTOMER",
    "RESTAURANT",
    "ADMIN",
  ]);
  if (!authResult.success) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status },
    );
  }

  try {
    // Define filter based on user role
    const filter = {};

    // Filter orders based on user role
    if (authResult.role === "CUSTOMER") {
      Object.assign(filter, { userId: authResult.userId });
    } else if (authResult.role === "RESTAURANT") {
      // Get restaurant IDs owned by this user
      const restaurants = await db.restaurant.findMany({
        where: { ownerId: authResult.userId },
        select: { id: true },
      });
      const restaurantIds = restaurants.map((r) => r.id);
      Object.assign(filter, { restaurantId: { in: restaurantIds } });
    }
    // Admin can see all orders (no filter)

    const orders = await db.order.findMany({
      where: filter,
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        restaurant: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return createSuccessResponse<OrderResponseType>(
      orders,
      orderResponseSchema,
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Error fetching orders" },
      { status: 500 },
    );
  }
}
