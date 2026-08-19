"use client";
import { useState, useEffect } from "react";

type InventoryItem = {
  name: string;
  category: string;
  quantity: number | string;
  unit: string;
};

export default function InventorySnapshot() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventorySnapshot = async () => {
      try {
        const res = await fetch("/api/inventory/summary");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setItems(data.data.recentItems || []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch inventory snapshot:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventorySnapshot();
  }, []);

  const getCapacityPercent = (item: InventoryItem) => {
    const qty = typeof item.quantity === "string" ? parseInt(item.quantity) : item.quantity;
    // Base standard capacities for visual progress bars
    let max = 200;
    if (item.category.toLowerCase().includes("fuel")) max = 1000;
    if (item.category.toLowerCase().includes("gas")) max = 500;
    const pct = Math.min((qty / max) * 100, 100);
    return Math.max(pct, 0);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/80">
        <h3 className="text-base font-bold text-gray-800 mb-4">
          Inventory Snapshot
        </h3>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/80 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-800">
            Inventory Snapshot
          </h3>
          <p className="text-xs text-gray-500">Current levels of fuel & products</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-gray-400 py-6 text-center">
          No inventory items found
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((item, index) => {
            const qty = typeof item.quantity === "string" ? parseInt(item.quantity) : item.quantity;
            const pct = getCapacityPercent(item);
            const isLow = qty < 20;

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700">{item.name}</span>
                  <span className="text-gray-400 font-medium">{item.category}</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Custom Progress Bar */}
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${isLow
                          ? "bg-gradient-to-r from-red-500 to-rose-400"
                          : "bg-gradient-to-r from-primary-500 to-indigo-400"
                        }`}
                    />
                  </div>
                  {/* Badge */}
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block min-w-[58px] text-center ${isLow
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-700"
                      }`}
                  >
                    {qty} {item.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
