import { RoleAwareSidebar } from "@/components/dashboard/RoleAwareSidebar";
import { RoleAwareHeader } from "@/components/dashboard/RoleAwareHeader";

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Mentor Navigation */}
      <RoleAwareSidebar userRole="MENTOR" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - Mentor Info */}
        <RoleAwareHeader
          userRole="MENTOR"
          userInfo={{
            firstName: "Dr.",
            lastName: "Mentor Name",
            subtitle: "Mentoring 5 Participants",
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
