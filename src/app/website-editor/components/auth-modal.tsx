"use client";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { useState } from "react";

import { useAuthModal } from "@/client-package/hooks/website-editor/useAuthModal";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";

const AuthModal = (): JSX.Element => {
  const { isOpen, toggle } = useAuthModal();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSignIn = (): void => {
    setLoading(true);
    router.push("/v1/auth/public/login");
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={toggle}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign in to WindAI</DialogTitle>
            <DialogDescription>
              Welcome back! Please sign in to continue
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Button
              className="w-full py-6"
              variant="default"
              type="submit"
              onClick={handleSignIn}
              disabled={loading}
            >
              Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthModal;
