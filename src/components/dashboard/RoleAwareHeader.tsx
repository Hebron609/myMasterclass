"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, UserCircle } from "lucide-react";
import { UserRole } from "@/lib/auth";
import { ProgramsModal } from "@/components/dashboard/ProgramsModal";

interface RoleAwareHeaderProps {
  userRole: UserRole;
  userInfo?: {
    firstName: string;
    lastName: string;
    subtitle: string;
  };
}

const DASHBOARD_TITLE = "Dashboard";

export function RoleAwareHeader({
  userRole,
  userInfo = {
    firstName: "User",
    lastName: "Name",
    subtitle: "Participant",
  },
}: RoleAwareHeaderProps) {
  const pathname = usePathname();
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);

  const isDashboardRoute = pathname.endsWith("/dashboard");
  const pageTitle = isDashboardRoute ? DASHBOARD_TITLE : "";

  return (
    <>
      <header className="flex h-20 items-center justify-between border-b border-gray-100 bg-white px-[40px]">
        {/* Left Section */}
        <div className="flex items-center">
          {pageTitle && (
            <h1 className="text-[24px] font-bold text-[#1a3d3d] font-heading">
              {pageTitle}
            </h1>
          )}
        </div>

        {/* Right Section: Tabs, Icons + User Info */}
        <div className="flex items-center gap-4">
          
          {/* Active Programs Tab (Hidden for Admins) */}
          {userRole !== "ADMIN" && (
            <button
              onClick={() => setIsProgramsOpen(true)}
              className="flex items-center gap-2 mr-4 border-b-[1.5px] border-[#333333] pb-1.5 px-1 translate-y-[2px] cursor-pointer hover:border-[#555] transition-colors"
            >
              <span className="text-[15px] font-regular text-gray-900 font-sans">Programs</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E59124] text-[12px] font-medium text-white tracking-tight">
                10
              </span>
            </button>
          )}

          {/* Action Icons */}
          <button
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-[11px] font-medium text-[#3A4252] font-sans leading-tight">
                {userInfo.firstName} {userInfo.lastName}
              </p>
              <p className="text-[9px] font-regular text-[#576176] font-sans">
                {userInfo.subtitle}
              </p>
            </div>

            {/* Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1f4f9]">
              <UserCircle className="h-6 w-6 text-gray-500" />
            </div>
          </div>
        </div>
      </header>

      {/* Programs Modal */}
      <ProgramsModal
        isOpen={isProgramsOpen}
        onClose={() => setIsProgramsOpen(false)}
      />
    </>
  );
}
