"use client";

import { ArrowRight, Store, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CreateRestaurantChoice(): JSX.Element {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="container px-4 md:px-6 mx-auto py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          Join the OpenEats Community
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose how you'd like to add a restaurant to our platform
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card
          className={`overflow-hidden transition-all ${hoveredCard === "owner" ? "shadow-lg ring-2 ring-primary" : ""}`}
          onMouseEnter={() => setHoveredCard("owner")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="relative h-48">
            <Image
              src="/placeholder.svg?height=200&width=400&text=Restaurant+Owner"
              alt="Restaurant Owner"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <Store className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardHeader>
            <CardTitle>I'm a Restaurant Owner</CardTitle>
            <CardDescription>
              Register your restaurant on OpenEats to reach more customers and
              grow your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <svg
                    className="h-3 w-3 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>Create a complete restaurant profile</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <svg
                    className="h-3 w-3 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>Manage your menu, hours, and delivery options</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <svg
                    className="h-3 w-3 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>Access business tools and analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <svg
                    className="h-3 w-3 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>Receive orders directly through our platform</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full gap-2"
              onClick={() => router.push("/app/create-restaurant/owner")}
            >
              Register My Restaurant
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card
          className={`overflow-hidden transition-all ${hoveredCard === "user" ? "shadow-lg ring-2 ring-primary" : ""}`}
          onMouseEnter={() => setHoveredCard("user")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="relative h-48">
            <Image
              src="/placeholder.svg?height=200&width=400&text=User+Recommendation"
              alt="User Recommendation"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <User className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardHeader>
            <CardTitle>I'm a Customer</CardTitle>
            <CardDescription>
              Recommend a restaurant you love that isn't on OpenEats yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <svg
                    className="h-3 w-3 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>
                  Suggest a restaurant you'd like to see on the platform
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <svg
                    className="h-3 w-3 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>Share basic information about the restaurant</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <svg
                    className="h-3 w-3 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>We'll reach out to the restaurant on your behalf</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <svg
                    className="h-3 w-3 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>Get notified when they join the platform</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full gap-2"
              variant="outline"
              onClick={() => router.push("/app/create-restaurant/recommend")}
            >
              Recommend a Restaurant
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
