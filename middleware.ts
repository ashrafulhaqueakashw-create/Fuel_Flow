import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // protect /admin routes
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("token");
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // protect /employee routes (but not /employee-login)
  if (
    pathname.startsWith("/employee") &&
    !pathname.startsWith("/employee-login")
  ) {
    const employeeToken = req.cookies.get("employee_token");
    if (!employeeToken) {
      const url = req.nextUrl.clone();
      url.pathname = "/employee-login";
      return NextResponse.redirect(url);
    }
  }

  // protect /customer routes
  if (pathname.startsWith("/customer")) {
    const customerToken = req.cookies.get("customer_token");
    if (!customerToken) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
