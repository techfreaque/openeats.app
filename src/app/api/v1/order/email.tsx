import {
  Button,
  Column,
  Img,
  Link,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { EmailFunctionType } from "next-vibe/server/email/handle-emails";
import { APP_NAME } from "next-vibe/shared/constants";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { ErrorResponseTypes } from "next-vibe/shared/types/response.schema";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { EmailTemplate } from "@/config/email.template";
import { env } from "@/config/env";

import { getFullUser } from "../auth/me/route-handler/get-me";
import { DeliveryType } from "./delivery.schema";
import {
  type OrderCreateType,
  type OrderResponseType,
  OrderStatus,
} from "./schema";

// Styles for consistent look
const styles = {
  heading: {
    fontSize: "22px",
    fontWeight: "bold",
    lineHeight: "1.3",
    color: "#1F2937",
    marginBottom: "16px",
    marginTop: "24px",
  },
  subheading: {
    fontSize: "18px",
    fontWeight: "bold",
    lineHeight: "1.4",
    color: "#374151",
    marginBottom: "12px",
    marginTop: "20px",
  },
  paragraph: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#374151",
    marginBottom: "16px",
  },
  card: {
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "24px",
    backgroundColor: "#F9FAFB",
  },
  statusBadge: (status: OrderStatus): Record<string, string | number> => {
    const baseStyle = {
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: "16px",
      fontSize: "14px",
      fontWeight: "500",
    };

    switch (status) {
      case OrderStatus.NEW:
        return {
          ...baseStyle,
          backgroundColor: "#EFF6FF",
          color: "#1E40AF",
        };
      case OrderStatus.PREPARING:
        return {
          ...baseStyle,
          backgroundColor: "#FEF3C7",
          color: "#92400E",
        };
      case OrderStatus.READY:
        return {
          ...baseStyle,
          backgroundColor: "#ECFDF5",
          color: "#065F46",
        };
      case OrderStatus.OUT_FOR_DELIVERY:
        return {
          ...baseStyle,
          backgroundColor: "#F3E8FF",
          color: "#6B21A8",
        };
      case OrderStatus.DELIVERED:
        return {
          ...baseStyle,
          backgroundColor: "#D1FAE5",
          color: "#065F46",
        };
      case OrderStatus.CANCELLED:
        return {
          ...baseStyle,
          backgroundColor: "#FEE2E2",
          color: "#B91C1C",
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: "#F3F4F6",
          color: "#374151",
        };
    }
  },
  itemRow: {
    borderBottom: "1px solid #E5E7EB",
    paddingBottom: "12px",
    marginBottom: "12px",
  },
  button: {
    backgroundColor: "#4F46E5",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    padding: "12px 24px",
    textDecoration: "none",
    display: "inline-block",
    textAlign: "center" as const,
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderRadius: "6px",
    border: "1px solid #D1D5DB",
    color: "#374151",
    fontSize: "16px",
    fontWeight: "bold",
    padding: "12px 24px",
    textDecoration: "none",
    display: "inline-block",
    textAlign: "center" as const,
  },
  infoBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: "6px",
    padding: "16px",
    marginBottom: "20px",
  },
  footer: {
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#6B7280",
    marginTop: "32px",
    textAlign: "center" as const,
  },
};

// Helper function to format currency
const formatCurrency = (amount: number, currency = "EUR"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString: string | Date): string => {
  if (dateString instanceof Date) {
    dateString = dateString.toISOString();
  }
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Helper function to format time
const formatTime = (dateString: string | Date): string => {
  if (dateString instanceof Date) {
    dateString = dateString.toISOString();
  }
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

// Helper function to get delivery type text
const getDeliveryTypeText = (type: DeliveryType): string => {
  switch (type) {
    case DeliveryType.DELIVERY:
      return "Delivery";
    case DeliveryType.PICKUP:
      return "Pickup";
    case DeliveryType.DINE_IN:
      return "Dine In";
    default:
      return "Delivery";
  }
};

// Helper function to get status text
const getStatusText = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.NEW:
      return "New Order";
    case OrderStatus.PREPARING:
      return "Preparing";
    case OrderStatus.READY:
      return "Ready";
    case OrderStatus.OUT_FOR_DELIVERY:
      return "Out for Delivery";
    case OrderStatus.DELIVERED:
      return "Delivered";
    case OrderStatus.CANCELLED:
      return "Cancelled";
    default:
      return status;
  }
};

