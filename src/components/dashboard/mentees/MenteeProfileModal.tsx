"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Trophy } from "lucide-react";
import { MenteeRecord } from "./MenteeTable";

interface MenteeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentee: MenteeRecord | null;
  onBookSession: (mentee: MenteeRecord) => void;
}

type TabType = "Overview" | "Goals" | "Achievements";

export default function MenteeProfileModal({
  isOpen,
  onClose,
  mentee,
  onBookSession,
}: MenteeProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Overview");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted || !mentee) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-[#E5E7EB]">
        {/* Modal Header */}
        <div className="px-8 py-6 flex justify-between items-center border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-[20px] font-bold text-[#003F3A] font-dm-sans">
              {mentee.name}
            </h2>
            <p className="text-[13px] text-[#6B7280] font-rubik mt-0.5">
              {mentee.title} • {mentee.cohort}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Card Snippet */}
        <div className="px-8 mb-6">
          <div className="bg-[#FAF9F6] rounded-2xl p-6 border border-gray-100 flex gap-6 items-center">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-[24px] font-bold text-[#333333] shadow-sm border border-gray-100">
              {mentee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h3 className="text-[18px] font-bold text-[#333333] font-dm-sans">{mentee.name}</h3>
              <p className="text-[13px] text-gray-500 font-rubik mt-0.5">{mentee.title}</p>
              <p className="text-[13px] text-[#4B5563] font-rubik mt-3 leading-relaxed max-w-2xl">
                Environmental advocate focused on climate policy and sustainable development.
              </p>
              <div className="flex gap-2 mt-3">
                {["Environmental Science", "Policy Advocacy", "Public Speaking"].map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-md text-[10px] text-gray-500 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-8 border-b border-[#E5E7EB] bg-white">
          <div className="flex gap-4">
            {["Overview", "Goals", "Achievements"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as TabType)}
                className={`px-6 py-3 text-[15px] font-bold font-dm-sans transition-all rounded-t-lg ${
                  activeTab === tab 
                    ? "bg-[#E5E7EB]/40 text-gray-900" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-8 py-8 overflow-y-auto flex-1 bg-[#F8FAFA]/50">
          {activeTab === "Overview" && <OverviewTab mentee={mentee} />}
          {activeTab === "Goals" && <GoalsTab />}
          {activeTab === "Achievements" && <AchievementsTab />}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-[#E5E7EB] flex justify-end gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-[#D5DCEB] text-[#4B5563] text-[14px] font-semibold rounded-lg hover:bg-gray-50 transition-all font-sans"
          >
            Cancel
          </button>
          <button
            onClick={() => onBookSession(mentee)}
            className="px-6 py-2.5 bg-[#333333] text-white text-[14px] font-semibold rounded-lg hover:bg-[#222222] transition-all font-sans shadow-sm"
          >
            Book 1-on-1 Session
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function OverviewTab({ mentee }: { mentee: MenteeRecord }) {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: "Overall Progress", value: "82%" },
          { label: "Sessions Done", value: "15" },
          { label: "Goals Completed", value: "7" },
          { label: "Total Goals", value: "9" },
        ].map(stat => (
          <div key={stat.label} className="bg-[#FAF9F6] rounded-2xl p-6 text-center shadow-sm">
            <p className="text-[24px] font-bold text-[#333333] font-dm-sans mb-1">{stat.value}</p>
            <p className="text-[12px] text-[#2D2D2D] font-medium font-rubik opacity-70">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Milestones Card */}
      <div className="bg-white border border-[#D5DCEB] rounded-2xl p-8 shadow-sm">
        <h3 className="text-[20px] font-bold text-[#003F3A] font-dm-sans mb-6">Milestones</h3>
        <div className="space-y-4">
          {[
            "Completed all Year 1 modules",
            "Published policy brief",
            "Spoke at climate forum",
          ].map((milestone, i) => (
            <div key={i} className="flex items-center gap-5 p-5 bg-white border border-[#D5DCEB] rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-[#333333] flex items-center justify-center text-white text-[14px] font-bold">
                {i + 1}
              </div>
              <p className="text-[15px] font-bold text-[#333333] font-dm-sans">{milestone}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GoalsTab() {
  return (
    <div className="space-y-8">
      {/* Active Goals Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
        <h3 className="text-[20px] font-bold text-[#003F3A] font-dm-sans mb-6">Goals</h3>
        <div className="space-y-8">
          {[
            { title: "Draft policy proposal", progress: 90, status: "On Track", statusColor: "green" },
            { title: "Organize awareness campaign", progress: 65, status: "In Progress", statusColor: "orange" },
          ].map((goal, i) => (
            <div key={i} className="pb-8 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[16px] font-bold text-[#003F3A] font-dm-sans">{goal.title}</h4>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                   <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#333333] h-full transition-all duration-300" style={{ width: `${goal.progress}%` }} />
                  </div>
                  <span className="text-[12px] font-bold text-[#333333] font-sans">{goal.progress}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${goal.statusColor === 'green' ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <span className="text-[12px] font-medium text-gray-500 font-sans">{goal.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goal History Table */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[20px] font-bold text-[#003F3A] font-dm-sans">Goals</h3>
          <button className="px-4 py-1.5 border border-[#D5DCEB] text-[#4B5563] text-[13px] font-medium rounded-lg font-sans">Filter</button>
        </div>
        <div className="space-y-4">
          {[
            { date: "Mar 2025", title: "Completed Goal: Draft policy proposal" },
            { date: "Feb 2025", title: "Attended 3 mentoring sessions" },
            { date: "Jan 2025", title: "Set new goals for Q1" },
            { date: "Dec 2024", title: "Completed Year 1 modules" },
          ].map((history, i) => (
            <div key={i} className="flex items-center gap-5 p-5 bg-white border border-[#D5DCEB] rounded-xl">
              <span className="text-[12px] text-gray-500 font-sans whitespace-nowrap min-w-[70px]">{history.date}</span>
              <div className="w-4 h-4 rounded-sm border-[2px] border-[#333333] bg-[#333333] flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <p className="text-[14px] font-medium text-[#333333] font-dm-sans">{history.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AchievementsTab() {
  return (
    <div className="space-y-8">
      {/* Achievements Cards */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { title: "Top Performer 2024", year: "2024" },
          { title: "Climate Champion", year: "2024" },
          { title: "Published Researcher", year: "2024" },
        ].map((item, i) => (
          <div key={i} className="bg-[#FAF9F6] border border-gray-100 rounded-2xl p-6 text-center">
            <div className="flex justify-center mb-4">
               <span className="text-3xl">🏆</span>
            </div>
            <p className="text-[15px] font-bold text-[#003F3A] font-dm-sans mb-1">{item.title}</p>
            <p className="text-[12px] text-gray-500 font-sans">Earned {item.year}</p>
          </div>
        ))}
      </div>

      {/* Progress Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
        <h3 className="text-[20px] font-bold text-[#003F3A] font-dm-sans mb-8">Overall Journey Progress</h3>
        <div className="p-8 border border-gray-100 rounded-2xl">
          <h4 className="text-[16px] font-bold text-[#003F3A] font-dm-sans mb-6">Program Completion</h4>
          <div className="flex items-center gap-6">
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="bg-[#333333] h-full" style={{ width: '65%' }} />
            </div>
            <span className="text-[14px] font-bold text-[#333333] font-sans">65%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
