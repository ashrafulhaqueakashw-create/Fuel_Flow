import React from "react";
import DashboardCharts from "../components/DashboardCharts";
import InventorySnapshot from "../components/InventorySnapshot";
import Link from "next/link";

type Summary = {
  staffPresent: number;
  workingHours: number;
  openOrders: number;
  lowStock: number;
};

async function getSummary(): Promise<Summary> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${baseUrl}/api/reports/summary`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Failed to fetch summary:", error);
    return { staffPresent: 0, workingHours: 0, openOrders: 0, lowStock: 0 };
  }
}

export default async function AdminDashboard() {
  const summary = await getSummary();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Overview of operations, reports and analytics
          </p>
        </header>

        {/* Quick Navigation */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link
              href="/admin/customers"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
            >
              Manage Customers
            </Link>
            <Link
              href="/admin/employees"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
            >
              Manage Employees
            </Link>
            <Link
              href="/admin/inventory"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
            >
              Manage Inventory
            </Link>
            <Link
              href="/admin/orders"
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
            >
              Manage Orders
            </Link>
          </div>
        </section>

        {/* Overview cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm text-gray-500">Staff Present</h4>
            <p className="text-2xl font-semibold text-gray-900">
              {summary.staffPresent}
            </p>
            <p className="text-xs text-gray-400">Today</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm text-gray-500">Working Hours</h4>
            <p className="text-2xl font-semibold text-gray-900">
              {summary.workingHours}h
            </p>
            <p className="text-xs text-gray-400">This week</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm text-gray-500">Open Orders</h4>
            <p className="text-2xl font-semibold text-gray-900">
              {summary.openOrders}
            </p>
            <p className="text-xs text-gray-400">Needs attention</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm text-gray-500">Low Inventory</h4>
            <p className="text-2xl font-semibold text-gray-900">
              {summary.lowStock} items
            </p>
            <p className="text-xs text-gray-400">Restock soon</p>
          </div>
        </section>

        {/* Charts */}
        <section className="mb-8">
          <DashboardCharts />
        </section>

        {/* Analysis / Reports */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Sales Analysis
            </h3>
            <p className="text-sm text-gray-600">
              Revenue trends, top products, and regional performance.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Report placeholder — integrate charts and real data here.
            </div>
          </div>
          <InventorySnapshot />
        </section>
      </div>
    </div>
  );
}
