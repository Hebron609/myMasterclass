"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Target,
  Calendar,
  Users,
  UserCircle,
  LogOut,
  Search,
  Mail,
  BarChart3,
  Settings,
  MessageSquare,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole, getRoleNavigation } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";

interface MenteeAwareSidebarProps {
  userRole: UserRole;
}

const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <Home className="h-5 w-5" />,
  Goals: <Target className="h-5 w-5" />,
  Sessions: <Calendar className="h-5 w-5" />,
  Reflections: <Users className="h-5 w-5" />,
  Profile: <UserCircle className="h-5 w-5" />,
  Mentees: <Users className="h-5 w-5" />,
  "All Mentors": <Users className="h-5 w-5" />,
  "All Mentees": <Users className="h-5 w-5" />,
  Certificates: <Award className="h-5 w-5" />,
  Cohorts: <BarChart3 className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  Reports: <BarChart3 className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
};

export function RoleAwareSidebar({ userRole }: MenteeAwareSidebarProps) {
  const pathname = usePathname();
  const navigation = getRoleNavigation(userRole);

  const handleLogout = () => {
    // Clear Zustand store
    useAuthStore.getState().logout();

    // Clear cookies
    document.cookie =
      "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    // Redirect to login
    window.location.href = "/login";
  };

  return (
    <div className="flex h-full w-[280px] flex-col bg-[#FFFFFF] border-r border-gray-100">
      {/* Logo/Brand */}
      <div className="px-6 py-6 border-b border-gray-100 mb-6">
        <div className="flex items-center gap-3">
          <Mail className="h-8 w-8 text-gray-700" />
          <span className="text-[24px] font-bold text-[#697077] font-heading">
            Diba Leagleship
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search for..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F2F4F8] border-0 rounded-lg text-[16px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all font-sans"
          />
        </div>
      </div>

      {/* Navigation Menu - Role-Based */}
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const icon = iconMap[item.name] || <Home className="h-5 w-5" />;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg text-[16px] font-medium transition-colors font-heading",
                isActive
                  ? "bg-[#F2F4F8] text-gray-700"
                  : "text-gray-500 hover:bg-[#f1f4f9]/50 hover:text-gray-700",
              )}
            >
              {icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button (Sticky Footer) */}
      <div className="px-4 py-6 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 rounded-lg text-[15px] font-bold text-gray-500 hover:bg-[#f1f4f9]/50 hover:text-gray-700 transition-colors w-full font-heading"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
