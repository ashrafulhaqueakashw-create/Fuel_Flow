import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const connection = await createConnection();

    let query = "SELECT * FROM inventory_items ORDER BY created_at DESC";
    let params: any[] = [];

    if (category && category !== "all") {
      query =
        "SELECT * FROM inventory_items WHERE category = ? ORDER BY created_at DESC";
      params = [category];
    }

    const [rows] = await connection.execute(query, params);
    await connection.end();

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get inventory error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, price, quantity, unit, description } = body;

    if (!name || !category || !price) {
      return NextResponse.json(
        { success: false, message: "Name, category, and price are required" },
        { status: 400 }
      );
    }

    const connection = await createConnection();

    const [result] = await connection.execute(
      `INSERT INTO inventory_items (name, category, price, quantity, unit, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        name,
        category,
        parseFloat(price),
        parseInt(quantity) || 0,
        unit || "piece",
        description || null,
      ]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Inventory item created successfully",
      data: { id: (result as any).insertId },
    });
  } catch (error) {
    console.error("Create inventory error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}
