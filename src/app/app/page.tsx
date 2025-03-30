import type { JSX } from "react";

export default function Home(): JSX.Element {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center p-5">
      <h1 className="text-3xl font-bold underline">
        Welcome to next-vibe!
      </h1>
      <p className="text-lg">Please start vibing now.</p>
    </div>
  );
}
