import { redirect } from "next/navigation";
import type { JSX } from "react";

export default function Home(): JSX.Element {
  redirect("/app");
}
