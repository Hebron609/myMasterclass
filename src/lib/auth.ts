/**
 * Auth utilities and constants for Vision2535 Mentorship Platform
 * Handles user role validation, session management, and auth checks
 */
import { useAuthStore } from "@/store/useAuthStore";

export type UserRole = "MENTEE" | "MENTOR" | "ADMIN";

export interface Program {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export const availablePrograms: Program[] = [
  {
    id: "vision-2535",
    name: "Vision 2535",
    description: "Sub description if any",
  },
  {
    id: "fellowship",
    name: "Fellowship Program",
    description: "Sub description if any",
  },
];

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  enrolledPrograms: string[]; // List of program IDs
}

/**
 * Get the current user from session storage (client-side) via Zustand
 */
export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const store = useAuthStore.getState();
  if (!store.verifySession()) return null;
  return store.user;
};

/**
 * Set user session (called after successful login)
 */
export const setUserSession = (user: User, token: string): void => {
  if (typeof window === "undefined") return;
  useAuthStore.getState().login(user, token);
};

/**
 * Clear user session (logout)
 */
export const clearUserSession = (): void => {
  if (typeof window === "undefined") return;
  useAuthStore.getState().logout();
};

/**
 * Get role-specific dashboard route
 */
export const getRoleDashboardRoute = (role: UserRole): string => {
  const routeMap: Record<UserRole, string> = {
    MENTEE: "/mentee/dashboard",
    MENTOR: "/mentor/dashboard",
    ADMIN: "/admin/dashboard",
  };
  return routeMap[role];
};

/**
 * Check if user has required role
 */
export const hasRole = (user: User | null, requiredRole: UserRole): boolean => {
  return user?.role === requiredRole;
};

/**
 * Check if user has any of the required roles
 */
export const hasAnyRole = (
  user: User | null,
  requiredRoles: UserRole[],
): boolean => {
  return user ? requiredRoles.includes(user.role) : false;
};

/**
 * Get navigation items based on role
 */
export const getRoleNavigation = (role: UserRole) => {
  const navigationMap: Record<
    UserRole,
    Array<{ name: string; href: string }>
  > = {
    MENTEE: [
      { name: "Dashboard", href: "/mentee/dashboard" },
      { name: "Goals", href: "/mentee/goals" },
      { name: "Sessions", href: "/mentee/sessions" },
      { name: "Reflections", href: "/mentee/reflections" },
      { name: "All Mentors", href: "/mentee/mentors" },
      { name: "Certificates", href: "/mentee/certificates" },
      { name: "Profile", href: "/mentee/profile" },
    ],
    MENTOR: [
      { name: "Dashboard", href: "/mentor/dashboard" },
      { name: "Goals", href: "/mentor/goals" },
      { name: "Sessions", href: "/mentor/sessions" },
      { name: "Reflections", href: "/mentor/reflections" },
      { name: "All Mentees", href: "/mentor/mentees" },
      { name: "Certificates", href: "/mentor/certificates" },
      { name: "Profile", href: "/mentor/profile" },
    ],
    ADMIN: [
      { name: "Dashboard", href: "/admin/dashboard" },
      { name: "Cohorts", href: "/admin/cohorts" },
      { name: "Users", href: "/admin/users" },
      { name: "Reports", href: "/admin/reports" },
      { name: "Certificates", href: "/admin/certificates" },
      { name: "Settings", href: "/admin/settings" },
    ],
  };

  return navigationMap[role];
};
