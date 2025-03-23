"use client";

import Link from "next/link";
import { APP_NAME } from "next-query-portal/shared/constants";
import type { JSX, ReactNode } from "react";

import { Navbar } from "./navbar";

export function Layout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      {children}

      <footer className="bg-gray-100 border-t py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4 text-lg">{APP_NAME}</h3>
              <p className="text-sm text-gray-600">
                An open-source food delivery platform with powerful API
                capabilities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/api-docs"
                    className="text-gray-600 hover:text-primary"
                  >
                    API Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/guides"
                    className="text-gray-600 hover:text-primary"
                  >
                    Integration Guides
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/examples"
                    className="text-gray-600 hover:text-primary"
                  >
                    Code Examples
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-600 hover:text-primary"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-600 hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="text-gray-600 hover:text-primary"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="https://github.com/your-repo"
                    className="text-gray-600 hover:text-primary"
                  >
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link
                    href="/discord"
                    className="text-gray-600 hover:text-primary"
                  >
                    Discord Community
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/support"}
                    className="text-gray-600 hover:text-primary"
                  >
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
