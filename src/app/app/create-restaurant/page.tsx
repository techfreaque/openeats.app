"use client";

import { useRouter } from "next/navigation";
import type { JSX } from "react";

import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";

import { CreateRestaurantChoice } from "../components/create-restaurant-choice";

export default function CreateRestaurantPage(): JSX.Element | null {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  if (!user) {
    router.push("/auth/public/login?redirect=/create-restaurant");
    return null;
  }

  return (
    <div className="flex-1">
      <CreateRestaurantChoice />
    </div>
  );
}
