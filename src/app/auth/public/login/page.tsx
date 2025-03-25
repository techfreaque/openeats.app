"use client";

import { useRouter } from "next/navigation";
import type { JSX } from "react";
import React, { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const { isLoggedIn, isLoading, loginForm } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      router.push("/");
    }
  }, [router, isLoggedIn, isLoading]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Login
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        {loginForm.errorMessage && (
          <div className="p-3 text-sm text-white bg-red-500 rounded">
            {loginForm.errorMessage.split("\n").map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </div>
        )}

        <Form {...loginForm.form}>
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={loginForm.submitForm}
            className="space-y-6"
            // Add noValidate to prevent browser validation
            noValidate
          >
            <FormField
              control={loginForm.form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={loginForm.form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loginForm.isSubmitting}
            >
              {loginForm.isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 p-4 border rounded-md bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Demo Credentials</h2>
          <ul className="space-y-1 text-sm">
            <li>
              Admin:{" "}
              <code className="p-1 bg-gray-200 rounded">
                admin@example.com / password
              </code>
            </li>
            <li>
              Customer:{" "}
              <code className="p-1 bg-gray-200 rounded">
                customer@example.com / password
              </code>
            </li>
            <li>
              Restaurant:{" "}
              <code className="p-1 bg-gray-200 rounded">
                restaurant@example.com / password
              </code>
            </li>
            <li>
              Driver:{" "}
              <code className="p-1 bg-gray-200 rounded">
                driver@example.com / password
              </code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
