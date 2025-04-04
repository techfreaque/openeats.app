"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApiForm } from "next-vibe/client/hooks/mutation-form";
import { useTranslation } from "next-vibe/i18n";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { type JSX, useEffect } from "react";

import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";
import restaurantEndpoint from "@/app/api/v1/restaurant/definition";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function NewRestaurantPage(): JSX.Element {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const formData = useApiForm(
    restaurantEndpoint.POST,
    {},
    {
      onSuccess: ({ responseData }) => {
        router.push(`/app/restaurant/${responseData.id}`);
      },
      onError: (error) => {
        formData.form.setError("root", {
          type: "custom",
          message: error.message,
        });
      },
    },
  );

  useEffect(() => {
    if (user?.id) {
      formData.form.setValue("userRoles", [
        {
          userId: user.id,
          role: UserRoleValue.PARTNER_ADMIN,
        },
      ]);
    }
  }, [formData.form, user?.id]);

  const { t } = useTranslation();

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/auth/public/login?redirect=/app/restaurant/new");
    }
  }, [router, user, isLoading]);

  // Mock data for countries and categories - in a real app you would fetch these
  const countries = [
    { id: "550e8400-e29b-41d4-a716-446655440000", name: "United States" },
    { id: "550e8400-e29b-41d4-a716-446655440001", name: "Canada" },
    { id: "550e8400-e29b-41d4-a716-446655440002", name: "United Kingdom" },
  ];

  const categories = [
    { id: "550e8400-e29b-41d4-a716-446655440003", name: "Fast Food" },
    { id: "550e8400-e29b-41d4-a716-446655440004", name: "Italian" },
    { id: "550e8400-e29b-41d4-a716-446655440005", name: "Asian" },
    { id: "550e8400-e29b-41d4-a716-446655440006", name: "Mexican" },
  ];

  return user?.id ? (
    <div className="container max-w-3xl py-10">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {t("restaurant.new.title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t("restaurant.new.subtitle")}
        </p>
      </div>

      {formData.errorMessage && (
        <div className="p-4 text-sm text-white bg-red-500 rounded-md mb-6">
          {formData.errorMessage.split("\n").map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
      )}

      <Form {...formData.form}>
        <form
          onSubmit={(event) =>
            formData.submitForm(event, { urlParamVariables: undefined })
          }
          className="space-y-8"
          noValidate
        >
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {t("restaurant.new.sections.basic")}
            </h2>

            <FormField
              control={formData.form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("restaurant.new.fields.name.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("restaurant.new.fields.name.placeholder")}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formData.form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("restaurant.new.fields.description.label")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "restaurant.new.fields.description.placeholder",
                      )}
                      className="min-h-[120px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formData.form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("restaurant.new.fields.image.label")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("restaurant.new.fields.image.placeholder")}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {t("restaurant.new.sections.contact")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={formData.form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("restaurant.new.fields.email.label")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t(
                          "restaurant.new.fields.email.placeholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formData.form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("restaurant.new.fields.phone.label")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "restaurant.new.fields.phone.placeholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {t("restaurant.new.sections.address")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={formData.form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("restaurant.new.fields.street.label")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "restaurant.new.fields.street.placeholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formData.form.control}
                name="streetNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("restaurant.new.fields.streetNumber.label")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "restaurant.new.fields.streetNumber.placeholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={formData.form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("restaurant.new.fields.city.label")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "restaurant.new.fields.city.placeholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formData.form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("restaurant.new.fields.zip.label")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("restaurant.new.fields.zip.placeholder")}
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
              control={formData.form.control}
              name="countryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("restaurant.new.fields.country.label")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "restaurant.new.fields.country.placeholder",
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {t("restaurant.new.sections.category")}
            </h2>

            <FormField
              control={formData.form.control}
              name="mainCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("restaurant.new.fields.mainCategory.label")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "restaurant.new.fields.mainCategory.placeholder",
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={formData.isSubmitting}
            >
              {formData.isSubmitting
                ? t("restaurant.new.buttons.creating")
                : t("restaurant.new.buttons.create")}
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/app">{t("restaurant.new.buttons.cancel")}</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  ) : (
    <></>
  );
}
