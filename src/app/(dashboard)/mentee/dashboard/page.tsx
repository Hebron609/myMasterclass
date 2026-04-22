"use client";

import { useState } from "react";
import { UserCircle, Calendar, Plus, Image } from "lucide-react";
import { ProgramSwitcherWidget } from "@/components/dashboard/widgets/ProgramSwitcherWidget";
import { WriteReflectionModal } from "@/components/dashboard/reflections/WriteReflectionModal";

// Mock data for backend integration
const mockData = {
  journeyProgress: {
    currentYear: 2,
    totalYears: 10,
    nextMilestone: "Complete Year 2 Leadership Module",
  },
  goals: [
    {
      id: 1,
      title: "Improve public speaking skills",
      category: "Career",
      dueDate: "Mar 2025",
      status: "In Progress",
    },
    {
      id: 2,
      title: "Improve public speaking skills",
      category: "Career",
      dueDate: "Mar 2025",
      status: "Completed",
    },
    {
      id: 3,
      title: "Improve public speaking skills",
      category: "Career",
      dueDate: "Mar 2025",
      status: "Not Started",
    },
  ],
  mentorship: {
    mentorName: "[Mentor Name]",
    nextSession: {
      date: "Feb 15, 2025",
      time: "3:00 PM",
    },
  },
  activities: [
    {
      id: 1,
      title: "Submitted goal reflection",
      timestamp: "2 days ago",
      category: "Completed",
    },
    {
      id: 2,
      title: "Attended monthly check-in",
      timestamp: "1 week ago",
      category: "Session",
    },
    {
      id: 3,
      title: "Updated personal goals",
      timestamp: "2 weeks ago",
      category: "Goals",
    },
  ],
  reflections: [
    { id: 1, date: "Jan 13, 2026" },
    { id: 2, date: "Jan 12, 2026" },
    { id: 3, date: "Jan 11, 2026" },
  ],
  workbook: [
    { id: 1, title: "Module 1", status: "Completed" },
    { id: 2, title: "Module 2", status: "Completed" },
    { id: 3, title: "Module 3", status: "Locked" },
    { id: 4, title: "Module 4", status: "Locked" },
  ],
};