export const renderOrderCreateMail: EmailFunctionType<
  OrderCreateType,
  OrderResponseType,
  UndefinedType
> = async ({ responseData, requestData, urlVariables, user }) => {
  try {
    // Get detailed user information
    const fullUser = await getFullUser(user.id);

    if (!fullUser) {
      return {
        success: false,
        message: "Unable to retrieve user details",
        errorType: ErrorResponseTypes.NOT_FOUND,
        errorCode: 404,
      };
    }

    // Log data for debugging purposes
    debugLogger("order:email:requestData", requestData);
    debugLogger("order:email:urlVariables", urlVariables);
    debugLogger("order:email:user", user);
    debugLogger("order:email:responseData", responseData);

    // Extract order information from response data
    const order = responseData ?? {};

    if (!order.id) {
      return {
        success: false,
        message: "Invalid order data",
        errorCode: 400,
      };
    }

    // Extract order details
    const {
      id: orderId,
      total,
      deliveryFee,
      driverTip,
      restaurantTip,
      status,
      createdAt,
      restaurant,
      delivery,
      orderItems = [],
      paymentMethod,
    } = order;

    // Default tax value if not available
    const tax = 0;

    // Format dates
    const orderDate = formatDate(createdAt);
    const orderTime = formatTime(createdAt);

    // Calculate subtotal (total before fees and tips)
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Format currency values
    const formattedSubtotal = formatCurrency(subtotal);
    const formattedTotal = formatCurrency(total);
    const formattedTax = formatCurrency(tax);
    const formattedDeliveryFee = formatCurrency(deliveryFee);
    const formattedDriverTip = driverTip ? formatCurrency(driverTip) : "$0.00";
    const formattedRestaurantTip = restaurantTip
      ? formatCurrency(restaurantTip)
      : "$0.00";

    // Get delivery address if available
    const deliveryAddress =
      delivery && delivery.type === DeliveryType.DELIVERY
        ? `${delivery.street} ${delivery.streetNumber}, ${delivery.zip} ${delivery.city}`
        : null;

    // Get estimated delivery time
    const estimatedDeliveryTime = delivery?.estimatedDeliveryTime
      ? new Date(
          new Date(createdAt).getTime() +
            delivery.estimatedDeliveryTime * 60 * 1000,
        )
      : null;

    return {
      success: true,
      data: {
        toEmail: fullUser.email,
        toName: fullUser.firstName,
        subject: `Your Order #${orderId.slice(-6)} Has Been Received - ${APP_NAME}`,

        jsx: (
          <EmailTemplate
            title={`Order Confirmation`}
            previewText={`Thank you for your order! We've received your order #${orderId.slice(
              -6,
            )} and are processing it now.`}
          >
            {/* Header with logo and order status */}
            <Section style={{ textAlign: "center", marginBottom: "32px" }}>
              {restaurant?.image && (
                <Img
                  src={restaurant.image}
                  alt={restaurant.name}
                  width="120"
                  height="120"
                  style={{ borderRadius: "8px", marginBottom: "16px" }}
                />
              )}
              <div style={styles.statusBadge(status)}>
                {getStatusText(status)}
              </div>
            </Section>

            {/* Greeting */}
            <Text style={styles.paragraph}>Hi {fullUser.firstName},</Text>

            <Text style={styles.paragraph}>
              Thank you for your order! We&apos;ve received your order #
              {orderId.slice(-6)} placed on {orderDate} at {orderTime} and are
              processing it now.
            </Text>

            {/* Restaurant Info */}
            <Text style={styles.heading}>Restaurant</Text>
            <div style={styles.card}>
              <Text
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                {restaurant.name}
              </Text>
              <Text style={{ marginBottom: "8px" }}>
                {/* Restaurant address would go here */}
              </Text>
              <Text style={{ marginBottom: "8px" }}>
                {/* Restaurant location would go here */}
              </Text>
              <Text style={{ marginBottom: "8px" }}>
                <Link
                  href="tel:+1234567890"
                  style={{ color: "#4F46E5", textDecoration: "none" }}
                >
                  Contact restaurant
                </Link>
              </Text>
            </div>

            {/* Order Details */}
            <Text style={styles.heading}>Order Details</Text>
            <div style={styles.card}>
              <Row style={{ marginBottom: "12px" }}>
                <Column style={{ width: "50%" }}>
                  <Text style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    Order Number
                  </Text>
                  <Text style={{ marginBottom: "12px" }}>
                    #{orderId.slice(-6)}
                  </Text>
                </Column>
                <Column style={{ width: "50%" }}>
                  <Text style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    Order Date
                  </Text>
                  <Text style={{ marginBottom: "12px" }}>
                    {orderDate} at {orderTime}
                  </Text>
                </Column>
              </Row>

              <Row>
                <Column style={{ width: "50%" }}>
                  <Text style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    Order Type
                  </Text>
                  <Text style={{ marginBottom: "12px" }}>
                    {delivery ? getDeliveryTypeText(delivery.type) : "Delivery"}
                  </Text>
                </Column>
                <Column style={{ width: "50%" }}>
                  <Text style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    Payment Method
                  </Text>
                  <Text style={{ marginBottom: "12px" }}>{paymentMethod}</Text>
                </Column>
              </Row>

              {/* Delivery Information (if applicable) */}
              {deliveryAddress && (
                <>
                  <Text style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    Delivery Address
                  </Text>
                  <Text style={{ marginBottom: "12px" }}>
                    {deliveryAddress}
                  </Text>
                </>
              )}

              {estimatedDeliveryTime && (
                <>
                  <Text style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    Estimated Delivery Time
                  </Text>
                  <Text style={{ marginBottom: "12px" }}>
                    {formatDate(estimatedDeliveryTime.toISOString())} at{" "}
                    {formatTime(estimatedDeliveryTime.toISOString())}
                  </Text>
                </>
              )}
            </div>

            {/* Order Items */}
            <Text style={styles.heading}>Order Summary</Text>
            <div style={styles.card}>
              {/* Items List */}
              {orderItems.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    ...styles.itemRow,
                    borderBottom:
                      index === orderItems.length - 1
                        ? "none"
                        : "1px solid #E5E7EB",
                  }}
                >
                  <Row>
                    <Column style={{ width: "70%" }}>
                      <Text style={{ fontWeight: "bold", marginBottom: "4px" }}>
                        {item.quantity}x {`Item #${index + 1}`}
                      </Text>
                      {item.message && (
                        <Text
                          style={{
                            fontSize: "14px",
                            color: "#6B7280",
                            marginBottom: "4px",
                          }}
                        >
                          Note: {item.message}
                        </Text>
                      )}
                    </Column>
                    <Column style={{ width: "30%", textAlign: "right" }}>
                      <Text style={{ fontWeight: "bold" }}>
                        {formatCurrency(item.price * item.quantity)}
                      </Text>
                    </Column>
                  </Row>
                </div>
              ))}

              {/* Price Summary */}
              <div style={{ marginTop: "20px" }}>
                <Row style={{ marginBottom: "8px" }}>
                  <Column style={{ width: "70%" }}>
                    <Text>Subtotal</Text>
                  </Column>
                  <Column style={{ width: "30%", textAlign: "right" }}>
                    <Text>{formattedSubtotal}</Text>
                  </Column>
                </Row>

                <Row style={{ marginBottom: "8px" }}>
                  <Column style={{ width: "70%" }}>
                    <Text>Tax</Text>
                  </Column>
                  <Column style={{ width: "30%", textAlign: "right" }}>
                    <Text>{formattedTax}</Text>
                  </Column>
                </Row>

                <Row style={{ marginBottom: "8px" }}>
                  <Column style={{ width: "70%" }}>
                    <Text>Delivery Fee</Text>
                  </Column>
                  <Column style={{ width: "30%", textAlign: "right" }}>
                    <Text>{formattedDeliveryFee}</Text>
                  </Column>
                </Row>

                {driverTip && driverTip > 0 && (
                  <Row style={{ marginBottom: "8px" }}>
                    <Column style={{ width: "70%" }}>
                      <Text>Driver Tip</Text>
                    </Column>
                    <Column style={{ width: "30%", textAlign: "right" }}>
                      <Text>{formattedDriverTip}</Text>
                    </Column>
                  </Row>
                )}

                {restaurantTip && restaurantTip > 0 && (
                  <Row style={{ marginBottom: "8px" }}>
                    <Column style={{ width: "70%" }}>
                      <Text>Restaurant Tip</Text>
                    </Column>
                    <Column style={{ width: "30%", textAlign: "right" }}>
                      <Text>{formattedRestaurantTip}</Text>
                    </Column>
                  </Row>
                )}

                <Row
                  style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "2px solid #E5E7EB",
                  }}
                >
                  <Column style={{ width: "70%" }}>
                    <Text style={{ fontWeight: "bold", fontSize: "18px" }}>
                      Total
                    </Text>
                  </Column>
                  <Column style={{ width: "30%", textAlign: "right" }}>
                    <Text style={{ fontWeight: "bold", fontSize: "18px" }}>
                      {formattedTotal}
                    </Text>
                  </Column>
                </Row>
              </div>
            </div>

            {/* Tracking Information */}
            <Text style={styles.heading}>Track Your Order</Text>
            <div style={styles.infoBox}>
              <Text style={{ marginBottom: "16px" }}>
                You can track the status of your order and view all details by
                clicking the button below.
              </Text>
            </div>

            {/* Action Buttons */}
            <Section style={{ textAlign: "center", marginTop: "32px" }}>
              <Button
                href={`${env.NEXT_PUBLIC_FRONTEND_APP_URL}/app/order-tracking?id=${orderId}`}
                style={styles.button}
              >
                Track Your Order
              </Button>
            </Section>

            <Section style={{ textAlign: "center", marginTop: "16px" }}>
              <Button
                href={`${env.NEXT_PUBLIC_FRONTEND_APP_URL}/app/orders`}
                style={styles.secondaryButton}
              >
                View All Orders
              </Button>
            </Section>

            {/* Help and Support */}
            <Text style={styles.heading}>Need Help?</Text>
            <div style={styles.infoBox}>
              <Text style={{ marginBottom: "8px" }}>
                If you have any questions about your order, please contact:
              </Text>
              <Text style={{ marginBottom: "8px" }}>
                • Restaurant:{" "}
                <Link
                  href="tel:+1234567890"
                  style={{ color: "#4F46E5", textDecoration: "none" }}
                >
                  Contact restaurant
                </Link>
              </Text>
              <Text>
                • Customer Support:{" "}
                <Link
                  href={`mailto:${env.SUPPORT_EMAIL}`}
                  style={{ color: "#4F46E5", textDecoration: "none" }}
                >
                  {env.SUPPORT_EMAIL}
                </Link>
              </Text>
            </div>

            {/* Thank You Message */}
            <Text style={styles.footer}>
              Thank you for ordering with {APP_NAME}! We hope you enjoy your
              meal.
            </Text>
          </EmailTemplate>
        ),
      },
    };
  } catch (error) {
    debugLogger("order:email:error", error);
    return {
      success: false,
      message: "Failed to generate order confirmation email",
      errorCode: 500,
    };
  }
};
