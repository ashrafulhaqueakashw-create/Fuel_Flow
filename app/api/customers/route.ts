import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { CustomerCreate } from "@/lib/types";

export const POST = async (request: Request) => {
  try {
    const body = (await request.json()) as CustomerCreate & { password?: string };

    // Basic validation
    if (!body || !body.name || !body.type) {
      return NextResponse.json(
        { message: "Name and customer type are required" },
        { status: 400 }
      );
    }

    if (!body.email || !body.password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 12);

    const conn = await createConnection();
    const [result]: any = await conn.execute(
      `INSERT INTO customers (type, name, company_name, phone, email, password, address, preferences, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        body.type,
        body.name,
        body.company_name || null,
        body.phone || null,
        body.email,
        hashedPassword,
        body.address || null,
        body.preferences ? JSON.stringify(body.preferences) : null,
      ]
    );
    await conn.end();

    return NextResponse.json({
      success: true,
      message: "Customer created successfully",
      id: result.insertId,
    });
  } catch (error: any) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create customer" },
      { status: 500 }
    );
  }
};

export const GET = async () => {
  try {
    const conn = await createConnection();
    const [rows]: any = await conn.execute(
      `SELECT id, type, name, company_name, phone, email, address, created_at FROM customers ORDER BY created_at DESC LIMIT 100`
    );
    await conn.end();
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { success: false, data: [], message: error.message },
      { status: 500 }
    );
  }
};
