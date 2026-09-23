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
      "SELECT id, name, role, email, phone, salary, status, hire_date, created_at FROM employees WHERE id = ?",
      [id]
    );
    await conn.end();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch employee" },
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
    const { name, role, email, phone, salary, status, password } = body;

    const conn = await createConnection();

    // Check if employee exists
    const [existing]: any = await conn.execute(
      "SELECT id FROM employees WHERE id = ?",
      [id]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      await conn.end();
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (role !== undefined) {
      updates.push("role = ?");
      values.push(role);
    }
    if (email !== undefined) {
      updates.push("email = ?");
      values.push(email || null);
    }
    if (phone !== undefined) {
      updates.push("phone = ?");
      values.push(phone || null);
    }
    if (salary !== undefined) {
      updates.push("salary = ?");
      values.push(salary !== "" && salary !== null ? parseFloat(salary) : null);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }
    if (password && typeof password === "string" && password.trim().length > 0) {
      const passwordHash = await bcrypt.hash(password.trim(), 10);
      updates.push("password_hash = ?");
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      await conn.end();
      return NextResponse.json({
        success: true,
        message: "No fields to update",
      });
    }

    values.push(id);
    const query = `UPDATE employees SET ${updates.join(", ")} WHERE id = ?`;
    await conn.execute(query, values);

    // Fetch updated record
    const [updated]: any = await conn.execute(
      "SELECT id, name, role, email, phone, salary, status, hire_date, created_at FROM employees WHERE id = ?",
      [id]
    );
    await conn.end();

    return NextResponse.json({
      success: true,
      message: "Employee updated successfully",
      data: updated[0],
    });
  } catch (error: any) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update employee" },
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

    // Check if employee exists
    const [existing]: any = await conn.execute(
      "SELECT id, name FROM employees WHERE id = ?",
      [id]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      await conn.end();
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    await conn.execute("DELETE FROM employees WHERE id = ?", [id]);
    await conn.end();

    return NextResponse.json({
      success: true,
      message: `Employee ${existing[0].name} removed successfully`,
    });
  } catch (error: any) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete employee" },
      { status: 500 }
    );
  }
}
