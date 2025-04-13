# next-vibe

A lightweight, type-safe API client and server framework for Next.js applications with integrated WebSocket support.

## Features

- 🔒 **Type-safe**: Full TypeScript support with Zod schema validation
- 🚀 **Performance**: Optimized for minimal re-renders and efficient data fetching
- 🧪 **Testing**: Integrated testing utilities with data factories
- 📚 **Documentation**: Automatic API documentation generation
- 🔄 **Real-time**: WebSocket support for real-time updates
- 🧩 **Modular**: Use only what you need
- 🔐 **Role-Based Access Control**: Built-in user role management and authorization
- 📝 **Form Integration**: Form handling with validation and API integration

## Getting Started

### Installation

```bash
npm install next-vibe
# or
yarn add next-vibe
# or
pnpm add next-vibe
```

### Server-Side Setup

Initialize the API library in your application:

```typescript
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initApiLibrary } from 'next-vibe/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const dev = env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || '', true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      errorLogger('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Initialize API library with WebSocket support
  initApiLibrary({
    prismaClient: prisma,
    httpServer: server,
    webSocket: {
      enabled: true,
      path: '/api/ws',
      corsOrigin: dev ? '*' : env.NEXT_PUBLIC_FRONTEND_URL,
    },
    apiConfig: {
      defaultStaleTime: 30000,
      defaultCacheTime: 300000,
    },
  });

  // Start server
  server.listen(3000, () => {
    debugLogger('> Ready on http://localhost:3000');
  });
});
```

### Define an API Endpoint

```typescript
import { z } from 'zod';
import { createEndpoint } from 'next-vibe/client';
import { Methods, UserRoleValue } from 'next-vibe/shared';

// Define request schema
const getUserSchema = z.object({
  id: z.string().uuid(),
});

// Define response schema
const userResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(UserRoleValue),
});

// Create the endpoint
const getUserEndpoint = createEndpoint({
  description: "Get user by ID",
  method: Methods.GET,
  path: ["users", ":id"],
  requestSchema: getUserSchema,
  responseSchema: userResponseSchema,
  requestUrlSchema: z.object({
    id: z.string().uuid(),
  }),
  allowedRoles: [UserRoleValue.ADMIN],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Insufficient permissions",
    404: "User not found",
    500: "Server error",
  },
});

export default {
  GET: getUserEndpoint,
};
```

### Implement the API Route Handler

```typescript
// src/app/api/users/[id]/route.ts
import { apiHandler } from "next-vibe/server";
import { db } from "@/app/api/db";

import definitions from "./definition";

export const GET = apiHandler({
  endpoint: definitions.GET,
  handler: async ({ urlVariables }) => {
    try {
      const userData = await db.user.findUnique({
        where: { id: urlVariables.id },
      });

      if (!userData) {
        return {
          success: false,
          message: "User not found",
          errorCode: 404,
        };
      }

      return {
        success: true,
        data: userData,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        errorCode: 500,
      };
    }
  },
});
```

### Use the API Client in Your Components

```tsx
// src/app/components/UserProfile.tsx
import { useApiQuery } from "next-vibe/client";
import userDefinitions from "@/app/api/users/definition";

interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const { data, isLoading, error } = useApiQuery(
    userDefinitions.GET,
    { id: userId },
    { id: userId },
    {
      enabled: !!userId,
      staleTime: 60000,
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>{data.name}</h1>
      <p>Email: {data.email}</p>
      <p>Role: {data.role}</p>
    </div>
  );
}
```

### Create a Form with API Integration

```tsx
// src/app/components/CreateUserForm.tsx
import { useApiForm } from "next-vibe/client";
import createUserEndpoint from "@/app/api/users/create/definition";

export function CreateUserForm() {
  const { form, submitForm, isSubmitting, submitError } = useApiForm(
    createUserEndpoint.POST,
    {},
    {
      defaultValues: {
        name: "",
        email: "",
        role: "USER",
      },
    }
  );

  const { register, formState: { errors } } = form;

  return (
    <form onSubmit={(e) => submitForm(e)}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" {...register("name")} />
        {errors.name && <p>{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register("email")} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create User"}
      </button>

      {submitError && <p>Error: {submitError.message}</p>}
    </form>
  );
}
```

## WebSocket Notifications

next-vibe includes built-in support for WebSockets using Socket.IO, making it easy to implement real-time notifications.

### Using Notifications in Components

```tsx
// src/app/components/NotificationListener.tsx
import { useNotifications } from "next-vibe/client";

export function NotificationListener() {
  const {
    isConnected,
    notifications,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    clearNotifications,
  } = useNotifications({
    channels: ["orders", "announcements"],
    autoConnect: true,
  });

  return (
    <div>
      <div>
        Status: {isConnected ? "Connected" : "Disconnected"}
        <button onClick={connect} disabled={isConnected}>
          Connect
        </button>
        <button onClick={disconnect} disabled={!isConnected}>
          Disconnect
        </button>
      </div>

      <div>
        <h3>Notifications ({notifications.length})</h3>
        <button onClick={clearNotifications}>Clear</button>

        {notifications.map((notification, index) => (
          <div key={index}>
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
            <small>
              {new Date(notification.timestamp).toLocaleString()} via {notification.channel}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Sending Notifications from the Server

```typescript
// src/app/api/notification/route.ts
import { apiHandler, sendNotification } from 'next-vibe/server';
import notificationEndpoint from './definition';

export const POST = apiHandler({
  endpoint: notificationEndpoint.POST,
  handler: async ({ data, user }) => {
    // Send notification to all clients subscribed to the channel
    const deliveredCount = sendNotification(
      data.channel,
      data.title,
      data.message,
      data.data,
      {
        id: user.id,
        role: user.role,
      }
    );

    return {
      success: true,
      data: { deliveredCount },
    };
  },
});
```

## API Reference

### Server-Side APIs

- `initApiLibrary()`: Initialize the API library
- `apiHandler()`: Create an API route handler
- `sendNotification()`: Send a notification to WebSocket clients

### Client-Side Hooks

- `useApiQuery()`: Fetch data from an API endpoint
- `useApiMutation()`: Perform mutations (create, update, delete)
- `useApiForm()`: Integrate forms with API endpoints
- `useNotifications()`: Subscribe to and receive real-time notifications

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
