import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");

    const connection = await createConnection();

    let query = `
      SELECT o.*, c.name as customer_name, c.email as customer_email,
             e.name as employee_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN employees e ON o.employee_id = e.id
      ORDER BY o.created_at DESC
    `;
    let params: any[] = [];

    if (status && status !== "all") {
      query = `
        SELECT o.*, c.name as customer_name, c.email as customer_email,
               e.name as employee_name
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        LEFT JOIN employees e ON o.employee_id = e.id
        WHERE o.status = ?
        ORDER BY o.created_at DESC
      `;
      params = [status];
    }

    if (customerId) {
      query = `
        SELECT o.*, c.name as customer_name, c.email as customer_email,
               e.name as employee_name
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        LEFT JOIN employees e ON o.employee_id = e.id
        WHERE o.customer_id = ?
        ORDER BY o.created_at DESC
      `;
      params = [customerId];
    }

    const [rows] = await connection.execute(query, params);
    await connection.end();

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, items, payment_method, delivery_address, notes } =
      body;

    if (!customer_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Customer ID and items are required" },
        { status: 400 }
      );
    }

    if (!delivery_address || delivery_address.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Delivery address is required" },
        { status: 400 }
      );
    }

    const connection = await createConnection();

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      const [itemRows] = await connection.execute(
        "SELECT price FROM inventory_items WHERE id = ?",
        [item.inventory_id]
      );

      if ((itemRows as any[]).length === 0) {
        await connection.end();
        return NextResponse.json(
          {
            success: false,
            message: `Item with ID ${item.inventory_id} not found`,
          },
          { status: 400 }
        );
      }

      const itemPrice = parseFloat((itemRows as any[])[0].price);
      totalAmount += itemPrice * item.quantity;
    }

    // Create order
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (customer_id, total_amount, payment_method, status, delivery_address, notes, created_at)
       VALUES (?, ?, ?, 'pending', ?, ?, NOW())`,
      [
        customer_id,
        totalAmount.toFixed(2),
        payment_method || "cash",
        delivery_address, // Now required, no null fallback
        notes || null,
      ]
    );

    const orderId = (orderResult as any).insertId;

    // Create order items
    for (const item of items) {
      const [itemRows] = await connection.execute(
        "SELECT price FROM inventory_items WHERE id = ?",
        [item.inventory_id]
      );

      const itemPrice = parseFloat((itemRows as any[])[0].price);

      await connection.execute(
        `INSERT INTO order_items (order_id, inventory_id, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          item.inventory_id,
          item.quantity,
          itemPrice.toFixed(2),
          (itemPrice * item.quantity).toFixed(2),
        ]
      );

      // Update inventory quantity
      await connection.execute(
        "UPDATE inventory_items SET quantity = quantity - ? WHERE id = ?",
        [item.quantity, item.inventory_id]
      );
    }

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      data: { id: orderId, total_amount: totalAmount.toFixed(2) },
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}
