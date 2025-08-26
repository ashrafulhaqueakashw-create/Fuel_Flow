import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { CustomerCreate } from "@/lib/types";

export const POST = async (request: Request) => {
  const body = (await request.json()) as CustomerCreate & { password?: string };

  // Basic validation
  if (!body || !body.name || !body.type) {
    return NextResponse.json(
      { message: "Missing required fields" },
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
  const [result] = await conn.execute(
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

  return NextResponse.json({ message: "Customer created", result });
};

export const GET = async (request: Request) => {
  const conn = await createConnection();
  const [rows]: any = await conn.execute(
    `SELECT id, type, name, company_name, phone, email, created_at FROM customers ORDER BY created_at DESC LIMIT 50`
  );
  return NextResponse.json({ data: rows });
};
