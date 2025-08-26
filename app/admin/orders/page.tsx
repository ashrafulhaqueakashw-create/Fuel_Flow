"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import OrderManagement from "../../components/OrderManagement";

export default function OrdersPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                FuelFlow Admin
              </h1>
              <p className="text-gray-600">Order & Delivery Management</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push("/admin")}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrderManagement
          key={refreshKey}
          onSaved={() => setRefreshKey((prev) => prev + 1)}
        />
      </main>
    </div>
  );
}
