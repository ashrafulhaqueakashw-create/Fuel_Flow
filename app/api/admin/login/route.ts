import { createConnection } from "@/lib/db";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const { username, password } = await request.json();

  const connection = await createConnection();

  // Use parameterized query to prevent SQL injection
  const [rows] = await connection.execute(
    "SELECT * FROM admin WHERE AdminName = ? AND password = ?",
    [username, password]
  );

  if (Array.isArray(rows) && rows.length > 0) {
    return NextResponse.json({ message: "Login successful" });
  } else {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }
};