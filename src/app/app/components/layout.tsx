"use client";
import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import type { JSX } from "react";

import { Badge } from "@/components/ui";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";

import { Trans, useTranslation } from "./lib/i18n";
import { LocationSelector } from "./location-selector";
import { MainNav } from "./main-nav";

export default function RootLayout({
  children,
  withSubMain = true,
}: {
  children: React.ReactNode;
  withSubMain?: boolean;
}): JSX.Element {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col ">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container py-2 m-auto">
          <MainNav />
        </div>
      </header>
      <main>
        {withSubMain ? (
          <section className="bg-muted py-2 border-b">
            <div className="container flex justify-between items-center text-sm text-muted-foreground m-auto">
              <div className="flex items-center space-x-4">
                <span className="flex items-center gap-1">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Free
                  </Badge>
                  No service fees
                </span>
                <span className="flex items-center gap-1">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    Open
                  </Badge>
                  Open source platform
                </span>
              </div>
              <LocationSelector onLocationChange={() => {}} />
            </div>
          </section>
        ) : (
          <></>
        )}
        <div>{children}</div>

        <Toaster />
      </main>
      <footer className="w-full border-t bg-background py-6">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍔</span>
                <span className="text-lg font-semibold">
                  {t("common.appName")}
                </span>
                <Badge variant="outline" className="text-xs">
                  {t("common.openSource")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                A free and open source food delivery platform for local
                communities.
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href="https://github.com/openeats"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("home.footer.about")}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/app/about"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t("home.footer.ourMission")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/about"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t("home.footer.howItWorks")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/about"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t("home.footer.community")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/about"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t("home.footer.contribute")}
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {t("home.footer.forPartners")}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/app/create-restaurant"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t("home.footer.joinAsRestaurant")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/partners"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t("home.footer.partnerBenefits")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/partners"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t("home.footer.successStories")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/partners"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t("home.footer.partnerPortal")}
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {t("home.footer.forDrivers")}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/app/drivers"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t("home.footer.becomeDriver")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/drivers"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t("home.footer.driverApp")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/drivers"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t("home.footer.earnings")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/drivers"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t("home.footer.driverSupport")}
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {t("home.footer.downloadApp")}
              </h3>
              <div className="flex flex-col gap-2">
                <Link href="#">
                  <Image
                    src="/placeholder.svg?height=40&width=120"
                    alt="App Store"
                    width={120}
                    height={40}
                    className="rounded-md"
                  />
                </Link>
                <Link href="#">
                  <Image
                    src="/placeholder.svg?height=40&width=120"
                    alt="Google Play"
                    width={120}
                    height={40}
                    className="rounded-md"
                  />
                </Link>
              </div>
              <div className="rounded-md bg-muted p-3 text-xs">
                <p className="font-medium">{t("home.footer.noHiddenFees")}</p>
                <p className="mt-1 text-muted-foreground">
                  {t("home.footer.feeDescription")}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t pt-6">
            <p className="text-center text-xs text-muted-foreground">
              <Trans
                i18nKey="home.footer.copyright"
                values={{ year: new Date().getFullYear() }}
              />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
