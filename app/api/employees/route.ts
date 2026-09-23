import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import type { EmployeeCreate } from "@/lib/types";
import bcrypt from "bcryptjs";

export const POST = async (request: Request) => {
  try {
    const body = (await request.json()) as EmployeeCreate & { status?: string };
    if (!body || !body.name || !body.role || !body.password) {
      return NextResponse.json(
        { message: "Name, role, and password are required" },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(body.password, 10);
    const status = body.status || "active";

    const conn = await createConnection();
    const [result]: any = await conn.execute(
      `INSERT INTO employees (name, role, email, phone, password_hash, salary, status, hire_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), NOW())`,
      [
        body.name,
        body.role,
        body.email || null,
        body.phone || null,
        password_hash,
        body.salary || null,
        status,
      ]
    );
    await conn.end();

    return NextResponse.json({
      success: true,
      message: "Employee created successfully",
      id: result.insertId,
    });
  } catch (error: any) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create employee" },
      { status: 500 }
    );
  }
};

export const GET = async () => {
  try {
    const conn = await createConnection();
    const [rows]: any = await conn.execute(
      `SELECT id, name, role, email, phone, salary, status, hire_date, created_at FROM employees ORDER BY created_at DESC LIMIT 100`
    );
    await conn.end();
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { success: false, data: [], message: error.message },
      { status: 500 }
    );
  }
};
