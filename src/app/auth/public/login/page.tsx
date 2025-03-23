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
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Login
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        {loginForm.formError && (
          <div className="p-3 text-sm text-white bg-red-500 rounded">
            {loginForm.formError.message}
          </div>
        )}

        <Form {...loginForm.form}>
          <form onSubmit={loginForm.handleSubmit} className="space-y-6">
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
      </div>
    </div>
  );
}
