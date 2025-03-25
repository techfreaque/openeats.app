"use client";
import { Eye, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { getUIHome } from "@/actions/ui/get-uis";
import type { FullUI } from "@/client-package/types/website-editor";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Card,
  CardContent,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui";
import { timeAgo } from "@/lib/website-editor/time";

import PromptBadge from "./prompt-badge";

const HomeUICards: () => React.JSX.Element = () => {
  const router = useRouter();
  const [uis, setUis] = useState<FullUI[]>([]);

  useEffect(() => {
    const fetchUIs: () => Promise<void> = async () => {
      const fetchedUIs = await getUIHome();
      setUis(fetchedUIs);
    };

    void fetchUIs();
  }, []);

  return (
    <div className="m-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {uis.map((ui) => (
        <Card
          key={ui.id}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div
            onClick={() => router.push(`ui/${ui.id}`)}
            className="relative cursor-pointer"
          >
            <img
              src={ui.img}
              alt={ui.prompt}
              className="w-full h-48 object-cover"
            />
          </div>
          <CardContent className="p-2 flex items-center">
            <div className="flex items-start flex-grow min-w-0 relative">
              <Tooltip>
                <TooltipTrigger>
                  <Avatar
                    onClick={() => router.push(`/generations/${ui?.user?.id}`)}
                    className="border-2 border-primary h-5 w-5"
                  >
                    <AvatarImage src={ui.user.imageUrl ?? ""} />
                    <AvatarFallback>
                      {ui.user.firstName.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{ui.user.firstName}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger className="rounded-full font-semibold ml-2 flex-1 text-ellipsis overflow-hidden whitespace-nowrap">
                  <PromptBadge
                    variant={"secondary"}
                    className="rounded-full font-semibold flex text-ellipsis overflow-hidden whitespace-nowrap"
                    prompt={ui.prompt}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{ui.prompt}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center whitespace-nowrap ml-2 flex-shrink-0">
              <Badge
                variant={"secondary"}
                className="flex items-center rounded-s-full font-semibold px-2"
              >
                <Eye className="h-4 w-4 mr-1" />
                <p className="text-xs text-gray-600">{ui.viewCount}</p>
              </Badge>
              <Badge
                variant={"secondary"}
                className="flex items-center rounded-e-full font-semibold px-2"
              >
                <Heart className="h-4 w-4 mr-1" />
                <p className="text-xs text-gray-600">{ui.likesCount}</p>
              </Badge>
            </div>
            <p className="text-xs text-gray-600 whitespace-nowrap ml-2 flex-shrink-0">
              {timeAgo(ui.updatedAt || ui.createdAt)}
            </p>
          </CardContent>
        </Card>
      ))}
      {uis.length > 0 && (
        <Card
          onClick={() => router.push(`explore`)}
          className="bg-white hover:bg-gray-200 cursor-pointer border-dashed border-black rounded-xl shadow-md overflow-hidden flex items-center justify-center"
        >
          <CardContent className="font-bold text-xl text-gray-500">
            Explore more
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HomeUICards;
