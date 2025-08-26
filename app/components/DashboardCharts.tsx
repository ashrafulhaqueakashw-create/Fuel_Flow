"use client";
import { useEffect, useState } from "react";

type SeriesPoint = { day: number; value: number };

export default function DashboardCharts() {
  const [sales, setSales] = useState<SeriesPoint[]>([]);
  const [orders, setOrders] = useState<SeriesPoint[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/reports/charts")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setSales(data.sales || []);
        setOrders(data.orders || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded shadow min-h-[220px]">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          Sales (Last 30 days)
        </h3>
        <div className="text-sm text-gray-500">
          {sales.length === 0 ? (
            <div className="py-10 text-center">Loading...</div>
          ) : (
            <ol className="list-decimal list-inside text-xs max-h-40 overflow-auto">
              {sales.map((s) => (
                <li key={s.day}>{`Day ${s.day}: ${s.value}`}</li>
              ))}
            </ol>
          )}
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow min-h-[220px]">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          Orders (Last 30 days)
        </h3>
        <div className="text-sm text-gray-500">
          {orders.length === 0 ? (
            <div className="py-10 text-center">Loading...</div>
          ) : (
            <ol className="list-decimal list-inside text-xs max-h-40 overflow-auto">
              {orders.map((s) => (
                <li key={s.day}>{`Day ${s.day}: ${s.value}`}</li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
