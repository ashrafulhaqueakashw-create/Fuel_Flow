import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const connection = await createConnection();

    // Get order details
    const [orderRows] = await connection.execute(
      `SELECT o.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
              e.name as employee_name
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       LEFT JOIN employees e ON o.employee_id = e.id
       WHERE o.id = ?`,
      [parseInt(id)]
    );

    if ((orderRows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Get order items
    const [itemRows] = await connection.execute(
      `SELECT oi.*, inv.name as item_name, inv.category, inv.unit
       FROM order_items oi
       JOIN inventory_items inv ON oi.inventory_id = inv.id
       WHERE oi.order_id = ?`,
      [parseInt(id)]
    );

    await connection.end();

    const order = (orderRows as any[])[0];
    order.items = itemRows;

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, employee_id, notes } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }

    const connection = await createConnection();

    const [result] = await connection.execute(
      `UPDATE orders 
       SET status = ?, employee_id = ?, notes = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, employee_id || null, notes || null, parseInt(id)]
    );

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const connection = await createConnection();

    // First delete order items
    await connection.execute("DELETE FROM order_items WHERE order_id = ?", [
      parseInt(id),
    ]);

    // Then delete the order
    const [result] = await connection.execute(
      "DELETE FROM orders WHERE id = ?",
      [parseInt(id)]
    );

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete order" },
      { status: 500 }
    );
  }
}
