"use client";

import { useState } from "react";
import { SessionGuard } from "@/components/shared/SessionGuard";
import { RoleAwareSidebar } from "@/components/dashboard/RoleAwareSidebar";
import { RoleAwareHeader } from "@/components/dashboard/RoleAwareHeader";

export default function MenteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <SessionGuard role="MENTEE">
      <div className="flex h-[100dvh] w-full overflow-hidden bg-[#F9FAF9] p-2.5 sm:p-4 md:p-6 gap-2.5 sm:gap-4 md:gap-6 relative">
        {/* Sidebar - Mentee Navigation */}
        <RoleAwareSidebar
          userRole="MENTEE"
          isOpen={isMobileSidebarOpen}
          setIsOpen={setIsMobileSidebarOpen}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden w-full max-w-full min-w-0">
          {/* Header - Mentee Info */}
          <RoleAwareHeader
            userRole="MENTEE"
            userInfo={{
              firstName: "Year",
              lastName: "2 Participant",
              subtitle: "Year 2 • Cohort 2024A",
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
