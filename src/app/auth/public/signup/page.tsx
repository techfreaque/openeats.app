"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trans, useTranslation } from "next-vibe/i18n";
import { type JSX, useEffect } from "react";

import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";
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

export default function SignupPage(): JSX.Element {
  const router = useRouter();
  const { isLoggedIn, isLoading, signupForm } = useAuth();
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
          {t("auth.signup.title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t("auth.signup.subtitle")}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("auth.signup.alreadyHaveAccount")}{" "}
          <Link
            href="/auth/public/login"
            className="font-medium text-primary hover:underline"
          >
            {t("auth.signup.signIn")}
          </Link>
        </p>
      </div>

      {signupForm.errorMessage && (
        <div className="p-4 text-sm text-white bg-red-500 rounded-md">
          {signupForm.errorMessage.split("\n").map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
      )}

      <Form {...signupForm.form}>
        <form
          onSubmit={(event) =>
            signupForm.submitForm(event, { urlParamVariables: undefined })
          }
          className="space-y-6"
          noValidate
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={signupForm.form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.signup.firstNameLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("auth.signup.firstNamePlaceholder")}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={signupForm.form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.signup.lastNameLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("auth.signup.lastNamePlaceholder")}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={signupForm.form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signup.emailLabel")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("auth.signup.emailPlaceholder")}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={signupForm.form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signup.passwordLabel")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("auth.signup.passwordPlaceholder")}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={signupForm.form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signup.confirmPasswordLabel")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("auth.signup.confirmPasswordPlaceholder")}
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
            disabled={signupForm.isSubmitting}
          >
            {signupForm.isSubmitting
              ? t("common.loading")
              : t("auth.signup.createAccountButton")}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">
            <Trans i18nKey="auth.signup.or" />
          </span>
        </div>
      </div>

      <Button variant="outline" className="w-full" asChild>
        <Link href="/auth/public/login">
          {t("auth.signup.alreadyHaveAccount")}
        </Link>
      </Button>
    </>
  );
}
