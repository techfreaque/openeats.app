import { Card, CardContent, CardFooter, Skeleton } from "next-vibe-ui/ui";
import type { JSX } from "react";

export function RestaurantHeroSkeleton(): JSX.Element {
  return (
    <div className="relative h-[200px] md:h-[300px] lg:h-[400px]">
      <Skeleton className="h-full w-full" />
    </div>
  );
}

export function RestaurantInfoSkeleton(): JSX.Element {
  return (
    <div className="bg-background rounded-lg border p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MenuCategorySkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="p-4 md:flex-1">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <div className="pt-4">
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
                <Skeleton className="h-24 w-24 md:h-auto md:w-32" />
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

export function RestaurantFeaturedSkeleton(): JSX.Element {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-1" />
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
}

export function RestaurantPageSkeleton(): JSX.Element {
  return (
    <div className="space-y-8">
      <RestaurantHeroSkeleton />
      <div className="container px-4 md:px-6 -mt-10 relative">
        <RestaurantInfoSkeleton />
      </div>
      <div className="container px-4 md:px-6">
        <div className="space-y-8">
          <RestaurantFeaturedSkeleton />
          <MenuCategorySkeleton />
          <MenuCategorySkeleton />
        </div>
      </div>
    </div>
  );
}
