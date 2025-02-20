import { NextRequest, NextResponse } from "next/server";

export function middleware(req) {
  const protectedRoutes = [
    "/products",
    "/addclient",
    "/addinvoice",
    "/addoutinvoice",
    "/quotation",
    "/report",
    "/dashboard"
  ];

  const userDetails = req.cookies.get("user_details")?.value;

  // Check if the route is protected
  if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    if (!userDetails) {
      return NextResponse.redirect(new URL("/login", req.url)); // Redirect to login
    }
  }

  return NextResponse.next();
}

// Apply middleware only to the specified routes
export const config = {
  matcher: ["/products", "/addclient", "/addinvoice", "/addoutinvoice", "/quotation", "/report", "/dashboard"],
};
