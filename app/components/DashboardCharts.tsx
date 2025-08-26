"use client";
import { useEffect } from "react";

export default function DashboardCharts() {
  // Placeholder effect for mounting client-only chart libs later
  useEffect(() => {
    // e.g., initialize chart library here
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded shadow min-h-[220px]">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          Sales (Last 30 days)
        </h3>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
          Chart placeholder
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow min-h-[220px]">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          Orders & Fulfillment
        </h3>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
          Chart placeholder
        </div>
      </div>
    </div>
  );
}
