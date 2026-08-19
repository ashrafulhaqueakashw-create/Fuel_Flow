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
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-slate-900 text-white relative overflow-hidden py-8 px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[50%] -left-[10%] w-[40%] h-[150%] rounded-full bg-primary-600/10 blur-[100px]" />
          <div className="absolute -bottom-[50%] -right-[10%] w-[40%] h-[150%] rounded-full bg-fuel-orange/5 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">📦</span>
              <h1 className="text-2xl font-black tracking-tight">
                Order<span className="text-fuel-orange font-black">s</span>
              </h1>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-md border border-primary-500/10">
                Dispatch Console
              </span>
            </div>
            <p className="text-sm text-gray-400">Review dispatch statuses and assign employees to deliveries</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/5 transition-all duration-200"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/5 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <OrderManagement
          key={refreshKey}
          onSaved={() => setRefreshKey((prev) => prev + 1)}
        />
      </main>
    </div>
  );
}
