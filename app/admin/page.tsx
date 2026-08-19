"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardCharts from "../components/DashboardCharts";
import InventorySnapshot from "../components/InventorySnapshot";
import ReviewManagement from "../components/ReviewManagement";
import BookingManagement from "../components/BookingManagement";
import Link from "next/link";

type Summary = {
  staffPresent: number;
  workingHours: number;
  openOrders: number;
  lowStock: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary>({
    staffPresent: 0,
    workingHours: 0,
    openOrders: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "reviews" | "bookings"
  >("dashboard");

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/reports/summary", { cache: "no-store" });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      setSummary(data);
      setLastUpdated(new Date());
      setError("");
    } catch (error) {
      console.error("Failed to fetch summary:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();

    // Auto-refresh every 30 seconds to get real-time updates
    const interval = setInterval(fetchSummary, 30000);

    return () => clearInterval(interval);
  }, []);

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
      {/* Premium Gradient Top Header */}
      <header className="bg-slate-900 text-white relative overflow-hidden py-8 px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[50%] -left-[10%] w-[40%] h-[150%] rounded-full bg-primary-600/10 blur-[100px]" />
          <div className="absolute -bottom-[50%] -right-[10%] w-[40%] h-[150%] rounded-full bg-fuel-orange/5 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center relative z-10 gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-xl">⚡</span>
              <h1 className="text-2xl font-black tracking-tight">
                Fuel<span className="text-fuel-orange font-black">Flow</span>
              </h1>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-md border border-primary-500/10">
                Admin Console
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Overview of operations, reports and analytics
            </p>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSummary}
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700 text-white/90 text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/5 transition-all duration-200"
            >
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-red-950/20"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-sm">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <section className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-3.5 px-1 border-b-2 font-semibold text-sm transition-all relative ${activeTab === "dashboard"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Dashboard Overview
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-3.5 px-1 border-b-2 font-semibold text-sm transition-all relative ${activeTab === "reviews"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Customer Reviews
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`py-3.5 px-1 border-b-2 font-semibold text-sm transition-all relative ${activeTab === "bookings"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Booking Management
            </button>
          </nav>
        </section>

        {activeTab === "dashboard" && (
          <>
            {/* Quick Navigation Panels */}
            <section className="mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Management Consoles
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  href="/admin/customers"
                  className="bg-white hover:bg-primary-50/30 text-gray-800 border border-gray-100 hover:border-primary-200 p-5 rounded-2xl transition-all shadow-sm flex flex-col gap-2 group"
                >
                  <span className="text-xl">👥</span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 group-hover:text-primary-600 transition-colors">
                      Customers
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Manage users & logs</p>
                  </div>
                </Link>

                <Link
                  href="/admin/employees"
                  className="bg-white hover:bg-primary-50/30 text-gray-800 border border-gray-100 hover:border-primary-200 p-5 rounded-2xl transition-all shadow-sm flex flex-col gap-2 group"
                >
                  <span className="text-xl">👔</span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 group-hover:text-primary-600 transition-colors">
                      Employees
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Register staff & view details</p>
                  </div>
                </Link>

                <Link
                  href="/admin/inventory"
                  className="bg-white hover:bg-primary-50/30 text-gray-800 border border-gray-100 hover:border-primary-200 p-5 rounded-2xl transition-all shadow-sm flex flex-col gap-2 group"
                >
                  <span className="text-xl">⛽</span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 group-hover:text-primary-600 transition-colors">
                      Inventory
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">View & adjust stock capacities</p>
                  </div>
                </Link>

                <Link
                  href="/admin/orders"
                  className="bg-white hover:bg-primary-50/30 text-gray-800 border border-gray-100 hover:border-primary-200 p-5 rounded-2xl transition-all shadow-sm flex flex-col gap-2 group"
                >
                  <span className="text-xl">📦</span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 group-hover:text-primary-600 transition-colors">
                      Orders
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Fulfill & update statuses</p>
                  </div>
                </Link>
              </div>
            </section>

            {/* Overview cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Staff Present */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Staff Present
                  </h4>
                  <p className="text-3xl font-black text-gray-800 mt-2">
                    {summary.staffPresent}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">Checked in today</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                  ✓
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Working Hours
                  </h4>
                  <p className="text-3xl font-black text-gray-800 mt-2">
                    {summary.workingHours}h
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">Cumulative this week</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl">
                  🕒
                </div>
              </div>

              {/* Open Orders */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Open Orders
                  </h4>
                  <p className="text-3xl font-black text-gray-800 mt-2">
                    {summary.openOrders}
                  </p>
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">Action required</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
                  📦
                </div>
              </div>

              {/* Low Inventory */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Low Stock
                  </h4>
                  <p className="text-3xl font-black text-gray-800 mt-2">
                    {summary.lowStock}
                  </p>
                  <p className="text-[10px] text-amber-500 font-semibold mt-1">Restock recommended</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
                  ⚠
                </div>
              </div>
            </section>

            {/* Charts */}
            <section className="mb-8">
              <DashboardCharts />
            </section>

            {/* Analysis & Inventory Snapshot */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-sm lg:col-span-2 flex flex-col justify-between transition-all duration-300 hover:shadow-md">
                <div>
                  <h3 className="text-base font-bold text-gray-800 mb-2">
                    Operational Insights
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    Daily updates on fuel dispensing dispatch counts, service request turnaround times, and gas station operations. Monitor staff shift efficiency and customer reviews below to optimize performance.
                  </p>
                </div>
                <div className="bg-slate-50 border border-gray-100/80 rounded-2xl p-4 flex items-center gap-3">
                  <span className="text-lg">💡</span>
                  <p className="text-xs text-gray-600">
                    <strong>Tip:</strong> Keep inventory levels above 15% to avoid delivery delays during high-traffic weekend periods.
                  </p>
                </div>
              </div>
              <InventorySnapshot />
            </section>
          </>
        )}

        {activeTab === "reviews" && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
            <ReviewManagement onSaved={fetchSummary} />
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
            <BookingManagement />
          </div>
        )}
      </div>
    </div>
  );
}
