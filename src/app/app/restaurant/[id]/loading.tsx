import type { JSX } from "react";

import { RestaurantPageSkeleton } from "../../components/restaurant-skeleton";

export default function Loading(): JSX.Element {
  return <RestaurantPageSkeleton />;
}
