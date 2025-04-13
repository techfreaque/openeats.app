# API Documentation

This folder contains the API implementation for the Open Delivery platform.

## Structure

The API is organized into the following structure:

```
src/app/api/
├── db/                 # Database connection and utilities
│   ├── index.ts        # Database client
│   ├── repository.ts   # Base repository pattern
│   └── types.ts        # Common database types
├── v1/                 # API version 1
│   ├── auth/           # Authentication endpoints
│   │   ├── me/         # User profile endpoints
│   │   ├── public/     # Public authentication endpoints
│   │   ├── roles/      # User roles endpoints
│   │   └── sessions/   # Session management endpoints
│   ├── drivers/        # Driver management endpoints
│   └── ...             # Other domain-specific endpoints
└── ...                 # Other API versions
```

## Design Principles

1. **Domain-Driven Design**: Each domain has its own folder with its own schema, repository, and route handlers.
2. **Repository Pattern**: Database access is abstracted through repositories.
3. **Type Safety**: All code is strongly typed with explicit return types.
4. **Separation of Concerns**: Business logic is separated from data access and route handling.

## Database Access

Database access is implemented using the Drizzle ORM. Each domain has its own schema file (e.g., `users.db.ts`) that defines the table structure and validation schemas.

### Repository Pattern

The repository pattern is used to abstract database access. Each domain has its own repository that extends the base repository implementation.

Example:

```typescript
// Base repository
export interface BaseRepository<T, TSelect, TInsert, TSchema> {
  findAll(): Promise<TSelect[]>;
  findById(id: DbId): Promise<TSelect | undefined>;
  create(data: TInsert): Promise<TSelect>;
  update(id: DbId, data: Partial<TInsert>): Promise<TSelect | undefined>;
  delete(id: DbId): Promise<boolean>;
  validate(data: unknown): ZodInfer<TSchema>;
}

// Domain-specific repository
export interface UserRepository extends BaseRepository<...> {
  findByEmail(email: string): Promise<User | undefined>;
  // ...
}
```

## API Endpoints

API endpoints are defined using the Next.js App Router. Each endpoint has a route handler that implements the business logic.

### Route Handlers

Route handlers are responsible for:

1. Validating input data
2. Checking authorization
3. Calling the appropriate repository methods
4. Formatting the response

Example:

```typescript
export const getDrivers: ApiHandlerFunction<
  UndefinedType,
  Array<Driver & { user: { ... } }>,
  UndefinedType
> = async ({ user }) => {
  try {
    // Check authorization
    // ...

    // Get data from repository
    const drivers = await driverRepository.findAllWithUsers();

    // Format response
    const formattedDrivers = drivers.map((driver) => ({
      ...driver,
      createdAt: driver.createdAt.toISOString(),
      updatedAt: driver.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: formattedDrivers,
    };
  } catch (error) {
    // Handle errors
    // ...
  }
};
```

## Authentication and Authorization

Authentication is handled through JWT tokens stored in sessions. User roles are stored in the database and checked for each request.

## Error Handling

Errors are handled consistently across all endpoints. Each endpoint returns a standardized error response with a message and error code.

## Validation

Input validation is performed using Zod schemas. Each endpoint has a schema that defines the expected input data.

## Testing

Unit tests are written for each repository and route handler. Integration tests are written for each endpoint.

## Migrations

Database migrations are managed using Drizzle Kit. Migration files are stored in the `drizzle` folder at the root of the project.
