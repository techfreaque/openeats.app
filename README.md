# Next Portal

**Next Portal** is a unified API client library designed for React applications. It provides type-safe API interactions with built-in caching, request deduplication, and seamless form integration.

## Features

- **🔒 Type-Safe**: Define your API endpoints with Zod schemas for bulletproof type safety.
- **🚀 Simple to Use**: Intuitive hooks like `useQuery` and `useMutation` for easy data fetching.
- **⚡️ Fast by Default**: Built-in caching, request deduplication, and stale-while-revalidate.
- **🔌 Framework Agnostic**: Works with Next.js, Create React App, React Native, and more.
- **🧪 Testable**: Mock data providers for easy testing without a database.

## Installation

```bash
npm install @open-eats/next-portal
# or
yarn add @open-eats/next-portal
```

## Quick Start

### Step 1: Initialize the library

```tsx
// src/lib/api.ts
import { initApiLibrary } from '@open-eats/next-portal';

// For production with Prisma:
initApiLibrary();

// For testing with mock data:
initApiLibrary({ 
  useMockProvider: true,
  mockData: {
    // Optional mock data
  }
});
```

### Step 2: Define your endpoints

```tsx
// src/lib/endpoints.ts
import { z } from 'zod';
import { createEndpoint, UserRoleValue } from '@open-eats/next-portal';

// Define your schema
const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email()
});

// Create an endpoint
export const getUsersEndpoint = createEndpoint({
  description: "Get all users",
  method: "GET", 
  path: ["api", "users"],
  responseSchema: z.array(userSchema),
  roles: [UserRoleValue.ADMIN]
});
```

### Step 3: Use the hooks in your components

```tsx
// src/components/UsersList.tsx
import { useQuery } from '@open-eats/next-portal';
import { getUsersEndpoint } from '../lib/endpoints';

function UsersList() {
  const { data, isLoading, error } = useQuery(getUsersEndpoint);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name} ({user.email})</li>
      ))}
    </ul>
  );
}
```

## Complete Example

Here's a complete example showing a data fetching and form submission workflow:

```tsx
import { z } from 'zod';
import { createEndpoint, useQuery, useMutation, useApiForm, UserRoleValue } from '@open-eats/next-portal';

// 1. Define your schemas
const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email()
});

const createUserSchema = userSchema.omit({ id: true });
type User = z.infer<typeof userSchema>;
type CreateUser = z.infer<typeof createUserSchema>;

// 2. Define your endpoints
const getUsersEndpoint = createEndpoint({
  description: "Get all users",
  method: "GET",
  path: ["api", "users"],
  responseSchema: z.array(userSchema),
  roles: [UserRoleValue.ADMIN]
});

const createUserEndpoint = createEndpoint({
  description: "Create user", 
  method: "POST",
  path: ["api", "users"],
  requestSchema: createUserSchema,
  responseSchema: userSchema,
  roles: [UserRoleValue.ADMIN]
});

// 3. Create your component
function UsersPanel() {
  // Fetch users
  const { 
    data: users, 
    isLoading,
    refetch
  } = useQuery(getUsersEndpoint);

  // Create a form with validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    submitForm,
    isSubmitting,
    formError
  } = useApiForm<User, CreateUser>(
    createUserEndpoint,
    { defaultValues: { name: '', email: '' } },
    { 
      onSuccess: () => refetch(),
      invalidateQueries: ['users']
    }
  );

  // Form submission handler
  const onSubmit = handleSubmit(data => submitForm(data));

  return (
    <div>
      <h1>Users</h1>
      
      {/* Display users */}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {users?.map(user => (
            <li key={user.id}>{user.name} - {user.email}</li>
          ))}
        </ul>
      )}

      {/* Create user form */}
      <form onSubmit={onSubmit}>
        <div>
          <label>
            Name:
            <input {...register('name', { required: true })} />
            {errors.name && <span>Name is required</span>}
          </label>
        </div>
        
        <div>
          <label>
            Email:
            <input type="email" {...register('email', { required: true })} />
            {errors.email && <span>Valid email is required</span>}
          </label>
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create User'}
        </button>
        
        {formError && <div className="error">{formError.message}</div>}
      </form>
    </div>
  );
}
```

## Advanced Usage

### Custom Data Provider

```tsx
import { initApiLibrary, DataProvider } from '@open-eats/next-portal';

// Create a custom data provider
class MyCustomDataProvider implements DataProvider {
  async getUserRoles(userId: string) {
    // Custom implementation for getting user roles
    return [];
  }
  
  // Additional custom methods
  async getCustomData() {
    // ...
  }
}

// Initialize with your custom provider
initApiLibrary({
  dataProvider: new MyCustomDataProvider()
});
```

### Global Error Handling

```tsx
import { initApiLibrary } from '@open-eats/next-portal';

initApiLibrary({
  errorHandler: (error, context) => {
    console.error(`Error in ${context}:`, error);
    // Send to error tracking service, show notification, etc.
  }
});
```

### Optimistic Updates

```tsx
const { mutate } = useMutation(updateUserEndpoint, {
  updateQueries: [
    {
      queryKey: ['users'],
      updater: (oldData, newData) => {
        // Update the cached data optimistically
        return oldData.map(user => 
          user.id === newData.id ? newData : user
        );
      }
    }
  ]
});
```

## API Reference

Visit our [API documentation](https://example.com/docs) for complete details on all available options and configurations.

## License

MIT