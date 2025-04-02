"use client";

import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "next-vibe/i18n";
import { APP_NAME } from "next-vibe/shared/constants";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="flex-1">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                {t("about.header.title", { appName: APP_NAME })}
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                {t("about.header.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="text-3xl font-bold">{t("about.mission.title")}</h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                {t("about.mission.paragraph1", { appName: APP_NAME })}
              </p>
              <p className="mt-4 text-muted-foreground md:text-lg">
                {t("about.mission.paragraph2")}
              </p>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt={t("about.mission.imageAlt")}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("about.orderTypes.title")}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  🚚
                </div>
                <h3 className="text-xl font-bold">
                  {t("about.orderTypes.delivery.title")}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {t("about.orderTypes.delivery.description")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  🥡
                </div>
                <h3 className="text-xl font-bold">
                  {t("about.orderTypes.pickup.title")}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {t("about.orderTypes.pickup.description")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  🍽️
                </div>
                <h3 className="text-xl font-bold">
                  {t("about.orderTypes.table.title")}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {t("about.orderTypes.table.description")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt={t("about.business.imageAlt")}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                {t("about.business.title")}
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                {t("about.business.description", { appName: APP_NAME })}
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <p>
                    <strong>{t("about.business.features.basic.title")}:</strong>{" "}
                    {t("about.business.features.basic.value")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <p>
                    <strong>
                      {t("about.business.features.delivery.title")}:
                    </strong>{" "}
                    {t("about.business.features.delivery.value")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <p>
                    <strong>
                      {t("about.business.features.payments.title")}:
                    </strong>{" "}
                    {t("about.business.features.payments.value")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("about.stakeholders.title")}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  👨‍🍳
                </div>
                <h3 className="text-xl font-bold">
                  {t("about.stakeholders.restaurants.title")}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {t("about.stakeholders.restaurants.description")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  🧑‍💻
                </div>
                <h3 className="text-xl font-bold">
                  {t("about.stakeholders.customers.title")}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {t("about.stakeholders.customers.description")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  🚗
                </div>
                <h3 className="text-xl font-bold">
                  {t("about.stakeholders.drivers.title")}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {t("about.stakeholders.drivers.description")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="text-3xl font-bold">
                {t("about.opensource.title")}
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                {t("about.opensource.paragraph1", { appName: APP_NAME })}
              </p>
              <p className="mt-4 text-muted-foreground md:text-lg">
                {t("about.opensource.paragraph2")}
              </p>
              <div className="mt-6">
                <Button variant="outline" className="gap-2">
                  <Github className="h-5 w-5" />
                  {t("about.opensource.githubButton")}
                </Button>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt={t("about.opensource.imageAlt")}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">{t("about.join.title")}</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                {t("about.join.description", { appName: APP_NAME })}
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
              <Button asChild>
                <Link href="/app/restaurants">
                  {t("about.join.buttons.order")}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/app/partners">
                  {t("about.join.buttons.restaurant")}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/app/drivers">
                  {t("about.join.buttons.driver")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
