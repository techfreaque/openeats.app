"use client";
import { useRouter } from "next/navigation";
import type { JSX } from "react";

import { useAuth } from "@/client-package/hooks/use-auth";
import { Badge, Button } from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function AccountPage(): JSX.Element {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleSignOut = (): void => {
    void logout();
    router.push("/v1/website-editor/");
  };

  if (!user) {
    return <div>Please sign in to view your account details.</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-xl font-semibold">
            Profile Information
          </CardTitle>
          <CardDescription>
            View and manage your account details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                // TODO handle avatar image
                src={""}
                alt={user.firstName || "User"}
              />
              <AvatarFallback>
                {user.firstName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{user.firstName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="grid gap-4">
            <div>
              <Label className="font-bold">Name</Label>
              <Badge variant={"outline"} className="m-1">
                {user.firstName} {user.lastName}
              </Badge>
            </div>
            <div>
              <Label className="font-bold">Email</Label>
              <Badge variant={"outline"} className="m-1">
                {user.email}
              </Badge>
            </div>
            <div>
              <Label className="font-bold">ID</Label>
              <Badge variant={"outline"} className="m-1">
                @{user.id}
              </Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t border-gray-200 pt-6">
          <Button
            onClick={() => handleSignOut()}
            variant="outline"
            className="text-red-600"
          >
            Signout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
