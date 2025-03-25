import { GitFork, LockOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { forkUI } from "@/actions/ui/fork-ui";
import { useAuth } from "@/client-package/hooks/use-auth";
import { useAuthModal } from "@/client-package/hooks/website-editor/useAuthModal";
import { errorLogger } from "@/next-portal/utils/logger";

import {
  Badge,
  Button,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui";
import PromptBadge from "./prompt-badge";
import UserButton from "./user-button";

const UIHeader = ({
  mainPrompt,
  uiId,
  loading,
  forkedFrom,
}: {
  mainPrompt: string | undefined;
  uiId: string;
  loading: boolean;
  forkedFrom?: string | null;
}): JSX.Element => {
  const router = useRouter();
  const { toggle } = useAuthModal();
  const [isForking, setIsForking] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;

  const handleFork = async (): Promise<void> => {
    if (!userId) {
      toggle();
      return;
    }
    if (loading) {
      return;
    }
    setIsForking(true);
    try {
      const forkedUI = await forkUI(uiId, userId);
      toast.success("UI forked successfully");
      router.push(`/ui/${forkedUI.id}`);
    } catch (error) {
      errorLogger("Error forking UI:", error);
      toast.error(`${error}`);
    } finally {
      setIsForking(false);
    }
  };

  return (
    <div className="w-full bg-white flex justify-between items-center p-4">
      <div className="flex space-x-2 h-8 items-center">
        <Button
          onClick={() => router.push("/v1/website-editor/")}
          variant={"ghost"}
          className="text-xl font-bold p-0"
        >
          WindAI
        </Button>
        <Separator orientation="vertical" />
        <Tooltip>
          <TooltipTrigger className="rounded-full font-semibold ml-2 flex-1 text-ellipsis overflow-hidden whitespace-nowrap">
            <PromptBadge
              variant={"secondary"}
              className="rounded-full font-semibold flex text-ellipsis overflow-hidden whitespace-nowrap max-w-96"
              prompt={mainPrompt}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>{mainPrompt}</p>
          </TooltipContent>
        </Tooltip>
        <Badge variant={"outline"} className="rounded-xl space-x-1">
          <LockOpen size={14} />
          <p>Public</p>
        </Badge>
        {forkedFrom && (
          <Badge
            onClick={() => router.push(`/ui/${forkedFrom}`)}
            variant={"outline"}
            className="rounded-xl space-x-1 cursor-pointer"
          >
            <GitFork size={14} />
            <p>From : {forkedFrom}</p>
          </Badge>
        )}
      </div>
      <div className="flex space-x-2 h-8 items-center">
        {user && (
          <Button
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={handleFork}
            variant="outline"
            className="rounded-3xl"
            disabled={isForking || loading}
          >
            {isForking ? "Forking..." : "Fork UI"}
          </Button>
        )}
        <Button
          onClick={() => router.push("/v1/website-editor/")}
          variant="default"
          className="rounded-3xl"
        >
          New Generation
        </Button>
        {!user && (
          <Button onClick={() => toggle()} variant="default">
            Sign In
          </Button>
        )}
        {user && <UserButton />}
      </div>
    </div>
  );
};

export default UIHeader;
