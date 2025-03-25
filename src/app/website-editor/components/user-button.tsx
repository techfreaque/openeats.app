import { LogOut, Settings, SquareLibrary } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { JSX } from "react";

import { useAuth } from "@/client-package/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "../ui";

export default function UserButton(): JSX.Element {
  const router = useRouter();
  const { logout, user } = useAuth();
  if (!user) {
    return <></>;
  }
  const handleSignOut = (): void => {
    void logout();
    router.push("/v1/website-editor/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" className="flex-none rounded-full">
          {user.imageUrl && (
            <Image
              src={user.imageUrl || ""}
              alt="User profile picture"
              width={50}
              height={50}
              className="aspect-square rounded-full bg-background object-cover"
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={`/v1/website-editor/generations/${user.id}`} passHref>
            <DropdownMenuItem className="cursor-pointer">
              <SquareLibrary className="mr-2 h-4 w-4" />
              <span>Generations</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/v1/website-editor/settings" passHref>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
