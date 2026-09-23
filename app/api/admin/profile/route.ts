import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload: any = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const conn = await createConnection();
    const [rows]: any = await conn.execute(
      "SELECT id, AdminName FROM admin WHERE id = ? OR AdminName = ? LIMIT 1",
      [payload.id || 1, payload.name || "admin"]
    );
    await conn.end();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: { id: payload.id, AdminName: payload.name || "admin" },
      });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    console.error("Admin profile GET error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { AdminName, password, adminId } = body;

    const token = request.cookies.get("token")?.value;
    let targetId = adminId || 1;

    if (token) {
      const payload: any = verifyToken(token);
      if (payload?.id) {
        targetId = payload.id;
      }
    }

    const conn = await createConnection();

    const updates: string[] = [];
    const values: any[] = [];

    if (AdminName && AdminName.trim()) {
      updates.push("AdminName = ?");
      values.push(AdminName.trim());
    }

    if (password && password.trim()) {
      if (password.trim().length < 6) {
        await conn.end();
        return NextResponse.json(
          { success: false, message: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
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

    values.push(targetId);
    await conn.execute(
      `UPDATE admin SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    const [rows]: any = await conn.execute(
      "SELECT id, AdminName FROM admin WHERE id = ?",
      [targetId]
    );
    await conn.end();

    return NextResponse.json({
      success: true,
      message: "Admin credentials updated successfully",
      data: rows[0],
    });
  } catch (error: any) {
    console.error("Admin profile PUT error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update admin credentials" },
      { status: 500 }
    );
  }
}
