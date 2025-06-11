import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if it's a protected admin route
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login") &&
    !pathname.startsWith("/admin/unauthorized")
  ) {
    // Check for auth tokens in cookies
    const accessToken = request.cookies.get("sb-access-token")

    // If no token, redirect to login
    if (!accessToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all admin routes
     */
    "/admin/:path*",
  ],
}
