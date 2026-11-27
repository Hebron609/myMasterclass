"use client";

import Link from "@/components/shared/AppLink";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  MessageSquare,
  BookOpen,
  Users,
  Award,
  User,
  ChevronLeft,
  Trophy,
  X,
  Building2,
  BarChart3,
  Settings,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole, getRoleNavigation } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { useAuthStore } from "@/store/useAuthStore";
import logoIcon from "../../../public/icons/Diba-Leagleship-Institute-Blk.svg";

interface MenteeAwareSidebarProps {
  userRole: UserRole;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={2.2} />,
  Goals: <Target className="h-[18px] w-[18px]" strokeWidth={2.2} />,
  Sessions: <MessageSquare className="h-[18px] w-[18px]" strokeWidth={2.2} />,
  Reflections: <BookOpen className="h-[18px] w-[18px]" strokeWidth={2.2} />,
  "All Mentors": <Users className="h-[18px] w-[18px]" strokeWidth={2.2} />,
  "All Mentees": <Users className="h-[18px] w-[18px]" strokeWidth={2.2} />,
  Users: <Users className="h-[18px] w-[18px]" strokeWidth={2.2} />,
  Cohorts: <Building2 className="h-[18px] w-[18px]" strokeWidth={2.2} />,
  Reports: <BarChart3 className="h-[18px] w-[18px]" strokeWidth={2.2} />,
  Leaderboard: <Trophy className="h-[18px] w-[18px]" strokeWidth={2.2} />,
  Certificates: <Award className="h-[18px] w-[18px]" strokeWidth={2.2} />,
  Profile: <User className="h-[18px] w-[18px]" strokeWidth={2.2} />,
  Settings: <Settings className="h-[18px] w-[18px]" strokeWidth={2.2} />,
};

export function RoleAwareSidebar({
  userRole,
  isOpen,
  setIsOpen,
}: MenteeAwareSidebarProps) {
  const pathname = usePathname();
  const navigation = getRoleNavigation(userRole);

  // Manually insert Leaderboard to match the screenshot if not present
  const navItems = [...navigation];
  if (
    userRole === "MENTEE" &&
    !navItems.find((n) => n.name === "Leaderboard")
  ) {
    const certIndex = navItems.findIndex((n) => n.name === "Certificates");
    if (certIndex > -1) {
      navItems.splice(certIndex, 0, {
        name: "Leaderboard",
        href: "/mentee/leaderboard",
      });
    }
  }

  const { user, activeProgram } = useAuthStore();
  const { logout } = useAuth();
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";

  const handleLogout = () => {
    logout();

    // Redirect to login
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen?.(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-[270px] flex-col bg-white border-r border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] shrink-0 overflow-hidden transition-transform duration-300 lg:relative lg:translate-x-0 lg:border lg:rounded-[16px]",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo/Brand */}
        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between h-[88px]">
          <Image
            src={logoIcon}
            alt="Diba Leagleship Institute"
            className="h-[36px] w-auto object-contain"
            priority
          />
          {setIsOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mobile Program Switcher Card inside Drawer */}
        <div className="px-4 pt-3.5 lg:hidden">
          <button
            type="button"
            onClick={() => {
              setIsOpen?.(false);
              window.dispatchEvent(new CustomEvent("open-programs-modal"));
            }}
            className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-[10px] bg-[#FAFBF9] border border-gray-200 hover:border-[#DB911E]/50 text-left transition-colors cursor-pointer"
          >
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-sans">
                Active Program
              </span>
              <span className="block text-[13.5px] font-medium text-gray-900 font-sans truncate mt-0.5">
                {activeProgram?.name || "Vision2535 Program"}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#DB911E] shrink-0" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-4 pb-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const icon = iconMap[item.name] || (
              <LayoutDashboard
                className="h-[18px] w-[18px]"
                strokeWidth={2.2}
              />
            );

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen?.(false)} // Close on navigate in mobile
                className={cn(
                  "flex items-center gap-4 px-4 py-2.5 rounded-[8px] text-[14px] transition-colors font-sans font-medium",
                  isActive
                    ? "bg-[#F3F4F6] text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center",
                    isActive ? "text-gray-700" : "text-gray-400",
                  )}
                >
                  {icon}
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Admin Footer */}
        {userRole === "ADMIN" ? (
          <div className="p-4 mt-auto flex justify-center border-t border-gray-100 bg-white">
            <button
              onClick={handleLogout}
              className="h-7 w-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors shadow-sm cursor-pointer"
              aria-label="Collapse / Logout"
              title="Collapse / Logout"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <div className="border-t border-gray-100 p-5 mt-auto bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-orange-100 border border-orange-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${firstName} ${lastName}`.trim() || "Profile"}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/icons/user-placeholder.svg";
                      }}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-orange-700" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-bold text-gray-900 font-sans leading-tight truncate">
                    {firstName} {lastName}
                  </span>
                  <span className="text-[11px] text-gray-500 font-sans mt-0.5 truncate">
                    {user?.journeyYear
                      ? `Year ${user.journeyYear}`
                      : userRole.toLowerCase()}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="h-6 w-6 rounded-full bg-[#F3F4F6] flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors shrink-0"
                aria-label="Sign out"
                title="Sign out"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
