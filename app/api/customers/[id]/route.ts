import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conn = await createConnection();
    const [rows]: any = await conn.execute(
      "SELECT id, type, name, company_name, phone, email, address, preferences, created_at FROM customers WHERE id = ?",
      [id]
    );
    await conn.end();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch customer" },
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
    const { type, name, company_name, phone, email, address, password } = body;

    const conn = await createConnection();

    // Check if customer exists
    const [existing]: any = await conn.execute(
      "SELECT id FROM customers WHERE id = ?",
      [id]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      await conn.end();
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (type !== undefined) {
      updates.push("type = ?");
      values.push(type);
    }
    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (company_name !== undefined) {
      updates.push("company_name = ?");
      values.push(company_name || null);
    }
    if (phone !== undefined) {
      updates.push("phone = ?");
      values.push(phone || null);
    }
    if (email !== undefined) {
      updates.push("email = ?");
      values.push(email);
    }
    if (address !== undefined) {
      updates.push("address = ?");
      values.push(address || null);
    }
    if (password && typeof password === "string" && password.trim().length > 0) {
      if (password.trim().length < 6) {
        await conn.end();
        return NextResponse.json(
          { success: false, message: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      const hashedPassword = await bcrypt.hash(password.trim(), 12);
      updates.push("password = ?");
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      await conn.end();
      return NextResponse.json({
        success: true,
        message: "No fields to update",
      });
    }

    values.push(id);
    const query = `UPDATE customers SET ${updates.join(", ")} WHERE id = ?`;
    await conn.execute(query, values);

    // Fetch updated record
    const [updated]: any = await conn.execute(
      "SELECT id, type, name, company_name, phone, email, address, preferences, created_at FROM customers WHERE id = ?",
      [id]
    );
    await conn.end();

    return NextResponse.json({
      success: true,
      message: "Customer updated successfully",
      data: updated[0],
    });
  } catch (error: any) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update customer" },
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
    const conn = await createConnection();

    // Check if customer exists
    const [existing]: any = await conn.execute(
      "SELECT id, name FROM customers WHERE id = ?",
      [id]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      await conn.end();
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    await conn.execute("DELETE FROM customers WHERE id = ?", [id]);
    await conn.end();

    return NextResponse.json({
      success: true,
      message: `Customer ${existing[0].name} removed successfully`,
    });
  } catch (error: any) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete customer" },
      { status: 500 }
    );
  }
}
