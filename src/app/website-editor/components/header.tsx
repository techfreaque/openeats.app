"use client";
import { useRouter } from "next/navigation";
import type { JSX } from "react";

import { useAuth } from "@/client-package/hooks/use-auth";
import { useAuthModal } from "@/client-package/hooks/website-editor/useAuthModal";
import { useBugReportModal } from "@/client-package/hooks/website-editor/useBugReportModal";

import { Button } from "../ui";
import { BugReportModal } from "./bug-report-modal";
import UserButton from "./user-button";

const Header: () => JSX.Element = () => {
  const { toggle: toggleAuth } = useAuthModal();
  const { toggle: toggleBugReport } = useBugReportModal();
  const { user } = useAuth();
  const router = useRouter();

  return (
    <>
      <div className="w-full bg-white flex justify-between items-center p-4">
        <div className="flex space-x-2">
          <Button
            onClick={() => router.push("/v1/website-editor/")}
            variant={"outline"}
            className="text-xl font-semibold"
          >
            Home
          </Button>
          <Button
            onClick={() => router.push("/v1/website-editor/explore")}
            variant={"outline"}
            className="text-xl font-semibold"
          >
            Explore
          </Button>
          <Button
            onClick={() => router.push("/v1/website-editor/changelog")}
            variant={"outline"}
            className="text-xl font-semibold"
          >
            Changelogs
          </Button>
        </div>
        <div className="flex space-x-2 items-center">
          {user && (
            <Button onClick={toggleBugReport} variant="secondary">
              Bug Report / Feature Request
            </Button>
          )}

          {!user && (
            <Button onClick={toggleAuth} variant="default">
              Sign In
            </Button>
          )}
          {user && <UserButton />}
        </div>
      </div>
      <BugReportModal />
    </>
  );
};

export default Header;
