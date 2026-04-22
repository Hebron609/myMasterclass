import { RoleAwareSidebar } from "@/components/dashboard/RoleAwareSidebar";
import { RoleAwareHeader } from "@/components/dashboard/RoleAwareHeader";

export default function MenteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Mentee Navigation */}
      <RoleAwareSidebar userRole="MENTEE" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - Mentee Info */}
        <RoleAwareHeader
          userRole="MENTEE"
          userInfo={{
            firstName: "Year",
            lastName: "2 Participant",
            subtitle: "Year 2 • Cohort 2024A",
          }}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F9FAF9] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
