import Link from "next/link";
import type { JSX } from "react";

import { Button } from "@/components/ui";

import { ApiExplorer } from "../api-docs/components/api-explorer";

export default function Home(): JSX.Element {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Next Vibe Platform
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/80">
              An open-source starter template with batteries included for
              building modern web applications using Next.js, Tailwind CSS,
              TypeScript and many more.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href={"/partner"}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-primary hover:bg-white/90 font-semibold"
                >
                  Partner Portal
                </Button>
              </Link>
              <Link href={"/app"}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-primary hover:bg-white/90 font-semibold"
                >
                  Partner Portal
                </Button>
              </Link>
              <Link href="/api-docs">
                <Button
                  size="lg"
                  className="bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 font-semibold"
                >
                  Explore API
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <main>
        <ApiExplorer />
      </main>
    </>
  );
}
