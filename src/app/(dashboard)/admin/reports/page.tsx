import { BarChart2, PieChart, User, ChevronDown } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[24px] font-bold text-[#1F2937] font-dm-sans mb-1">
            Reports & Analytics
          </h1>
          <p className="text-[14px] text-[#6B7280] font-rubik">
            Platform insights and exportable reports
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
            Schedule Report
          </button>
          <button className="px-5 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors">
            Export All Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col md:flex-row items-end gap-6">
          <div className="flex-1">
            <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2">Date Range</p>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Start Date"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400"
              />
              <input 
                type="text" 
                placeholder="End Date"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400"
              />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2">Cohorts</p>
            <div className="relative">
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400 appearance-none bg-transparent">
                <option>All Cohorts</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
          <button className="px-6 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors whitespace-nowrap">
            Apply changes
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        {[
          { value: "95", label: "Total Participants" },
          { value: "28", label: "Active Mentors" },
          { value: "42", label: "Sessions This Month" },
          { value: "156", label: "Goals Completed" },
          { value: "287", label: "Reflections" },
          { value: "78%", label: "Avg. Engagements" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-[12px] p-6 text-center shadow-[0px_2px_8px_rgba(0,0,0,0.04)]"
          >
            <p className="text-[28px] font-bold text-[#1F2937] font-dm-sans mb-2 leading-none">
              {stat.value}
            </p>
            <p className="text-[12px] font-medium text-[#4B5563] font-dm-sans leading-tight">
              {stat.label.split(' ').map((word, j) => <span key={j}>{word}<br/></span>)}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6">
            Engagement Overview
          </h2>
          <div className="h-[250px] border border-gray-200 rounded-[8px] bg-[#FAFAFA] flex flex-col items-center justify-center text-[#6B7280]">
            <BarChart2 size={32} className="mb-4" />
            <p className="text-[14px] font-medium font-dm-sans text-center px-4">Monthly Engagement Trends (Line Chart)</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6">
            User Activity Distribution
          </h2>
          <div className="h-[250px] border border-gray-200 rounded-[8px] bg-[#FAFAFA] flex flex-col items-center justify-center text-[#6B7280]">
            <BarChart2 size={32} className="mb-4" />
            <p className="text-[14px] font-medium font-dm-sans text-center px-4">Activity Breakdown (Pie Chart)</p>
          </div>
        </div>
      </div>

      {/* Goal Completion */}
      <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 border-b border-gray-100 pb-4">
          Goal Completion by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: "Career", percent: "77%", sub: "45/60 goals" },
            { title: "Leadership", percent: "77%", sub: "38/50 goals" },
            { title: "Personal", percent: "77%", sub: "52/70 goals" },
            { title: "Educational", percent: "77%", sub: "21/30 goals" },
          ].map((cat, i) => (
            <div key={i} className="border border-gray-200 rounded-[12px] p-6 flex flex-col items-center">
              <p className="text-[15px] font-bold text-[#1F2937] font-dm-sans mb-6">{cat.title}</p>
              
              <div className="relative w-24 h-24 mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="text-[#333333]"
                    strokeDasharray="77, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="text-[8px] text-[#6B7280] font-rubik leading-tight">Completed</p>
                  <p className="text-[16px] font-bold text-[#1F2937] font-dm-sans leading-none mt-1">{cat.percent}</p>
                </div>
              </div>

              <p className="text-[11px] text-[#6B7280] font-rubik">{cat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Participants */}
        <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] flex flex-col">
          <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 border-b border-gray-100 pb-4">
            Top Performing Participants
          </h2>
          <div className="space-y-0 flex-1">
            {[
              { name: "[Participant 1]", score: "95%" },
              { name: "[Participant 2]", score: "90%" },
              { name: "[Participant 3]", score: "85%" },
              { name: "[Participant 4]", score: "80%" },
              { name: "[Participant 5]", score: "75%" },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#6B7280] border border-gray-200 shrink-0">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#1F2937] font-dm-sans">{p.name}</p>
                    <p className="text-[13px] text-[#6B7280] font-rubik">Cohort 2024A</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[16px] font-bold text-[#1F2937] font-dm-sans">{p.score}</p>
                  <p className="text-[12px] text-[#6B7280] font-rubik">Engagement</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
            View Calendar
          </button>
        </div>

        {/* Attention Required */}
        <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 border-b border-gray-100 pb-4">
            Attention Required
          </h2>
          
          <div className="bg-[#FEF3C7] rounded-[12px] p-6 mb-6 border border-[#FDE68A]">
            <h3 className="text-[15px] font-bold text-[#92400E] font-dm-sans mb-2">
              Users with No Recent Activity
            </h3>
            <p className="text-[13px] text-[#B45309] font-rubik mb-4">
              The following users have not logged in or completed any activities in the last 30 days.
            </p>
            <div className="space-y-2 mb-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-[8px] p-3 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 border border-gray-200">
                      <User size={14} />
                    </div>
                    <span className="text-[14px] font-bold text-[#1F2937] font-dm-sans">
                      [Inactive User {i}]
                    </span>
                  </div>
                  <span className="text-[12px] text-[#6B7280] font-rubik">
                    Last seen: {30 + i} days ago
                  </span>
                </div>
              ))}
            </div>
            <button className="px-5 py-2 border border-[#D97706] rounded-[8px] text-[13px] font-medium text-[#92400E] bg-transparent hover:bg-[#FDE68A] transition-colors">
              Send Reminder
            </button>
          </div>

          <div className="border border-gray-200 rounded-[12px] p-6">
            <h3 className="text-[15px] font-bold text-[#1F2937] font-dm-sans mb-1">
              Unassigned Participants
            </h3>
            <p className="text-[13px] text-[#6B7280] font-rubik mb-4">
              4 participants without assigned mentors
            </p>
            <button className="px-5 py-2 border border-gray-300 rounded-[8px] text-[13px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
              Assign Now
            </button>
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 border-b border-gray-100 pb-4">
          Available Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Session Summary Report", desc: "All sessions logged with details", formats: "CSV / PDF" },
            { title: "Goal Progress Report", desc: "Goals by status and category", formats: "CSV / PDF" },
            { title: "User Engagement Report", desc: "Activity metrics per user", formats: "CSV" },
            { title: "Cohort Overview Report", desc: "Summary by cohort", formats: "PDF" },
            { title: "Mentor Assignment Report", desc: "Mentor-mentee relationships", formats: "CSV" },
            { title: "Reflection Analysis", desc: "Reflection entries and tags", formats: "CSV / PDF" },
          ].map((report, i) => (
            <div key={i} className="border border-gray-200 rounded-[12px] p-6 relative flex flex-col justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-[#1F2937] font-dm-sans mb-1">{report.title}</h3>
                <p className="text-[13px] text-[#6B7280] font-rubik mb-6">{report.desc}</p>
              </div>
              <div className="flex justify-between items-end mt-4">
                <span className="text-[11px] text-[#6B7280] font-medium">{report.formats}</span>
                <button className="px-5 py-2 border border-gray-300 rounded-[8px] text-[13px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
