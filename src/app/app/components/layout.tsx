"use client";
import { Github, PlayCircle } from "lucide-react";
import Link from "next/link";
import { Trans, useTranslation } from "next-vibe/i18n";
import type React from "react";
import type { JSX } from "react";

import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";
import { Badge } from "@/components/ui";
import { Toaster } from "@/components/ui/toaster";

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
      <footer className="w-full border-t bg-background/95 py-12">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-10 lg:grid-cols-6">
            {/* Logo and About Column - Spans 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🍔</span>
                <div className="flex flex-col">
                  <span className="text-xl font-bold">
                    {t("common.appName")}
                  </span>
                  <Badge variant="outline" className="text-xs mt-0.5">
                    {t("common.openSource")}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground max-w-xs">
                A free and open source food delivery platform for local
                communities. No hidden fees, completely transparent, and
                community-driven.
              </p>

              {/* Download Apps Section with regular icons */}
              <div className="space-y-4 pt-4">
                <h3 className="text-base font-semibold">
                  {t("home.footer.downloadApp")}
                </h3>
                <div className="flex gap-3">
                  <Link
                    href="#"
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 112.285 133.477"
                    >
                      <g fill-rule="evenodd" clip-rule="evenodd">
                        <path
                          d="M103.357 116.784c-2.448 4.032-4.896 7.056-7.848 9.863-3.312 2.952-4.248 5.544-11.88 6.553-5.4 1.008-10.08-1.009-11.88-1.8-5.4-2.521-8.209-3.312-11.448-3.312-3.168 0-5.832.792-11.16 3.24-1.656.863-6.12 2.808-11.592 1.8-5.616-1.008-8.496-3.168-10.584-4.968-4.32-3.816-7.56-7.416-10.512-11.592l86.904.216z"
                          fill="#fff"
                        />
                        <path
                          d="M4.286 49.608c2.52-5.688 5.832-9.504 9.144-12.168 8.424-6.912 22.176-7.344 28.512-5.688 5.184 1.296 8.856 4.464 14.688 4.464 6.12 0 9.647-3.096 14.472-4.464 6.336-1.584 20.16-1.08 29.16 5.832 2.664 2.016 5.111 4.752 6.479 6.264-3.239 2.376-5.184 4.104-6.768 5.76H4.286z"
                          fill="#fff"
                        />
                        <path
                          d="M99.974 49.608c-1.512 1.656-2.592 3.24-3.816 5.472-1.439 2.592-3.168 6.12-3.6 11.448H.038c.072-.864.144-1.8.288-2.736.864-5.688 2.232-10.368 3.96-14.184h95.688z"
                          fill="#fff"
                        />
                        <path
                          d="M92.558 66.528a55.508 55.508 0 0 0 0 4.896c.216 3.96 1.584 8.352 3.384 11.88l-94.104-.216C.542 77.4-.178 71.568.038 66.528h92.52z"
                          fill="#fff"
                        />
                        <path
                          d="M95.941 83.304a24.623 24.623 0 0 0 2.664 4.32c6.192 7.92 8.856 7.92 13.68 10.368-.359.863-.647 1.656-1.008 2.376L7.31 100.152C5.294 95.76 3.206 89.568 1.838 83.088l94.103.216z"
                          fill="#fff"
                        />
                        <path
                          d="M111.277 100.368c-3.023 7.056-5.472 12.239-7.92 16.416l-86.903-.216c-2.88-4.248-5.472-8.929-8.424-14.761-.216-.504-.504-1.08-.72-1.655l103.967.216z"
                          fill="#fff"
                        />
                        <path
                          d="M81.109 10.224c-.504 3.6-2.304 8.208-5.184 11.16-3.097 3.312-7.92 6.912-10.801 8.712-1.584 1.008-5.688 1.152-9.071 1.512-.432-3.024-.504-5.616.432-8.424 1.224-3.312 2.809-8.064 5.328-11.376 3.096-4.104 6.624-6.912 8.568-7.92C72.974 2.592 77.294.648 81.037 0c.145 3.312.649 7.056.072 10.224z"
                          fill="#fff"
                        />
                      </g>
                    </svg>

                    <div className="flex flex-col leading-none">
                      <span className="text-[10px]">Download on the</span>
                      <span className="text-sm font-semibold">App Store</span>
                    </div>
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                  >
                    <PlayCircle className="h-5 w-5" />
                    <div className="flex flex-col leading-none">
                      <span className="text-[10px]">Get it on</span>
                      <span className="text-sm font-semibold">Google Play</span>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Link
                  href="https://github.com/openeats"
                  className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md hover:bg-muted/80 transition text-sm"
                >
                  <Github className="h-5 w-5" />
                  <span className="font-medium">{t("home.footer.starUsOnGithub")}</span>
                </Link>
                {/* Add more social icons here if needed */}
              </div>
            </div>

            {/* Navigation Link Columns */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">
                {t("home.footer.about")}
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/app/about"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("home.footer.ourMission")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/about"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("home.footer.howItWorks")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/about"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("home.footer.community")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/about"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("home.footer.contribute")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold">
                {t("home.footer.forPartners")}
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/app/create-restaurant"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("home.footer.joinAsRestaurant")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/partners"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("home.footer.partnerBenefits")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/partners"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("home.footer.successStories")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/partners"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("home.footer.partnerPortal")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold">
                {t("home.footer.forDrivers")}
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/app/drivers"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("home.footer.becomeDriver")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/drivers"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("home.footer.driverApp")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/drivers"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("home.footer.earnings")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/drivers"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("home.footer.driverSupport")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* No Hidden Fees Highlight Box */}
            <div className="lg:col-span-1 space-y-4">
              <div className="rounded-md bg-gradient-to-br from-primary/5 to-primary/10 p-4 shadow-sm border border-primary/10">
                <h4 className="text-base font-semibold mb-2">
                  {t("home.footer.noHiddenFees")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t("home.footer.feeDescription")}
                </p>
                <Link
                  href="/app/about/fees"
                  className="inline-flex items-center text-xs text-primary mt-3 font-medium hover:underline"
                >
                  {t("home.footer.learnMoreAboutFees")}
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright Bar */}
          <div className="mt-10 border-t pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground mb-4 md:mb-0">
                <Trans
                  i18nKey="home.footer.copyright"
                  values={{ year: new Date().getFullYear() }}
                />
              </p>
              <div className="flex gap-5 text-xs">
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/cookies"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
