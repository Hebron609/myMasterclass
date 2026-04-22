import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for Vision2535 Mentorship Platform
 * Protects routes and enforces role-based access
 *
 * Route Protection Rules:
 * - /mentee/* → Only MENTEE role
 * - /mentor/* → Only MENTOR role
 * - /admin/* → Only ADMIN role
 * - /auth/* → Public (for unauthenticated users)
 * - / → Redirect to /mentee/dashboard (default) or login
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - allow access without auth
  const publicRoutes = [
    "/",
    "/login",
    "/forgot-password",
    "/reset-password",
    "/otp",
  ];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get user role from cookies (set after successful login)
  const userRole = request.cookies.get("user_role")?.value;
  const authToken = request.cookies.get("auth_token")?.value;

  // If no auth token, redirect to login
  if (!authToken || !userRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based route protection
  const roleRouteMap: Record<string, string[]> = {
    MENTEE: ["/mentee", "/select-program"],
    MENTOR: ["/mentor", "/select-program"],
    ADMIN: ["/admin", "/select-program"],
  };

  const allowedRoutes = roleRouteMap[userRole] || [];
  const isAllowedRoute = allowedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // If user tries to access a route not allowed for their role
  if (!isAllowedRoute) {
    // Redirect to their role's dashboard
    const redirectRoute =
      userRole === "MENTEE"
        ? "/mentee/dashboard"
        : userRole === "MENTOR"
          ? "/mentor/dashboard"
          : "/admin/dashboard";

    return NextResponse.redirect(new URL(redirectRoute, request.url));
  }

  return NextResponse.next();
}

/**
 * Configure which routes use this middleware
 * Protect all dashboard routes but allow auth routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
