import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("customer_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const customerId = decoded.id;

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "fuelflow",
    });

    const [rows] = await connection.execute(
      "SELECT id, type, name, company_name, phone, email, address, created_at FROM customers WHERE id = ?",
      [customerId]
    );

    await connection.end();

    const customers = rows as any[];
    if (customers.length === 0) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      customer: customers[0],
    });
  } catch (error) {
    console.error("Customer profile error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
