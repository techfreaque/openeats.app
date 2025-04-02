"use client";

import { useRouter } from "next/navigation";
import type { JSX } from "react";

import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";

import { RestaurantRecommendForm } from "../../components/restaurant-recommend-form";

export default function RecommendRestaurantPage(): JSX.Element | null {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  if (!user) {
    router.push("/auth/public/login?redirect=/create-restaurant/recommend");
    return null;
  }

  return (
    <div className="flex-1 py-12">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <RestaurantRecommendForm />
        </div>
      </div>
    </div>
  );
}
