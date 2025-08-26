import { NextResponse } from "next/server";

export const POST = async () => {
  const res = NextResponse.json({ message: "Logged out successfully" });
  // Clear the employee token cookie
  res.cookies.set("employee_token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
  return res;
};
