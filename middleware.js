import { NextRequest, NextResponse } from "next/server";

export function middleware(req) {
  const protectedRoutes = [
    "/products",
    "/addclient",
    "/getinvouchers",
    "/viewinv",
    "/getoutvouchers",
    "/viewotv",
    "/addoutinvoice",
    "/addinvoice",
    "/report",
    "/getquotation",
    "/addquotation",
    "/viewquotation",
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
  matcher: [
    "/products",
    "/addclient",
    "/getinvouchers",
    "/viewinv",
    "/viewinv/:path*",
    "/getoutvouchers",
    "/viewotv",
    "/viewotv/:path*",
    "/addoutinvoice",
    "/addinvoice",
    "/report",
    "/getquotation",
    "/addquotation",
    "/viewquotation",
    "/viewquotation/:path*",
     "/dashboard"
  ],
};
