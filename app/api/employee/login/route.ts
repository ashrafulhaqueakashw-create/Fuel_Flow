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

  // compare password with bcrypt hash (supports $2y$ from PHP)
  let ok = false;
  if (employee.password_hash) {
    try {
      const normalizedHash = employee.password_hash.replace(/^\$2y\$/, "$2a$");
      ok = await bcrypt.compare(password, normalizedHash);
    } catch {
      ok = false;
    }
  }
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
