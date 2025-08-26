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

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Inventory Snapshot
        </h3>
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Inventory Snapshot
      </h3>
      {items.length === 0 ? (
        <div className="text-sm text-gray-500">No inventory items found</div>
      ) : (
        <ul className="text-sm text-gray-600 space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex justify-between">
              <span>{item.name}</span>
              <span
                className={`font-medium ${
                  (typeof item.quantity === "string"
                    ? parseInt(item.quantity)
                    : item.quantity) < 10
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                {typeof item.quantity === "string"
                  ? parseInt(item.quantity)
                  : item.quantity}{" "}
                {item.unit}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
