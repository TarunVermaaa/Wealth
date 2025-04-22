import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
      <h1 className="text-5xl font-bold text-gray-800">404 - Page Not Found</h1>
      <p className="text-xl text-gray-600 max-w-md">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-4">
        <Link href="/">
          <Button className="px-6 py-3 text-lg">Return to Home</Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
