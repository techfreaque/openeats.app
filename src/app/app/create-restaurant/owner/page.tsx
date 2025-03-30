"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { JSX } from "react";

import { CreateRestaurantForm } from "../../components/create-restaurant-form";

export default function CreateRestaurantOwnerPage(): JSX.Element | null {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  if (!user) {
    router.push("/auth/public/login?redirect=/create-restaurant/owner");
    return null;
  }

  return (
    <div className="flex-1 py-12">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <CreateRestaurantForm />
        </div>
      </div>
    </div>
  );
}
