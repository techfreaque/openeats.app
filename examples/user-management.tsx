import type { JSX } from "react";
import { z } from "zod";

import { useApiForm } from "../src/client/hooks/form/api-form";
import { useQuery } from "../src/client/hooks/query/use-query";
import { createEndpoint } from "../src/server/endpoints/core/endpoint";
import { initApiLibrary } from "../src/server/endpoints/core/init-api-library";
import type { UndefinedType } from "../src/shared/types/common.schema";
import { undefinedSchema } from "../src/shared/types/common.schema";
import { UserRoleValue } from "../src/shared/types/enums";

// Initialize the API library
initApiLibrary({
  useMockProvider: true, // Use mock provider for this example
  mockData: {
    // Sample mock data
    "admin-user-id": [{ id: "1", role: "ADMIN", restaurantId: null }],
  },
});

// Define your schemas
const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
});

const createUserSchema = userSchema.omit({ id: true });
type User = z.infer<typeof userSchema>;
type CreateUser = z.infer<typeof createUserSchema>;
const usersSchema = z.array(userSchema);
type Users = z.infer<typeof usersSchema>;
// Create endpoints
const getUsersEndpoint = createEndpoint<UndefinedType, Users, UndefinedType>({
  description: "Get all users",
  method: "GET",
  path: ["v1", "users"],
  allowedRoles: [UserRoleValue.ADMIN],
  responseSchema: usersSchema,
  apiQueryOptions: {
    staleTime: 30000,
  },
  requestSchema: undefinedSchema,
  requestUrlSchema: undefinedSchema,
  fieldDescriptions: undefined,
  errorCodes: {
    "500": "Internal server error",
  },
  examples: {
    urlPathVariables: undefined,
    payloads: undefined,
  },
});

const createUserEndpoint = createEndpoint<CreateUser, User, UndefinedType>({
  description: "Create a new user",
  method: "POST",
  path: ["v1", "users"],
  allowedRoles: [UserRoleValue.ADMIN],
  requestSchema: createUserSchema,
  responseSchema: userSchema,
  apiQueryOptions: {
    staleTime: 30000,
  },
  requestUrlSchema: undefinedSchema,
  fieldDescriptions: {
    name: "User's full name",
    email: "User's email address",
    role: "User's role",
  },
  errorCodes: {
    "500": "Internal server error",
  },
  examples: {
    payloads: {
      default: {
        id: "1",
        name: "John Doe",
        email: "",
        role: "CUSTOMER",
      },
    },
    urlPathVariables: undefined,
  },
});

// Component using the API
function UserManagement(): JSX.Element {
  // Fetch users with simplified query hook
  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
    isCachedData,
  } = useQuery(getUsersEndpoint, {
    queryKey: ["users"],
  });

  // Create user with simplified form hook
  const {
    register,
    handleSubmit,
    formState: { errors },
    submitForm,
    isSubmitting,
    formError,
    clearFormError,
  } = useApiForm(
    createUserEndpoint,
    {
      defaultValues: {
        name: "",
        email: "",
        role: "CUSTOMER",
      },
    },
    {
      onSuccess: () => {
        void refetch();
      },
      invalidateQueries: ["users"],
    },
  );

  // Handle form submission
  const onSubmit = handleSubmit((data) => {
    void submitForm(data);
  });

  return (
    <div className="container">
      <h1>User Management</h1>

      {isCachedData && <div className="notice">Showing cached data</div>}

      {isLoading && <div className="loading">Loading users...</div>}

      {isError && (
        <div className="error">Error loading users: {error?.message}</div>
      )}

      <div className="user-list">
        <h2>Users</h2>
        <ul>
          {users?.map((user) => (
            <li key={user.id}>
              {user.name} ({user.email}) - {user.role}
            </li>
          ))}
        </ul>
        <button onClick={() => void refetch()}>Refresh</button>
      </div>

      <div className="create-user-form">
        <h2>Create New User</h2>
        {formError && (
          <div className="form-error">
            Error: {formError.message}
            <button onClick={clearFormError}>Clear</button>
          </div>
        )}
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={onSubmit}
        >
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input id="name" {...register("name", { required: true })} />
            {errors.name && <span className="error">Name is required</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register("email", { required: true })}
            />
            {errors.email && (
              <span className="error">Valid email is required</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" {...register("role")}>
              <option value="CUSTOMER">Customer</option>
              <option value="ADMIN">Admin</option>
              <option value="DRIVER">Driver</option>
              <option value="RESTAURANT_ADMIN">Restaurant Admin</option>
              <option value="RESTAURANT_EMPLOYEE">Restaurant Employee</option>
            </select>
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserManagement;
