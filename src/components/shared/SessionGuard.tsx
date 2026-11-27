"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PageLoader } from "@/components/shared/PageLoader";
import { usePageLoading } from "@/context/PageLoadingContext";
import { useAuth } from "@/context/AuthContext";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getRoleDashboardRoute,
  requiresOnboarding,
  type UserRole,
} from "@/lib/auth";

export function SessionGuard({
  role,
  children,
}: {
  role?: UserRole;
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated, authError, retrySession, logout } =
    useAuth();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const adminOnboarding = user?.role === "ADMIN" && pathname === "/onboarding";
  const checkingSession =
    !authError &&
    (isLoading ||
      !isAuthenticated ||
      !user ||
      Boolean(role && user.role !== role) ||
      adminOnboarding ||
      (requiresOnboarding(user) && pathname !== "/onboarding"));
  usePageLoading(checkingSession);
  useEffect(() => {
    if (isLoading || authError) return;
    if (!isAuthenticated) router.replace("/login");
    else if (adminOnboarding) router.replace("/admin/dashboard");
    else if (requiresOnboarding(user) && pathname !== "/onboarding")
      router.replace("/onboarding");
    else if (role && user && user.role !== role)
      router.replace(getRoleDashboardRoute(user.role));
  }, [
    isLoading,
    isAuthenticated,
    authError,
    role,
    user,
    pathname,
    router,
    adminOnboarding,
  ]);
  if (authError)
    return (
      <div className="p-8 space-y-4">
        <p role="alert">{authError}</p>
        <button onClick={retrySession} className="mr-4 underline">
          Retry
        </button>
        <button onClick={logout} className="underline">
          Sign out
        </button>
      </div>
    );
  if (checkingSession) return null;
  return children;
}
