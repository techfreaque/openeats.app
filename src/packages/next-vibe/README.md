# next-vibe

A Next.js backend framework for building strongly typed APIs with integrated authentication, data access, and client-side hooks.

## Features

- **Strongly Typed APIs**: Define your endpoints with full TypeScript support and Zod validation
- **Role-Based Access Control**: Built-in user role management and authorization
- **Data Providers**: Flexible data access with Prisma integration
- **Client Hooks**: React hooks for data fetching and mutation
- **Form Integration**: Form handling with validation and API integration
- **Cross-Platform**: Works with both browser and React Native environments

## Getting Started

### Installation

```bash
npm install @open-delivery/next-portal
```

### Server-Side Setup

Initialize the API library in your application:

```typescript
import { initApiLibrary, PrismaDataProvider } from '@open-delivery/next-portal';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

initApiLibrary({
  prismaClient: prisma,
  apiConfig: {
    defaultStaleTime: 30000,
    defaultCacheTime: 300000,
  },
});
```

### Define an API Endpoint

```typescript
import { z } from 'zod';
import { createEndpoint, UserRoleValue } from '@open-delivery/next-portal';

// Define request and response schemas
const requestSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

const responseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
});

// Create the endpoint
export const createUserEndpoint = createEndpoint({
  description: 'Create a new user',
  method: 'POST',
  path: ['users'],
  allowedRoles: [UserRoleValue.ADMIN],
  requestSchema,
  responseSchema,
  requestUrlSchema: z.undefined(),
  fieldDescriptions: {
    name: 'The user\'s full name',
    email: 'The user\'s email address',
  },
  errorCodes: {
    400: 'Invalid request data',
    401: 'Not authorized',
    500: 'Server error',
  },
  apiQueryOptions: {
    staleTime: 0, // Never cache mutations
  },
  examples: {
    payloads: {
      default: { id: 'example-id', name: 'John Doe', email: 'john@example.com' },
    },
    urlPathVariables: undefined,
  },
});
```

### Create an API Route Handler

```typescript
// app/api/users/route.ts
import { apiHandler } from '@open-delivery/next-portal';
import { createUserEndpoint } from '@/endpoints/users';

export const POST = apiHandler({
  endpoint: createUserEndpoint,
  handler: async ({ data, user }) => {
    // Implement your logic here
    const newUser = await db.users.create({
      data: {
        name: data.name,
        email: data.email,
        createdBy: user.id,
      }
    });
    
    return {
      success: true,
      data: newUser,
    };
  },
});
```

### Client-Side Usage

```tsx
import { useApiQuery, useApiMutation } from '@open-delivery/next-portal';
import { getUsersEndpoint, createUserEndpoint } from '@/api/endpoints/users';

function UsersList() {
  // Query users
  const {
    data: users,
    isLoading,
    error
  } = useApiQuery(getUsersEndpoint);
  
  // Create user mutation
  const { mutate: createUser, isSuccess } = useApiMutation(createUserEndpoint);
  
  const handleCreateUser = (userData) => {
    createUser({ data: userData });
  };
  
  return (
    <div>
      {/* Render your UI */}
    </div>
  );
}
```

### Form Integration

```tsx
import { useApiForm } from '@open-delivery/next-portal';
import { createUserEndpoint } from '@/api/endpoints/users';

function UserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    submitForm,
    isSubmitting,
    formError
  } = useApiForm(createUserEndpoint);
  
  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <input {...register('name')} />
      <input {...register('email')} />
      <button type="submit" disabled={isSubmitting}>
        Create User
      </button>
      {formError && <p>{formError.message}</p>}
    </form>
  );
}
```

## API Reference

### Server-Side APIs

- `initApiLibrary()`: Initialize the API library
- `createEndpoint()`: Define a type-safe API endpoint
- `apiHandler()`: Create an API route handler
- `getVerifiedUser()`: Get authenticated user with role check

### Client-Side Hooks

- `useApiQuery()`: Fetch data from an API endpoint
- `useApiMutation()`: Perform mutations (create, update, delete)
- `useApiForm()`: Integrate forms with API endpoints

### Data Providers

- `PrismaDataProvider`: Use Prisma as a data source
- `MockDataProvider`: Use mock data (for testing)

## Environment Variables

Required environment variables:

- `JWT_SECRET_KEY`: Secret key for JWT token signing
- `NEXT_PUBLIC_BACKEND_URL`: Backend API URL
- `NEXT_PUBLIC_APP_NAME`: Application name

## License

MIT