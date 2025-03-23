# Next Query Portal Template

A comprehensive starter template for building Next.js applications with strongly typed API endpoints, leveraging the next-query-portal framework.

## Overview

This template provides a complete development environment for creating Next.js applications with type-safe, validated API endpoints. It includes the next-query-portal package, which delivers strongly typed APIs, role-based access control, data providers, and client-side hooks.

## Features

- **Strongly Typed APIs**: Define endpoints with full TypeScript support and Zod validation
- **Role-Based Access Control**: Built-in user role management and authorization
- **Data Providers**: Flexible data access with Prisma integration
- **Client Hooks**: React hooks for data fetching and mutation
- **Form Integration**: Form handling with validation and API integration
- **Cross-Platform**: Works with both browser and React Native environments

## Getting Started

### Fork This Repository

Start by forking this repository to use as your project foundation. This allows you to:
- Begin development immediately with all configurations in place
- Easily merge updates when new versions are released
- Customize the template to fit your specific project needs

### Installation

```bash
# Clone your forked repository
git clone https://github.com/your-username/next-portal.git
cd next-portal

# Install dependencies
yarn install
```

### Environment Setup

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the .env file to configure your environment variables.

### Development

```bash
# Start the development server
yarn run dev
```

### Building

```bash
# Build the application
yarn run build
```

## Using next-query-portal

This template offers two ways to use the next-query-portal package:

### 1. Local Package (default)

The package is included in the [./src/packages/next-query-portal](./src/packages/next-query-portal) directory. This approach allows you to:
- Directly modify the package code if needed
- Debug and step through the package code
- Make local customizations

Configure in next.portal.config.ts:
```typescript
export default {
  useNextQueryPortalPackage: false
};
```

### 2. NPM Package

Alternatively, you can use the published npm package:

```bash
TODO handle removing the next-query-portal before installing package version
yarn add next-query-portal
```

And update next.portal.config.ts:
```typescript
export default {
  useNextQueryPortalPackage: true
};
```

## Project Structure

```
├── src/
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   ├── config/         # Application configuration
│   ├── hooks/          # Custom React hooks
│   └── packages/       # Local packages including next-query-portal
├── prisma/
│   └── schema.prisma   # Prisma database schema
├── .env.example        # Example environment variables
├── next.config.ts      # Next.js configuration
└── next.portal.config.ts # Portal-specific configuration
```

## Creating API Endpoints

This template includes a ready-to-use API endpoint example in the `src/app/api/template-api` directory. Explore this folder to see a complete implementation with schemas, endpoint definition, and even email integration:

- **definition.ts**: Defines the API endpoint configuration
- **schema.ts**: Contains Zod schemas for request/response validation
- **email.tsx**: Example of how to integrate email sending with your API

### Creating Your Own Endpoint

To create a new API endpoint, follow this structure:

1. **Define your schemas** (similar to `schema.ts`):
```typescript
import { z } from 'zod';

export const userCreateRequestSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please provide a valid email" }),
});

export const userCreateResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
});

// Export types derived from schemas
export type UserCreateRequestType = z.infer<typeof userCreateRequestSchema>;
export type UserCreateResponseType = z.infer<typeof userCreateResponseSchema>;
```

2. **Create the endpoint definition** (similar to `definition.ts`):
```typescript
import { createEndpoint } from "next-query-portal/client";
import { UserRoleValue } from "next-query-portal/shared";
import { userCreateRequestSchema, userCreateResponseSchema } from "./schema";

export default createEndpoint({
  description: "Create a new user",
  method: "POST",
  requestSchema: userCreateRequestSchema,
  responseSchema: userCreateResponseSchema,
  requestUrlSchema: z.undefined(), // No URL parameters for this endpoint
  apiQueryOptions: {
    queryKey: ["users", "create"],
  },
  fieldDescriptions: {
    name: "User's full name",
    email: "User's email address",
  },
  allowedRoles: [UserRoleValue.ADMIN], // Only admins can create users
  errorCodes: {
    400: "Invalid request data",
    409: "Email already in use",
    500: "Internal server error",
  },
  dirname: __dirname,
  examples: {
    payloads: {
      default: {
        name: "John Doe",
        email: "john@example.com",
      },
    },
  },
});
```

3. **Implement the route handler** (in `route.ts`):
```typescript
import { apiHandler } from "next-query-portal/server";
import { db } from "../../db";
import endpoint from "./definition";
import type { UserCreateRequestType, UserCreateResponseType } from "./schema";

export const POST = apiHandler<UserCreateRequestType, UserCreateResponseType>(
  endpoint,
  async ({ requestData, user }) => {
    // Create user in database
    const newUser = await db.user.create({
      data: {
        name: requestData.name,
        email: requestData.email,
        createdById: user.id,
      },
    });
    
    // Return created user data
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  }
);
```

The template automatically discovers your endpoints and generates type definitions, making them available throughout your application.

### Using Your Endpoint in Frontend Components

```tsx
import { useApiForm } from "next-query-portal/client";
import { endpoints } from "@/app/api/generated/endpoints";

function CreateUserForm() {
  const {
    register,
    handleSubmit,
    formState,
    submitForm,
    isSubmitting,
    errorMessage
  } = useApiForm(endpoints.users.create);
  
  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <div>
        <label>Name</label>
        <input {...register('name')} />
        {formState.errors.name && (
          <p>{formState.errors.name.message}</p>
        )}
      </div>
      
      <div>
        <label>Email</label>
        <input {...register('email')} />
        {formState.errors.email && (
          <p>{formState.errors.email.message}</p>
        )}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Create User"}
      </button>
      
      {errorMessage && <p>{errorMessage}</p>}
    </form>
  );
}
```

## Deployment

### Deploying to Vercel

This template is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Deploy with the default settings (Vercel automatically detects Next.js)

```bash
# Or deploy via Vercel CLI
npm install -g vercel
vercel
```

### Other Deployment Options

- **Docker**: Use the included Dockerfile for containerized deployments
- **Node.js Server**: Build and run on any Node.js hosting platform
- **Static Export**: For simple applications, use `next export` for static site generation

## Updating

When new versions of the template or next-query-portal are released:

1. Add the original repository as a remote:
```bash
git remote add upstream https://github.com/techfreaque/next-query-portal.git
```

2. Fetch the latest changes:
```bash
git fetch upstream
```

3. Merge changes (resolve conflicts as needed):
```bash
git merge upstream/main
```

## License

- Template App: MIT
- next-query-portal Package: GPL-3.0-only

## Resources

- [GitHub Repository](https://github.com/techfreaque/next-query-portal)
- [Issue Tracker](https://github.com/techfreaque/next-query-portal/issues)