# Notification API

The Notification API provides real-time communication capabilities using WebSockets. It allows clients to subscribe to notification channels and receive real-time updates.

## Features

- WebSocket-based real-time notifications
- Channel-based subscription model
- Authentication and authorization
- Email notifications (optional)
- Client-side React hooks for easy integration

## API Endpoints

### POST /api/notification-api/subscribe

Subscribe to notification channels.

**Request Body:**
```json
{
  "channels": ["orders", "announcements"],
  "deviceId": "device-123"
}
```

**Response:**
```json
{
  "success": true,
  "connectionId": "socket-id-123",
  "subscribedChannels": ["orders", "announcements"]
}
```

### PUT /api/notification-api/send

Send a notification to subscribed clients.

**Request Body:**
```json
{
  "channel": "orders",
  "title": "New Order",
  "message": "You have received a new order",
  "data": {
    "orderId": "order-123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "deliveredCount": 5
}
```

### GET /api/notification-api/connections

Get all active notification connections (admin only).

**Response:**
```json
{
  "connections": [
    {
      "connectionId": "socket-id-123",
      "userId": "user-123",
      "deviceId": "device-123",
      "subscribedChannels": ["orders", "announcements"],
      "connectedAt": 1621234567890
    }
  ]
}
```

## WebSocket Events

### Client to Server

- `authenticate`: Authenticate the WebSocket connection
  ```json
  {
    "deviceId": "device-123",
    "userId": "user-123"
  }
  ```

- `subscribe`: Subscribe to notification channels
  ```json
  {
    "channels": ["orders", "announcements"]
  }
  ```

- `unsubscribe`: Unsubscribe from notification channels
  ```json
  {
    "channels": ["orders"]
  }
  ```

### Server to Client

- `authenticated`: Sent after successful authentication
  ```json
  {
    "connectionId": "socket-id-123"
  }
  ```

- `subscribed`: Sent after successful subscription
  ```json
  {
    "connectionId": "socket-id-123",
    "subscribedChannels": ["orders", "announcements"]
  }
  ```

- `notification`: Sent when a notification is received
  ```json
  {
    "channel": "orders",
    "title": "New Order",
    "message": "You have received a new order",
    "data": {
      "orderId": "order-123"
    },
    "timestamp": 1621234567890,
    "sender": {
      "id": "user-123",
      "role": "ADMIN"
    }
  }
  ```

- `error`: Sent when an error occurs
  ```json
  {
    "message": "Not authenticated"
  }
  ```

## Client Usage

### React Hook

```tsx
import { useNotifications } from "@/app/hooks/useNotifications";

function MyComponent() {
  const {
    isConnected,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    notifications,
    clearNotifications,
  } = useNotifications({
    channels: ["orders", "announcements"],
    autoConnect: true,
    userId: "user-123",
  });

  // Use the notifications in your component
  return (
    <div>
      <h2>Notifications ({notifications.length})</h2>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Direct Client Usage

```tsx
import { getNotificationClient } from "@/app/utils/notification-client";

// Get the notification client
const client = getNotificationClient();

// Connect to the notification server
await client.connect("user-123");

// Subscribe to channels
await client.subscribe("orders");
await client.subscribe("announcements");

// Listen for notifications
client.onNotification("orders", (notification) => {
  debugLogger("New order notification:", notification);
});

// Disconnect when done
client.disconnect();
```
