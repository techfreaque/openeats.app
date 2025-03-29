"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "openeats-client/hooks/useAuth";
import type { JSX } from "react";

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
