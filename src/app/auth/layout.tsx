import type { JSX, ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="flex py-15 items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow-md">
        {children}
      </div>
    </div>
  );
}
