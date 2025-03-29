"use client";
import { redirect } from "next/navigation";
import { useAuth } from "openeats-client/hooks/useAuth";
import React, { useEffect } from "react";

import Header from "../components/header";
import SettingsSidebar from "../components/settings-sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      redirect("/website-editor/");
    }
  }, [user]);

  return (
    <div>
      <Header />
      <div className="p-10 mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="flex">
          <SettingsSidebar />
          <div className="flex-1 ml-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
