import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const connection = await createConnection();

    // Get total inventory count
    const [totalResult] = await connection.execute(
      "SELECT COUNT(*) as total FROM inventory_items"
    );

    // Get low stock items (quantity < 10)
    const [lowStockResult] = await connection.execute(
      "SELECT COUNT(*) as lowStock FROM inventory_items WHERE quantity < 10"
    );

    // Get items by category
    const [categoryResult] = await connection.execute(
      `SELECT category, COUNT(*) as count, SUM(quantity * price) as value 
       FROM inventory_items 
       GROUP BY category`
    );

    // Get recent items
    const [recentResult] = await connection.execute(
      "SELECT name, category, quantity, unit FROM inventory_items ORDER BY created_at DESC LIMIT 5"
    );

    await connection.end();

    const total = (totalResult as any[])[0]?.total || 0;
    const lowStock = (lowStockResult as any[])[0]?.lowStock || 0;
    const categories = categoryResult as any[];
    const recent = recentResult as any[];

    return NextResponse.json({
      success: true,
      data: {
        totalItems: total,
        lowStockItems: lowStock,
        categories: categories,
        recentItems: recent,
      },
    });
  } catch (error) {
    console.error("Inventory summary error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch inventory summary" },
      { status: 500 }
    );
  }
}
