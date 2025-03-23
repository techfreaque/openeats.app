import Link from "next/link";
import { APP_NAME } from "next-query-portal/shared/constants";
import type { JSX } from "react";

import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui";

export function Navbar(): JSX.Element {
  const { isLoggedIn, isLoading, user, logout } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-lg">OE</span>
            </div>
            <h1 className="text-2xl font-bold hidden sm:block">{APP_NAME}</h1>
          </div>
        </Link>
        <nav className="flex items-center space-x-2">
          {!isLoading &&
            (isLoggedIn ? (
              <>
                <div>{user!.email}</div>
                <Button
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/public/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/public/signup">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            ))}
        </nav>
      </div>
    </header>
  );
}
