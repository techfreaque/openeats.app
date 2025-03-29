import { redirect } from "next/navigation";

export default function SettingsPage(): void {
  redirect("/website-editor/settings/general");
}
