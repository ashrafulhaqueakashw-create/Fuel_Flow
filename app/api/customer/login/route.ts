import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "fuelflow",
    });

    const [rows] = await connection.execute(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );

    await connection.end();

    const customers = rows as any[];
    if (customers.length === 0) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const customer = customers[0];
    let isPasswordValid = false;
    if (customer.password) {
      try {
        const normalizedHash = customer.password.replace(/^\$2y\$/, "$2a$");
        isPasswordValid = await bcrypt.compare(password, normalizedHash);
      } catch {
        isPasswordValid = false;
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email, type: "customer" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const response = NextResponse.json({
      message: "Login successful",
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        type: customer.type,
      },
    });

    response.cookies.set("customer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Customer login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
