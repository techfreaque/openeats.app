"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApiForm } from "next-query-portal/client";
import type { JSX } from "react";

import { registerEndpoint } from "../../../api/auth/public/register/definition";

export default function SignupPage(): JSX.Element {
  const { signup } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formError,
    isSubmitting,
    formState: { errors },
  } = useApiForm(
    registerEndpoint,
    {
      defaultValues: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        imageUrl: "",
      },
    },
    {
      onSuccess: async (data) => {
        if (data.token) {
          await signup({
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            email: data.user.email,
            password: "", // Password was already used and is not returned
            confirmPassword: "",
            imageUrl: data.user.imageUrl || "",
          });
          router.push(backendPages.login);
        }
      },
    },
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
        </div>

        {formError && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {formError.message}
                </h3>
              </div>
            </div>
          </div>
        )}

        <form
          className="mt-8 space-y-6"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit((data) => signup(data))}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                id="firstName"
                {...register("firstName")}
                type="text"
                className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ${
                  errors.firstName ? "ring-red-300" : "ring-gray-300"
                } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
              />
              {errors.firstName && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                id="lastName"
                {...register("lastName")}
                type="text"
                className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ${
                  errors.lastName ? "ring-red-300" : "ring-gray-300"
                } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
              />
              {errors.lastName && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                {...register("email")}
                type="email"
                className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ${
                  errors.email ? "ring-red-300" : "ring-gray-300"
                } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                {...register("password")}
                type="password"
                className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ${
                  errors.password ? "ring-red-300" : "ring-gray-300"
                } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                {...register("confirmPassword")}
                type="password"
                className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ${
                  errors.confirmPassword ? "ring-red-300" : "ring-gray-300"
                } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </div>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/public/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
