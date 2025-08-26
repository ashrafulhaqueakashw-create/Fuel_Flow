import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
      `UPDATE inventory_items 
       SET name = ?, category = ?, price = ?, quantity = ?, unit = ?, description = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name,
        category,
        parseFloat(price),
        parseInt(quantity) || 0,
        unit || "piece",
        description || null,
        parseInt(id),
      ]
    );

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Inventory item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inventory item updated successfully",
    });
  } catch (error) {
    console.error("Update inventory error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update inventory item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const connection = await createConnection();

    const [result] = await connection.execute(
      "DELETE FROM inventory_items WHERE id = ?",
      [parseInt(id)]
    );

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Inventory item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error("Delete inventory error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete inventory item" },
      { status: 500 }
    );
  }
}
