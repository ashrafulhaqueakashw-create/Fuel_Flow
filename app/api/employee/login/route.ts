import { createConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export const POST = async (request: Request) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 }
    );
  }

  const connection = await createConnection();

  const [rows]: any = await connection.execute(
    "SELECT * FROM employees WHERE email = ? AND status = 'active'",
    [email]
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const employee = rows[0];

  // compare password with bcrypt hash
  const ok = await bcrypt.compare(password, employee.password_hash);
  if (!ok)
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );

  const token = signToken({
    id: employee.id,
    name: employee.name,
    role: "employee",
    employeeRole: employee.role,
    email: employee.email,
  });

  const res = NextResponse.json({ message: "Login successful" });
  // set HttpOnly cookie for employee
  res.cookies.set("employee_token", token, { httpOnly: true, path: "/" });
  return res;
};
