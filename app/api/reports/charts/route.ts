import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export const GET = async () => {
  try {
    const conn = await createConnection();

    // Get sales data for the last 30 days
    const [salesRows] = await conn.execute(`
      SELECT 
        DATE(created_at) as date,
        DAY(created_at) as day,
        SUM(total_amount) as value
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at), DAY(created_at)
      ORDER BY date ASC
    `);

    // Get orders count for the last 30 days
    const [ordersRows] = await conn.execute(`
      SELECT 
        DATE(created_at) as date,
        DAY(created_at) as day,
        COUNT(*) as value
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at), DAY(created_at)
      ORDER BY date ASC
    `);

    await conn.end();

    // Convert to the expected format
    const salesSeries = (salesRows as any[]).map((row) => ({
      day: row.day,
      value: parseFloat(row.value) || 0,
    }));

    const ordersSeries = (ordersRows as any[]).map((row) => ({
      day: row.day,
      value: parseInt(row.value) || 0,
    }));

    return NextResponse.json({ sales: salesSeries, orders: ordersSeries });
  } catch (error) {
    console.error("Charts API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
};
