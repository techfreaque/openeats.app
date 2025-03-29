"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "next-query-portal/i18n";
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
  const { t } = useTranslation();

  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      router.push("/");
    }
  }, [router, isLoggedIn, isLoading]);
  return (
    <>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {t("auth.login.title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t("auth.login.subtitle")}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("auth.login.noAccount")}{" "}
          <Link
            href="/auth/public/signup"
            className="font-medium text-primary hover:underline"
          >
            {t("auth.login.createAccount")}
          </Link>
        </p>
      </div>

      {loginForm.errorMessage && (
        <div className="p-4 text-sm text-white bg-red-500 rounded-md">
          {loginForm.errorMessage.split("\n").map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
      )}

      <Form {...loginForm.form}>
        <form onSubmit={loginForm.submitForm} className="space-y-6" noValidate>
          <FormField
            control={loginForm.form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.login.emailLabel")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("auth.login.emailPlaceholder")}
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
                <FormLabel>{t("auth.login.passwordLabel")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("auth.login.passwordPlaceholder")}
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
            {loginForm.isSubmitting
              ? t("common.loading")
              : t("auth.login.loginButton")}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" asChild>
        <Link href="/auth/public/signup">{t("auth.signup.title")}</Link>
      </Button>

      <div className="mt-6 p-5 border rounded-md bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">Demo Credentials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-md shadow-sm">
            <div className="font-medium text-primary">Admin</div>
            <code className="block mt-1 text-sm p-2 bg-gray-100 rounded">
              admin@example.com
            </code>
            <code className="block mt-1 text-sm p-2 bg-gray-100 rounded">
              password
            </code>
          </div>
          <div className="p-3 bg-white rounded-md shadow-sm">
            <div className="font-medium text-primary">Customer</div>
            <code className="block mt-1 text-sm p-2 bg-gray-100 rounded">
              customer@example.com
            </code>
            <code className="block mt-1 text-sm p-2 bg-gray-100 rounded">
              password
            </code>
          </div>
          <div className="p-3 bg-white rounded-md shadow-sm">
            <div className="font-medium text-primary">Restaurant</div>
            <code className="block mt-1 text-sm p-2 bg-gray-100 rounded">
              restaurant@example.com
            </code>
            <code className="block mt-1 text-sm p-2 bg-gray-100 rounded">
              password
            </code>
          </div>
          <div className="p-3 bg-white rounded-md shadow-sm">
            <div className="font-medium text-primary">Driver</div>
            <code className="block mt-1 text-sm p-2 bg-gray-100 rounded">
              driver@example.com
            </code>
            <code className="block mt-1 text-sm p-2 bg-gray-100 rounded">
              password
            </code>
          </div>
        </div>
      </div>
    </>
  );
}
