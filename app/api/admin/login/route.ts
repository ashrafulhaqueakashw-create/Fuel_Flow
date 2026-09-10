import { createConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export const POST = async (request: Request) => {
  const { username, password } = await request.json();

  const connection = await createConnection();

  const [rows]: any = await connection.execute(
    "SELECT * FROM admin WHERE AdminName = ?",
    [username]
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const admin = rows[0];

  // compare password - supports bcrypt hash or direct plain text match
  let ok = password === admin.password;
  if (!ok && admin.password) {
    try {
      ok = await bcrypt.compare(password, admin.password);
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
    id: admin.AdminID || admin.id,
    name: admin.AdminName,
    role: "admin",
  });
  const res = NextResponse.json({ message: "Login successful" });
  // set HttpOnly cookie
  res.cookies.set("token", token, { httpOnly: true, path: "/" });
  return res;
};
