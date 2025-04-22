import React, { Suspense } from "react";
import DashboardPage from "./page";
import { BarLoader } from "react-spinners";

function DashboardLayout() {
  return (
    <div className="px-5">
      <h1 className="text-6xl font-bold mb-5 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Dashboard
      </h1>

      {/* Dashboard Page */}
      <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}>
        <DashboardPage />
      </Suspense>
    </div>
  );
}

export default DashboardLayout;
