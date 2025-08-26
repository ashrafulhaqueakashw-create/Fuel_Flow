import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export const GET = async () => {
  const conn = await createConnection();

  // Mocked series — replace with real queries
  const salesSeries = Array.from({ length: 30 }).map((_, i) => ({
    day: i + 1,
    value: Math.round(Math.random() * 1000),
  }));
  const ordersSeries = Array.from({ length: 30 }).map((_, i) => ({
    day: i + 1,
    value: Math.round(Math.random() * 50),
  }));

  return NextResponse.json({ sales: salesSeries, orders: ordersSeries });
};