export default function MenteeDashboardPage() {
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Program Switcher */}
      <ProgramSwitcherWidget />

      {/* Journey Snapshot */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-[18px] font-bold text-gray-800 mb-6 font-heading">
          Journey Snapshot
        </h2>

        {/* Timeline */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <span className="text-xs text-gray-500 mb-2 font-sans">
                  Y{i + 1}
                </span>
                <div
                  className={`h-2 w-full ${
                    i < 2 ? "bg-[#1a3d3d]" : "bg-gray-200"
                  } ${i === 0 ? "rounded-l-full" : ""} ${
                    i === 9 ? "rounded-r-full" : ""
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 font-sans mt-4">
            Year {mockData.journeyProgress.currentYear} of{" "}
            {mockData.journeyProgress.totalYears}
          </p>
        </div>

        {/* Next Milestone */}
        <div className="bg-[#FCEFC6] rounded-lg p-4">
          <p className="text-xs text-gray-600 font-sans mb-1">NEXT MILESTONE</p>
          <p className="text-[15px] font-bold text-gray-900 font-heading">
            {mockData.journeyProgress.nextMilestone}
          </p>
        </div>
      </section>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Goals */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-[18px] font-bold text-gray-800 mb-4 pb-4 border-b border-gray-100 font-heading">
            Active Goals
          </h2>
          <div className="space-y-3 mb-4">
            {mockData.goals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1 ">
                  <p className="text-[15px] font-medium text-gray-900 font-sans mb-1">
                    {goal.title}
                  </p>
                  <p className="text-xs text-gray-500 font-sans border-b border-gray-100 pb-2">
                    {goal.category} • Due: {goal.dueDate}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-xs font-medium font-sans ${
                    goal.status === "In Progress"
                      ? "bg-[#FCEFC6] text-[#003F3A]"
                      : goal.status === "Completed"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {goal.status}
                </span>
              </div>
            ))}
          </div>
          <button className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-[12px] font-regular text-[#003F3A] hover:border-gray-400 hover:text-gray-700 transition-colors font-sans">
            + Add a New Goal
          </button>
        </section>

        {/* Mentorship */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-[18px] font-bold text-gray-800 mb-4 pb-4 border-b border-gray-100 font-heading">
            Mentorship
          </h2>

          {/* Mentor Info */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <UserCircle className="h-7 w-7 text-gray-400" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900 font-heading">
                {mockData.mentorship.mentorName}
              </p>
              <p className="text-xs text-gray-500 font-sans">Assigned Mentor</p>
            </div>
          </div>

          {/* Next Session */}
          <div className="mb-6">
            <p className="text-[13px] text-gray-600 font-sans">Next Session</p>
            <div className="flex items-center justify-between rounded-lg border-b border-gray-100 pb-2">
              <p className="text-[15px] font-semibold text-[#003F3A] font-heading ">
                {mockData.mentorship.nextSession.date} @{" "}
                {mockData.mentorship.nextSession.time}
              </p>
              <div className="p-4 bg-[#F2F4F8] rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600 " />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="px-4 py-2.5 border border-[#D5DCEB] rounded-lg text-[12px] font-regular text-[#003F3A] hover:bg-gray-50 transition-colors font-sans">
              View Past Sessions
            </button>
            <button className="px-4 py-2.5 bg-[#333333] text-white rounded-lg text-[12px] font-regular hover:bg-black transition-colors font-sans">
              Log Reflections
            </button>
          </div>
        </section>

        {/* Activity & Engagement */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-[18px] font-bold text-gray-800 mb-4 pb-4 border-b border-gray-100 font-heading">
            Activity & Engagement
          </h2>
          <div className="space-y-3 mb-4">
            {mockData.activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1">
                  <p className="text-[15px] font-medium text-gray-900 font-sans mb-1">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 font-sans">
                    {activity.timestamp}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-xs font-medium font-sans ${
                    activity.category === "Completed"
                      ? "bg-[#F2F4F8] text-[#003F3A]"
                      : activity.category === "Session"
                      ? "bg-[#F2F4F8] text-[#003F3A]"
                      : "bg-[#F2F4F8] text-[#003F3A]"
                  }`}
                >
                  {activity.category}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-regular hover:bg-gray-200 transition-colors font-sans">
            2 Pending Tasks
          </button>
        </section>

        {/* Reflections */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-[18px] font-bold text-gray-800 mb-4 pb-4 border-b border-gray-100 font-heading">
            Reflections
          </h2>
          <div className="space-y-4 mb-6">
            {mockData.reflections.map((reflection) => (
              <div
                key={reflection.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1 space-y-2">
                  <div className="h-2 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                </div>
                <span className="text-xs text-gray-500 font-sans ml-4">
                  {reflection.date}
                </span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setIsReflectionModalOpen(true)}
            className="px-4 py-2.5 bg-[#333333] text-white rounded-lg text-[12px] font-regular hover:bg-black transition-colors font-sans"
          >
            + Write a New Reflection
          </button>
        </section>
      </div>

      {/* Workbook */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-[18px] font-bold text-gray-800 mb-6 font-heading">
          Workbook
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockData.workbook.map((module) => (
            <div
              key={module.id}
              className={`rounded-lg border ${
                module.status === "Locked"
                  ? "opacity-50 border-gray-200"
                  : "border-gray-200"
              }`}
            >
              <div className="bg-gray-100 rounded-t-lg flex items-center justify-center h-32">
                <Image className="h-12 w-12 text-gray-400" />
              </div>
              <div className="p-4 text-center">
                <p className="text-[14px] font-bold text-gray-900 font-heading mb-1">
                  {module.title}
                </p>
                <p className="text-xs text-gray-500 font-sans">{module.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modals */}
      <WriteReflectionModal 
        isOpen={isReflectionModalOpen}
        onClose={() => setIsReflectionModalOpen(false)}
      />
    </div>
  );
}
