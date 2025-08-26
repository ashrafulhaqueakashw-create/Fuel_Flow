import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import type { EmployeeCreate } from "@/lib/types";
import bcrypt from "bcryptjs";

export const POST = async (request: Request) => {
  const body = (await request.json()) as EmployeeCreate;
  if (!body || !body.name || !body.role || !body.password) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  const password_hash = await bcrypt.hash(body.password, 10);

  const conn = await createConnection();
  const [result] = await conn.execute(
    `INSERT INTO employees (name, role, email, phone, password_hash, salary, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      body.name,
      body.role,
      body.email || null,
      body.phone || null,
      password_hash,
      body.salary || null,
    ]
  );

  return NextResponse.json({ message: "Employee created", result });
};

export const GET = async (request: Request) => {
  const conn = await createConnection();
  const [rows]: any = await conn.execute(
    `SELECT id, name, role, email, phone, salary, created_at FROM employees ORDER BY created_at DESC LIMIT 50`
  );
  return NextResponse.json({ data: rows });
};
