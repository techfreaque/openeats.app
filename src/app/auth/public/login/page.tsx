"use client";

import { useRouter } from "next/navigation";
import { useApiForm } from "next-query-portal/client";
import type { FC } from "react";
import { useEffect } from "react";

import { loginEndpoint } from "../../../api/auth/public/login/login";

const LoginPage: FC = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Login
        </h1>
        <LoginForm />
      </div>
    </div>
  );
};

const LoginForm: FC = () => {
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formError,
    isSubmitting,
    formState: { errors },
  } = useApiForm(
    loginEndpoint,
    {},
    {
      onSuccess: async (data) => {
        if (data.token && data.user) {
          await login(data);
          router.push("/");
        }
      },
    },
  );

  return (
    <form
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit((data) => login(data))}
      className="mt-8 space-y-6"
    >
      {formError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {formError.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          {...register("email")}
          required
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${
            errors.email ? "border-red-300" : "border-gray-300"
          }`}
        />
        {errors.email && (
          <div className="mt-1 text-sm text-red-600">
            {errors.email.message}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          {...register("password")}
          required
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${
            errors.password ? "border-red-300" : "border-gray-300"
          }`}
        />
        {errors.password && (
          <div className="mt-1 text-sm text-red-600">
            {errors.password.message}
          </div>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </div>
      <div>
        ### Credentials
        <li>- Admin: admin@example.com / password</li>
        <li>- Customer: customer@example.com / password</li>
        <li>- Restaurant: restaurant@example.com / password</li>
        <li>- Driver: driver@example.com / password</li>
      </div>
    </form>
  );
};

export default LoginPage;
