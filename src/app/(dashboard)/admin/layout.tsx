"use client";

import { useState } from "react";
import { SessionGuard } from "@/components/shared/SessionGuard";
import { RoleAwareSidebar } from "@/components/dashboard/RoleAwareSidebar";
import { RoleAwareHeader } from "@/components/dashboard/RoleAwareHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <SessionGuard role="ADMIN">
      <div className="flex h-[100dvh] w-full overflow-hidden bg-[#F9FAF9] p-2.5 sm:p-4 md:p-6 gap-2.5 sm:gap-4 md:gap-6 relative">
        {/* Sidebar - Admin Navigation */}
        <RoleAwareSidebar
          userRole="ADMIN"
          isOpen={isMobileSidebarOpen}
          setIsOpen={setIsMobileSidebarOpen}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden w-full max-w-full min-w-0">
          {/* Header - Admin Info */}
          <RoleAwareHeader
            userRole="ADMIN"
            userInfo={{
              firstName: "Admin",
              lastName: "Dashboard",
              subtitle: "Vision2535 Team",
            }}
            onMenuClick={() => setIsMobileSidebarOpen(true)}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden pt-3 sm:pt-4 md:pt-6 pb-4">
            {children}
          </main>
        </div>
      </div>
    </SessionGuard>
  );
}
