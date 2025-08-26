import React from "react";
import DashboardCharts from "../components/DashboardCharts";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Overview of operations, reports and analytics
          </p>
        </header>

        {/* Overview cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm text-gray-500">Staff Present</h4>
            <p className="text-2xl font-semibold text-gray-900">12</p>
            <p className="text-xs text-gray-400">Today</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm text-gray-500">Working Hours</h4>
            <p className="text-2xl font-semibold text-gray-900">84h</p>
            <p className="text-xs text-gray-400">This week</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm text-gray-500">Open Orders</h4>
            <p className="text-2xl font-semibold text-gray-900">23</p>
            <p className="text-xs text-gray-400">Needs attention</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm text-gray-500">Low Inventory</h4>
            <p className="text-2xl font-semibold text-gray-900">5 items</p>
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
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Inventory Snapshot
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>Product A — 3 left</li>
              <li>Product B — 12 left</li>
              <li>Product C — 0 left</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
