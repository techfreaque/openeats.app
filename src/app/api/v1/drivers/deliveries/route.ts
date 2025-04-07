import { NextResponse } from "next/server";

import { db } from "@/app/api/db";

import { DeliveryStatus } from "../../order/delivery.schema";

// replaced db with prisma, for example

export async function GET(): Promise<NextResponse> {
  try {
    const deliveries = await db.order.findMany({
      where: {
        driverId: "driverId", // Replace with actual driver ID
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Type-check each item
    const pending = deliveries.filter(
      (d) => d.status === DeliveryStatus.PENDING,
    );
    const accepted = deliveries.filter(
      (d) => d.status === DeliveryStatus.ACCEPTED,
    );
    const ongoing = deliveries.filter(
      (d) => d.status === DeliveryStatus.ONGOING,
    );
    const completed = deliveries.filter(
      (d) => d.status === DeliveryStatus.COMPLETED,
    );

    const deliveriesFormatted = deliveries.map((d) => ({
      id: d.id,
      customerName: d.customer?.name ?? "",
      customerAddress: d.customer?.address ?? "",
      customerImage: d.customer?.image ?? "",
      items: d.orderItems.map((item) => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.menuItem.price,
      })),
      estimatedDelivery: d.estimatedDelivery,
      estimatedTime: d.estimatedTime ? String(d.estimatedTime) : undefined,
      actualTime: d.actualTime ? String(d.actualTime) : undefined,
      distance: d.distance ? String(d.distance) : undefined,
      tip: d.tip,
    }));

    return NextResponse.json({
      pending,
      accepted,
      ongoing,
      completed,
      deliveriesFormatted,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: "Could not fetch deliveries" },
      { status: 500 },
    );
  }
}
