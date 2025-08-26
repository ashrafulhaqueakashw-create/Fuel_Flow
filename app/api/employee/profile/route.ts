import { createConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export const GET = async (request: Request) => {
  const cookies = request.headers.get("cookie");
  const employeeToken = cookies
    ?.split(";")
    .find((c) => c.trim().startsWith("employee_token="))
    ?.split("=")[1];

  if (!employeeToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(employeeToken) as any;
  if (!decoded || decoded.role !== "employee") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const connection = await createConnection();
  const [rows]: any = await connection.execute(
    "SELECT id, name, role, email, phone, salary, hire_date, status, created_at FROM employees WHERE id = ? AND status = 'active'",
    [decoded.id]
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { message: "Employee not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: rows[0] });
};
