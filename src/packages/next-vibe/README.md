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

// Define request and response schemas
export const getUserRequestSchema = z.object({
  id: z.string(),
});
export type GetUserRequestType = z.infer<typeof getUserRequestSchema>;

export const getUserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(UserRoleValue),
});
export type GetUserResponseType = z.infer<typeof getUserResponseSchema>;

// Create the endpoint
const getUserEndpoint = createEndpoint({
  description: "Get user by ID",
  method: Methods.GET,
  path: ["users", "get"],
  requestSchema: getUserRequestSchema,
  responseSchema: getUserResponseSchema,
  requestUrlSchema: z.object({}),
  apiQueryOptions: {
    queryKey: ["user"],
  },
  allowedRoles: [UserRoleValue.ADMIN],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Insufficient permissions",
    404: "User not found",
    500: "Server error",
  },
  examples: {
    default: {
      request: {
        id: "user-123",
      },
      response: {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        role: UserRoleValue.ADMIN,
      },
    },
  },
});

export default {
  GET: getUserEndpoint,
};

```

### Implement the API Route Handler

```typescript
// src/app/api/users/route.ts
import "server-only";
import { apiHandler } from "next-vibe/server";
import { db } from "@/app/api/db";

import definitions from "./definition";
import type { GetUserRequestType } from "./definition";

export const GET = apiHandler({
  endpoint: definitions.GET,
  handler: async ({ data, urlVariables, user }) => {
    try {
      const userData = await db.user.findUnique({
        where: { id: data.id },
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
"use client";

import { useApiQuery } from "next-vibe/client";
import userDefinitions from "@/app/api/users/definition";

interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const { data, isLoading, error } = useApiQuery(
    userDefinitions.GET,
    { id: userId },
    {},
    {
      enabled: !!userId,
      // Skip initial fetch to prevent unnecessary requests
      skipInitialFetch: false,
      // Refetch when dependencies change
      refetchOnDependencyChange: true,
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

## WebSocket Notifications

next-vibe includes built-in support for WebSockets using Socket.IO, making it easy to implement real-time notifications.

### Setting Up WebSocket Server

The WebSocket server is automatically set up when you initialize the API library with WebSocket options:

```typescript
initApiLibrary({
  prismaClient: prisma,
  httpServer: server,
  webSocket: {
    enabled: true,
    path: '/api/ws',
    corsOrigin: dev ? '*' : env.NEXT_PUBLIC_FRONTEND_URL,
  },
});
```

### Using Notifications in Components

```tsx
// src/app/components/NotificationListener.tsx
"use client";

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
import { sendNotification } from 'next-vibe/server';

export async function POST(request: Request) {
  const { channel, title, message, data } = await request.json();

  // Send notification to all clients subscribed to the channel
  const deliveredCount = sendNotification(
    channel,
    title,
    message,
    data,
    {
      id: 'system',
      role: 'ADMIN',
    }
  );

  return Response.json({ success: true, deliveredCount });
}
```

## Data Factory System

next-vibe includes a powerful data factory system for generating consistent test data, API examples, and database seeds.

### Creating a Data Factory

```typescript
// src/factories/user.ts
import { createFactory, DataVariation } from 'next-vibe/testing';
import { UserRoleValue } from 'next-vibe/shared';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRoleValue;
}

export const userFactory = createFactory<User>({
  defaultVariation: DataVariation.DEFAULT,

  // Named examples that can be referenced by ID
  examples: {
    admin: {
      id: 'user-admin',
      name: 'Admin User',
      email: 'admin@example.com',
      role: UserRoleValue.ADMIN,
    },
    customer: {
      id: 'user-customer',
      name: 'Customer User',
      email: 'customer@example.com',
      role: UserRoleValue.CUSTOMER,
    },
  },

  // Factory functions for different variations
  variations: {
    [DataVariation.DEFAULT]: (index = 0) => ({
      id: `user-${index + 1}`,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      role: UserRoleValue.CUSTOMER,
    }),

    [DataVariation.MINIMAL]: (index = 0) => ({
      id: `user-${index + 1}`,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      role: UserRoleValue.CUSTOMER,
    }),

    [DataVariation.COMPLETE]: (index = 0) => ({
      id: `user-${index + 1}`,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      role: index % 2 === 0 ? UserRoleValue.ADMIN : UserRoleValue.CUSTOMER,
    }),
  },
});

// Register the factory with the repository
import { dataRepository } from 'next-vibe/testing';
dataRepository.register('user', userFactory);
```

### Using Data Factories in Tests

```typescript
// src/app/api/users/users.test.ts
import { describe, it, expect } from 'vitest';
import { dataRepository, generateSeedData } from 'next-vibe/testing';
import { DataVariation } from 'next-vibe/testing';

// Import user factory
import userFactory from '@/factories/user';

// Import user API definition
import userDefinitions from '@/app/api/users/definition';

describe('User API', () => {
  it('should validate user data correctly', () => {
    // Get example data from the factory
    const user = userFactory.create();

    // Validate the user using the endpoint schema
    const validation = userDefinitions.GET.responseSchema.safeParse(user);

    // Assert that validation passes
    expect(validation.success).toBe(true);
  });

  it('should create multiple users', () => {
    // Create multiple users
    const users = userFactory.createMany(5);

    // Assert that we have the correct number of users
    expect(users.length).toBe(5);

    // Assert that each user has a unique ID
    const uniqueIds = new Set(users.map(user => user.id));
    expect(uniqueIds.size).toBe(5);
  });
});
```

### Using Data Factories for Database Seeding

```typescript
// src/app/api/db/scripts/seed-dev-db.ts
import { dataRepository, generateSeedData } from 'next-vibe/testing';
import { DataVariation } from 'next-vibe/testing';
import { db } from '@/app/api/db';

// Import all factories to ensure they're registered
import '@/factories';

export default async function seedTestDatabase(): Promise<void> {
  debugLogger('🌱 Seeding test database...');

  // Generate users
  const users = generateSeedData('user', {
    count: 10,
    variation: DataVariation.COMPLETE,
  });

  // Insert users into the database
  await db.user.createMany({
    data: users,
  });

  debugLogger('✅ Test database seeded successfully!');
}
  },
});
```

## Performance Optimizations

next-vibe includes several performance optimizations:

1. **Minimal re-renders**: Hooks are optimized to prevent unnecessary re-renders
2. **Caching**: Responses are cached in memory and can be persisted to localStorage
3. **Deduplication**: Duplicate requests are automatically deduplicated
4. **Stale-while-revalidate**: Data is served from cache while being refreshed in the background
5. **Selective updates**: Only affected components are re-rendered when data changes

## API Reference

### Server-Side APIs

- `initApiLibrary()`: Initialize the API library
- `createEndpoint()`: Define a type-safe API endpoint
- `apiHandler()`: Create an API route handler
- `getVerifiedUser()`: Get authenticated user with role check
- `sendNotification()`: Send a notification to WebSocket clients

### Client-Side Hooks

- `useApiQuery()`: Fetch data from an API endpoint
- `useApiMutation()`: Perform mutations (create, update, delete)
- `useApiForm()`: Integrate forms with API endpoints
- `useNotifications()`: Subscribe to and receive real-time notifications

### Testing Utilities

- `createFactory()`: Create a data factory for generating test data
- `dataRepository`: Central repository for managing data factories
- `generateSeedData()`: Generate seed data for database seeding

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

