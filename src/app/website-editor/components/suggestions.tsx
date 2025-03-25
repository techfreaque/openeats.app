import { MoveUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createUI } from "@/actions/ui/create-ui";
import { useAuth } from "@/client-package/hooks/use-auth";
import { useAuthModal } from "@/client-package/hooks/website-editor/useAuthModal";
import { useUIState } from "@/client-package/hooks/website-editor/useUIState";
import { errorLogger } from "@/next-portal/utils/logger";

import { Badge } from "../ui";

const Suggestions = (): JSX.Element => {
  const router = useRouter();
  const { setLoading, setInput, uiType } = useUIState();
  const { toggle } = useAuthModal();
  const { user } = useAuth();
  const userId = user?.id;
  const [suggestions, setSuggestions] = useState([
    "login page for netflix",
    "product detail card for sneakers",
    "ecommerce checkout page",
    "dashboard for sales data",
    "Instagram App UI clone",
  ]);

  useEffect(() => {
    const fetchSuggestions = async (): Promise<void> => {
      try {
        const res = await fetch(
          `/api/v1/website-editor/suggestions?modelId=${encodeURIComponent("openai:gpt-4o-mini")}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (!res.ok) {
          throw new Error("Failed to fetch suggestions");
        }
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data);
        }
      } catch (error) {
        errorLogger("Error fetching suggestions:", error);
      }
    };
    void fetchSuggestions();
  }, []);

  const handleClick = async (suggestion: string): Promise<void> => {
    setInput(suggestion);
    try {
      if (user) {
        if (!userId) {
          toggle();
          return;
        }
        setLoading(true);
        const ui = await createUI(suggestion, userId, uiType);
        setLoading(false);
        router.push(`/v1/website-editor/ui/${ui.id}`);
      } else {
        toggle();
      }
    } catch (error) {
      errorLogger("Error creating UI from suggestion:", error);
      toast.error("Failed to create UI");
    }
  };

  return (
    <div className="inline-flex flex-wrap gap-2 w-[80vw] justify-center">
      {suggestions.map((suggestion, index) => (
        <Badge
          onClick={() => void handleClick(suggestion)}
          variant="secondary"
          key={index}
          className="p-1 rounded-md cursor-pointer flex items-center justify-between whitespace-nowrap shrink-0"
        >
          <span className="mr-1">{suggestion}</span>
          <MoveUpRight size={14} />
        </Badge>
      ))}
    </div>
  );
};

export default Suggestions;
