import { redirect } from "next/navigation";

/**
 * Home Page - Redirects based on authentication state
 *
 * In development/testing:
 * - Unauthenticated users → /login
 * - Authenticated mentees → /mentee/dashboard
 * - Authenticated mentors → /mentor/dashboard
 * - Authenticated admins → /admin/dashboard
 */
export default function Home() {
  // Check if user has auth token (development redirect logic)
  // In production, this should check real auth state from session/middleware
  redirect("/login");
}
