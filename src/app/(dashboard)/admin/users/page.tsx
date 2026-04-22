"use client";

import { useState } from "react";
import { Search, User, MoreVertical, X } from "lucide-react";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<"participants" | "mentors">("participants");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

  const participants = [
    { name: "[Participant 1]", email: "participant1@email.com", cohort: "2024A", year: "Year 2", mentor: "[Mentor 2]", status: "Active" },
    { name: "[Participant 2]", email: "participant2@email.com", cohort: "2024A", year: "Year 2", mentor: "[Mentor 3]", status: "Active" },
    { name: "[Participant 3]", email: "participant3@email.com", cohort: "2024A", year: "Year 1", mentor: "[Mentor 1]", status: "Active" },
    { name: "[Participant 4]", email: "participant4@email.com", cohort: "2024A", year: "Year 2", mentor: "Unassigned", status: "Pending" },
    { name: "[Participant 5]", email: "participant5@email.com", cohort: "2024A", year: "Year 3", mentor: "[Mentor 3]", status: "Inactive" },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[24px] font-bold text-[#1F2937] font-dm-sans mb-1">
            User Management
          </h1>
          <p className="text-[14px] text-[#6B7280] font-rubik">
            Manage participants and mentors
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
            Import User
          </button>
          <button className="px-4 py-2 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors">
            + Add User
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { value: "126", label: "Total Users" },
          { value: "95", label: "Participants" },
          { value: "31", label: "Mentors" },
          { value: "118", label: "Active" },
          { value: "4", label: "Unassigned" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-[12px] p-6 text-center shadow-[0px_2px_8px_rgba(0,0,0,0.04)]"
          >
            <p className="text-[32px] font-bold text-[#1F2937] font-dm-sans mb-2 leading-none">
              {stat.value}
            </p>
            <p className="text-[13px] font-medium text-[#4B5563] font-dm-sans">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("participants")}
            className={`px-6 py-3 text-[15px] font-bold transition-colors rounded-t-[8px] ${
              activeTab === "participants" 
                ? "bg-[#F3F4F6] text-[#1F2937]" 
                : "text-[#6B7280] hover:bg-gray-50"
            }`}
          >
            Participants
          </button>
          <button 
            onClick={() => setActiveTab("mentors")}
            className={`px-6 py-3 text-[15px] font-bold transition-colors rounded-t-[8px] ${
              activeTab === "mentors" 
                ? "bg-[#F3F4F6] text-[#1F2937]" 
                : "text-[#6B7280] hover:bg-gray-50"
            }`}
          >
            Mentors
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans">
            {activeTab === "participants" ? "Participants (5)" : "Mentors (4)"}
          </h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400 w-[250px]"
              />
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === "participants" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Name</th>
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Email</th>
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Cohort</th>
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Year</th>
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Mentor</th>
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Status</th>
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#6B7280] border border-gray-200 shrink-0">
                          <User size={14} />
                        </div>
                        <span className="text-[14px] font-medium text-[#4B5563] font-dm-sans">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[13px] text-[#6B7280]">
                      {p.email}
                    </td>
                    <td className="py-4 px-4 text-[13px] text-[#6B7280]">
                      {p.cohort}
                    </td>
                    <td className="py-4 px-4 text-[13px] text-[#6B7280]">
                      {p.year}
                    </td>
                    <td className={`py-4 px-4 text-[13px] ${p.mentor === 'Unassigned' ? 'text-red-500' : 'text-[#6B7280]'}`}>
                      {p.mentor}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 text-[11px] font-medium rounded-[4px] ${
                        p.status === 'Active' ? 'bg-[#333333] text-white' :
                        p.status === 'Pending' ? 'bg-[#FEF3C7] text-[#92400E]' :
                        'bg-[#E5E7EB] text-[#4B5563]'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Name</th>
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Email</th>
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans text-center">Mentees</th>
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans text-center">Sessions</th>
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Expertise</th>
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Status</th>
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "[Mentor 1]", email: "mentor1@email.com", mentees: 5, sessions: 24, expertise: "Skills", status: "Active" },
                  { name: "[Mentor 2]", email: "mentor2@email.com", mentees: 4, sessions: 18, expertise: "Skills", status: "Active" },
                  { name: "[Mentor 3]", email: "mentor3@email.com", mentees: 3, sessions: 12, expertise: "Skills", status: "Active" },
                  { name: "[Mentor 4]", email: "mentor4@email.com", mentees: 0, sessions: 0, expertise: "Skills", status: "Inactive" },
                ].map((m, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#6B7280] border border-gray-200 shrink-0">
                          <User size={14} />
                        </div>
                        <span className="text-[14px] font-medium text-[#4B5563] font-dm-sans">
                          {m.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[13px] text-[#6B7280]">
                      {m.email}
                    </td>
                    <td className="py-4 px-4 text-[13px] text-[#6B7280] text-center">
                      {m.mentees}
                    </td>
                    <td className="py-4 px-4 text-[13px] text-[#6B7280] text-center">
                      {m.sessions}
                    </td>
                    <td className="py-4 px-4 text-[13px] text-[#6B7280]">
                      {m.expertise}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 text-[11px] font-medium rounded-[4px] ${
                        m.status === 'Active' ? 'bg-[#333333] text-white' : 'bg-[#E5E7EB] text-[#4B5563]'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Mentor Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-[800px] rounded-[16px] shadow-xl border border-gray-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-[20px] font-bold text-[#1F2937] font-dm-sans">
                Mentor Assignment
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-[14px] text-[#4B5563] font-dm-sans mb-2">Assigning Mentor To:</p>
                <div className="bg-[#FAFAFA] border border-gray-100 rounded-[12px] p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#6B7280] border border-gray-200 shrink-0">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#1F2937] font-dm-sans">[Participant Name]</p>
                    <p className="text-[13px] text-[#6B7280] font-rubik">Cohort 2024A • Year 2</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-[14px] text-[#4B5563] font-dm-sans mb-2">Select Mentor</p>
                <div className="space-y-3">
                  {[
                    { id: "1", name: "[Mentor 1]", details: "5 mentees • Leadership, Career" },
                    { id: "2", name: "[Mentor 2]", details: "4 mentees • Communication" },
                    { id: "3", name: "[Mentor 3]", details: "3 mentees • Goal Setting, Personal Growth" },
                  ].map((mentor) => (
                    <div 
                      key={mentor.id}
                      onClick={() => setSelectedMentorId(mentor.id)}
                      className={`border rounded-[12px] p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                        selectedMentorId === mentor.id 
                          ? 'border-[#333333] bg-[#FAFAFA]' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] border border-gray-200 shrink-0">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-[#1F2937] font-dm-sans">{mentor.name}</p>
                        <p className="text-[13px] text-[#6B7280] font-rubik">{mentor.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  className={`px-6 py-2.5 rounded-[8px] text-[14px] font-medium transition-colors ${
                    selectedMentorId 
                      ? 'bg-[#333333] text-white hover:bg-[#1f1f1f]' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Assign Mentor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
