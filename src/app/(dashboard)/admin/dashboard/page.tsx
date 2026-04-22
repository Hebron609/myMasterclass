import { Search, Filter, ArrowRight, BarChart2, Calendar, CheckSquare, PieChart, Users } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { value: "156", label: "Total Participants", sub: "+12 this month" },
          { value: "24", label: "Total Mentors", sub: "Active Mentors" },
          { value: "4", label: "Active Cohorts", sub: "2024-2025" },
          { value: "89", label: "Sessions Logged", sub: "This month" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-[12px] p-6 text-center shadow-[0px_2px_8px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center"
          >
            <p className="text-[32px] font-bold text-[#1F2937] font-dm-sans mb-1 leading-none">
              {stat.value}
            </p>
            <p className="text-[14px] font-medium text-[#4B5563] font-dm-sans mb-1">
              {stat.label}
            </p>
            <p className="text-[12px] text-[#9CA3AF] font-rubik">
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Cohorts Management */}
      <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 border-b border-gray-100 pb-4">
          Cohorts Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[
            { name: "Cohort 2024A", participants: 42, mentors: 6 },
            { name: "Cohort 2024B", participants: 38, mentors: 5 },
            { name: "Cohort 2023A", participants: 40, mentors: 7 },
            { name: "Cohort 2023B", participants: 36, mentors: 6 },
          ].map((cohort, i) => (
            <div key={i} className="border border-gray-200 rounded-[12px] p-5">
              <h3 className="text-[15px] font-bold text-[#374151] font-dm-sans text-center mb-4">
                {cohort.name}
              </h3>
              <div className="flex justify-between items-center mb-5 px-2">
                <div className="text-center">
                  <p className="text-[20px] font-bold text-[#1F2937] font-dm-sans">{cohort.participants}</p>
                  <p className="text-[12px] text-[#6B7280] font-rubik">Participants</p>
                </div>
                <div className="text-center">
                  <p className="text-[20px] font-bold text-[#1F2937] font-dm-sans">{cohort.mentors}</p>
                  <p className="text-[12px] text-[#6B7280] font-rubik">Mentors</p>
                </div>
              </div>
              <button className="w-full py-2 border border-gray-300 rounded-[6px] text-[13px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                Manage
              </button>
            </div>
          ))}
        </div>
        <button className="bg-[#333333] text-white px-5 py-2.5 rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors">
          + Create New Cohort
        </button>
      </div>

      {/* Participants and Mentors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Participants */}
        <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 border-b border-gray-100 pb-4">
            Participants
          </h2>
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search participants..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400"
              />
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-[8px] text-[14px] font-medium text-[#4B5563] flex items-center gap-2 hover:bg-gray-50">
              Filter
            </button>
          </div>
          <div className="space-y-0">
            {[
              { name: "Sarah M.", detail: "Cohort 2024A • Year 2", status: "Active" },
              { name: "John D.", detail: "Cohort 2024A • Year 1", status: "Active" },
              { name: "Amina K.", detail: "Cohort 2024B • Year 3", status: "Active" },
              { name: "David O.", detail: "Cohort 2024A • Year 2", status: "Inactive" },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-[15px] font-bold text-[#1F2937] font-dm-sans mb-1">{p.name}</p>
                  <p className="text-[13px] text-[#6B7280] font-rubik">{p.detail}</p>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-[12px] font-medium rounded-[4px]">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6 pt-4">
            <button className="flex-1 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
              View All (156)
            </button>
            <button className="flex-1 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors">
              + Add Participant
            </button>
          </div>
        </div>

        {/* Mentors */}
        <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 border-b border-gray-100 pb-4">
            Mentors
          </h2>
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search mentors..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400"
              />
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-[8px] text-[14px] font-medium text-[#4B5563] flex items-center gap-2 hover:bg-gray-50">
              Filter
            </button>
          </div>
          <div className="space-y-0">
            {[
              { name: "Dr. James O.", detail: "8 mentees • Cohort 2024A", status: "Active" },
              { name: "Prof. Mary K.", detail: "6 mentees • Cohort 2024B", status: "Active" },
              { name: "Mr. Peter N.", detail: "7 mentees • Cohort 2023A", status: "Active" },
              { name: "Ms. Grace A.", detail: "5 mentees • Cohort 2024A", status: "Active" },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-[15px] font-bold text-[#1F2937] font-dm-sans mb-1">{m.name}</p>
                  <p className="text-[13px] text-[#6B7280] font-rubik">{m.detail}</p>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-[12px] font-medium rounded-[4px]">
                  {m.status}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6 pt-4">
            <button className="flex-1 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
              View All (24)
            </button>
            <button className="flex-1 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors">
              + Mentor
            </button>
          </div>
        </div>
      </div>

      {/* Mentor Assignment */}
      <div className="bg-[#FCF9F0] border border-[#F0E6D2] rounded-[16px] p-8 shadow-sm">
        <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 border-b border-[#F0E6D2] pb-4">
          Mentor Assignment
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
          <div className="w-full max-w-[320px] bg-[#FCF9F0] border border-[#E5D8BC] rounded-[12px] p-5 shadow-sm">
            <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans mb-3">Select Participant</p>
            <div className="bg-white border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] text-gray-400 mb-4 cursor-pointer">
              Choose participant...
            </div>
            <div className="h-[80px] border border-dashed border-[#D1C5AA] rounded-[8px] flex items-center justify-center text-[13px] text-[#8C836F]">
              Participant preview
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-10 bg-[#333333] rounded-[8px] flex items-center justify-center text-white mb-2 shadow-sm">
              <ArrowRight size={20} />
            </div>
            <span className="text-[13px] font-medium text-[#4B5563]">Assign To</span>
          </div>

          <div className="w-full max-w-[320px] bg-[#FCF9F0] border border-[#E5D8BC] rounded-[12px] p-5 shadow-sm">
            <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans mb-3">Select Participant</p>
            <div className="bg-white border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] text-gray-400 mb-4 cursor-pointer">
              Choose participant...
            </div>
            <div className="h-[80px] border border-dashed border-[#D1C5AA] rounded-[8px] flex items-center justify-center text-[13px] text-[#8C836F]">
              Participant preview
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <button className="bg-[#333333] text-white px-6 py-2.5 rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors">
            Confirm Assignment
          </button>
        </div>
      </div>

      {/* Activity Monitoring */}
      <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 border-b border-gray-100 pb-4">
          Activity Monitoring
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#F9FAFB] rounded-[12px] p-6 text-center">
            <p className="text-[28px] font-bold text-[#1F2937] font-dm-sans mb-1">142</p>
            <p className="text-[13px] font-medium text-[#4B5563] mb-1">Active Users</p>
            <p className="text-[11px] text-[#9CA3AF]">(Last 30 days)</p>
          </div>
          <div className="bg-[#F9FAFB] rounded-[12px] p-6 text-center">
            <p className="text-[28px] font-bold text-[#EF4444] font-dm-sans mb-1">14</p>
            <p className="text-[13px] font-medium text-[#4B5563] mb-1">Inactive Users</p>
            <p className="text-[11px] text-[#9CA3AF]">(No activity 30+ days)</p>
          </div>
          <div className="bg-[#F9FAFB] rounded-[12px] p-6 text-center">
            <p className="text-[28px] font-bold text-[#1F2937] font-dm-sans mb-1">91%</p>
            <p className="text-[13px] font-medium text-[#4B5563] mb-1">Engagement Rate</p>
            <p className="text-[11px] text-[#9CA3AF]">(This month)</p>
          </div>
        </div>

        <div>
          <h3 className="text-[14px] font-bold text-[#4B5563] font-dm-sans mb-4">Users with No Activity</h3>
          <div className="space-y-0">
            {[
              { name: "David O. (Participant)", detail: "Last active: 45 days ago" },
              { name: "Emma T. (Participant)", detail: "Last active: 32 days ago" },
              { name: "Robert M. (Mentor)", detail: "Last active: 38 days ago" },
            ].map((user, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-[14px] font-bold text-[#1F2937] font-dm-sans mb-1">{user.name}</p>
                  <p className="text-[12px] text-[#6B7280] font-rubik">{user.detail}</p>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-[11px] font-medium rounded-[4px]">
                  Needs Follow-up
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 border-b border-gray-100 pb-4">
          Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: "Engagement Report", icon: BarChart2 },
            { title: "Session Summary", icon: Calendar },
            { title: "Goal Completion", icon: CheckSquare },
            { title: "Cohort Overview", icon: PieChart },
          ].map((report, i) => (
            <div key={i} className="border border-gray-200 rounded-[12px] p-6 text-center flex flex-col items-center">
              <report.icon size={24} className="text-[#6B7280] mb-4" />
              <p className="text-[14px] font-bold text-[#1F2937] font-dm-sans mb-1">{report.title}</p>
              <p className="text-[11px] text-[#6B7280] mb-5">Export: CSV / PDF</p>
              <button className="w-full py-2 border border-gray-300 rounded-[6px] text-[13px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                Generate
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Settings */}
      <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 border-b border-gray-100 pb-4">
          Platform Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-[12px] p-5 hover:bg-gray-50 cursor-pointer transition-colors">
            <p className="text-[15px] font-bold text-[#1F2937] font-dm-sans mb-1">General Settings</p>
            <p className="text-[13px] text-[#6B7280] font-rubik">Platform name, branding, defaults</p>
          </div>
          <div className="border border-gray-200 rounded-[12px] p-5 hover:bg-gray-50 cursor-pointer transition-colors">
            <p className="text-[15px] font-bold text-[#1F2937] font-dm-sans mb-1">User Roles</p>
            <p className="text-[13px] text-[#6B7280] font-rubik">Permissions, access control</p>
          </div>
          <div className="border border-gray-200 rounded-[12px] p-5 hover:bg-gray-50 cursor-pointer transition-colors">
            <p className="text-[15px] font-bold text-[#1F2937] font-dm-sans mb-1">Notifications</p>
            <p className="text-[13px] text-[#6B7280] font-rubik">Email templates, reminders</p>
          </div>
        </div>
      </div>
    </div>
  );
}

