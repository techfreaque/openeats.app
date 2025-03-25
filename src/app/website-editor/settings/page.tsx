import { redirect } from "next/navigation";

export default function SettingsPage(): void {
  redirect("/v1/website-editor/settings/general");
}
