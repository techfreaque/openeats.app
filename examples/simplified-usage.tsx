import { z } from "zod";

import {
  createEndpoint,
  initApiLibrary,
  useApiForm,
  useQuery,
  UserRoleValue,
} from "../src/server/index.js";

// Initialize the API library
initApiLibrary();

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

// Create endpoints with simplified factory
const getUsersEndpoint = createEndpoint({
  description: "Get all users",
  method: "GET",
  path: ["v1", "users"],
  roles: [UserRoleValue.ADMIN],
  responseSchema: z.array(userSchema),
  queryOptions: {
    staleTime: 30000,
  },
});

const createUserEndpoint = createEndpoint({
  description: "Create a new user",
  method: "POST",
  path: ["v1", "users"],
  roles: [UserRoleValue.ADMIN],
  requestSchema: createUserSchema,
  responseSchema: userSchema,
  fieldDescriptions: {
    name: "User's full name",
    email: "User's email address",
    role: "User's role in the system",
  },
  examples: {
    request: {
      name: "John Doe",
      email: "john@example.com",
      role: "CUSTOMER",
    },
  },
});

// Component using the API
function UserManagement() {
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
  } = useApiForm<User, CreateUser>(
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
        refetch();
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
        <button onClick={() => refetch()}>Refresh</button>
      </div>

      <div className="create-user-form">
        <h2>Create New User</h2>
        {formError && (
          <div className="form-error">
            Error: {formError.message}
            <button onClick={clearFormError}>Clear</button>
          </div>
        )}

        <form onSubmit={onSubmit}>
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
