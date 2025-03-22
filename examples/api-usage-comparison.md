# API Usage Comparison

This document compares two approaches to using the API library in this project.

## Working Example: `user-management.tsx`

The first example (`user-management.tsx`) works correctly because:

1. It uses proper import paths from specific modules:
   ```typescript
   import { createEndpoint } from "../src/api/endpoints/core/endpoint";
   import { initApiLibrary } from "../src/api/endpoints/core/init-api-library";
   import { useApiForm } from "../src/client/hooks/form/api-form";
   import { useQuery } from "../src/client/hooks/query/use-query";
   ```

2. It correctly implements endpoint creation with the full parameter structure:
   ```typescript
   const getUsersEndpoint = createEndpoint<UndefinedType, Users, UndefinedType>({
     // ...
     allowedRoles: [UserRoleValue.ADMIN],
     requestSchema: undefinedSchema,
     requestUrlSchema: undefinedSchema,
     // ...
   });
   ```

3. It properly handles promises with `void` operator:
   ```typescript
   <button onClick={() => void refetch()}>Refresh</button>
   ```

## Non-working Example: `simplified-usage.tsx`

The second example (`simplified-usage.tsx`) doesn't work because:

1. It uses an invalid import path with a `.nope` extension:
   ```typescript
   import { /* ... */ } from "../src/index.ts.nope";
   ```

2. It uses simplified parameter names that don't match the actual API:
   ```typescript
   const getUsersEndpoint = createEndpoint({
     // ...
     roles: [UserRoleValue.ADMIN], // Should be 'allowedRoles'
     queryOptions: {              // Should be 'apiQueryOptions'
       staleTime: 30000,
     },
   });
   ```

3. It's missing required schema parameters like `requestSchema`, `requestUrlSchema` for the GET endpoint.

## Key Differences

| Feature | Working Example | Non-working Example |
|---------|----------------|-------------------|
| Imports | Specific module paths | Invalid barrel import |
| Type Parameters | Explicitly defined | Not provided |
| Role Parameter | `allowedRoles` | `roles` (incorrect) |
| Required Schemas | All schemas provided | Some schemas missing |
| Promise Handling | Uses `void` operator | Direct usage |

## Recommendations

When using this API library:
1. Use the specific import paths as shown in the working example
2. Always provide all required schema parameters
3. Use the correct parameter names as defined in the API
4. Handle promises properly with the `void` operator where appropriate
