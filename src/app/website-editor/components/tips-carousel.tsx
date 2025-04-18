import {
  Badge,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "next-vibe-ui/ui";
import React from "react";

const tips = [
  "Try different models by changing it in the 'Settings' area.",
  "Fork ui to use others UI",
  "Customize your experience in the 'Settings' area.",
  "Share your creations with the community!",
  "Don't forget to save your progress regularly.",
];

export function TipsCarousel(): React.JSX.Element {
  return (
    <Carousel className="w-full max-w-xs mx-auto">
      <CarouselContent>
        {tips.map((tip, index) => (
          <CarouselItem key={index}>
            <Badge variant={"outline"}>{tip}</Badge>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
