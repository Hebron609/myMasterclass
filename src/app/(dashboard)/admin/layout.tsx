import { RoleAwareSidebar } from "@/components/dashboard/RoleAwareSidebar";
import { RoleAwareHeader } from "@/components/dashboard/RoleAwareHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Admin Navigation */}
      <RoleAwareSidebar userRole="ADMIN" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - Admin Info */}
        <RoleAwareHeader
          userRole="ADMIN"
          userInfo={{
            firstName: "Admin",
            lastName: "Dashboard",
            subtitle: "Vision2535 Team",
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
