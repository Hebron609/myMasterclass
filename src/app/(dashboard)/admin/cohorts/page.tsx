"use client";

import { useState } from "react";
import { Search, User, X } from "lucide-react";

export default function AdminCohortsPage() {
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (selectedCohort) {
    // Detail View
    return (
      <div className="space-y-8 pb-10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-[24px] font-bold text-[#1F2937] font-dm-sans mb-1">
              Cohort 2024A
            </h1>
            <p className="text-[14px] text-[#6B7280] font-rubik">
              Started January 2024 • Currently Year 2
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
              Edit Cohort
            </button>
            <button className="px-4 py-2 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors">
              + Add Participants
            </button>
          </div>
        </div>

        <button 
          onClick={() => setSelectedCohort(null)}
          className="text-[14px] text-[#4B5563] hover:underline"
        >
          &larr; Back to all cohorts
        </button>

        <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans">
              Participants (25)
            </h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search participants..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400 w-[250px]"
                />
              </div>
              <button className="px-4 py-2 border border-gray-200 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Name</th>
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Email</th>
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Mentor</th>
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Status</th>
                  <th className="py-3 px-4 text-[13px] font-bold text-[#4B5563] font-dm-sans">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                          <User size={16} />
                        </div>
                        <span className="text-[14px] font-medium text-[#1F2937] font-dm-sans">
                          [Participant {i}]
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[13px] text-[#6B7280]">
                      participant{i}@email.com
                    </td>
                    <td className="py-4 px-4 text-[13px] text-[#6B7280]">
                      [Mentor {i === 3 ? 1 : i === 1 || i === 4 ? 2 : 3}]
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-[#333333] text-white text-[11px] font-medium rounded-[4px]">
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="px-3 py-1.5 border border-gray-200 rounded-[6px] text-[12px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Main View
  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[24px] font-bold text-[#1F2937] font-dm-sans mb-1">
            Cohort Management
          </h1>
          <p className="text-[14px] text-[#6B7280] font-rubik">
            Create and manage participant cohorts
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#333333] text-white px-5 py-2.5 rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors"
        >
          + Create New Cohort
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { value: "4", label: "Total Cohorts" },
          { value: "3", label: "Active Cohorts" },
          { value: "95", label: "Total Participants" },
          { value: "31", label: "Total Mentors" },
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

      {/* Total Cohorts Grid */}
      <div className="bg-white border border-gray-100 rounded-[16px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 border-b border-gray-100 pb-4">
          Total Cohorts
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: "Cohort 2024A", started: "Jan 2024", status: "Active", participants: 25, mentors: 8, progress: "Year 2" },
            { name: "Cohort 2024B", started: "Jul 2024", status: "Active", participants: 30, mentors: 10, progress: "Year 1" },
            { name: "Cohort 2023A", started: "Jan 2023", status: "Active", participants: 22, mentors: 7, progress: "Year 3" },
            { name: "Cohort 2022A", started: "Jan 2022", status: "Completed", participants: 18, mentors: 6, progress: "Graduated" },
          ].map((cohort, i) => (
            <div key={i} className="border border-gray-200 rounded-[12px] p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-[16px] font-bold text-[#1F2937] font-dm-sans mb-1">
                    {cohort.name}
                  </h3>
                  <p className="text-[12px] text-[#6B7280] font-rubik">
                    Started: {cohort.started}
                  </p>
                </div>
                <span className={`px-3 py-1 text-[11px] font-medium rounded-[4px] ${
                  cohort.status === 'Active' 
                    ? 'bg-[#333333] text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {cohort.status}
                </span>
              </div>

              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-[#FAFAFA] border border-gray-100 rounded-[8px] py-4 text-center">
                  <p className="text-[18px] font-bold text-[#1F2937] font-dm-sans mb-1">{cohort.participants}</p>
                  <p className="text-[11px] text-[#6B7280] font-rubik">Participants</p>
                </div>
                <div className="flex-1 bg-[#FAFAFA] border border-gray-100 rounded-[8px] py-4 text-center">
                  <p className="text-[18px] font-bold text-[#1F2937] font-dm-sans mb-1">{cohort.mentors}</p>
                  <p className="text-[11px] text-[#6B7280] font-rubik">Mentors</p>
                </div>
                <div className="flex-1 bg-[#FAFAFA] border border-gray-100 rounded-[8px] py-4 text-center">
                  <p className="text-[14px] font-bold text-[#1F2937] font-dm-sans mt-0.5 mb-1.5">{cohort.progress}</p>
                  <p className="text-[11px] text-[#6B7280] font-rubik">Progress</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedCohort(cohort.name)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-[8px] text-[13px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors"
                >
                  View Details
                </button>
                <button className="flex-1 py-2.5 bg-[#333333] text-white rounded-[8px] text-[13px] font-medium hover:bg-[#1f1f1f] transition-colors">
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Cohort Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-[800px] rounded-[16px] shadow-xl border border-gray-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-[20px] font-bold text-[#1F2937] font-dm-sans">
                Create Cohort Form
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 border border-gray-100 m-6 rounded-[12px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2">
                    Cohort Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., Cohort 2025A"
                    className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2">
                    Start Date
                  </label>
                  <input 
                    type="text" 
                    placeholder="DD/MM/YYYY"
                    className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2">
                  Description
                </label>
                <textarea 
                  placeholder="Optional cohort description..."
                  rows={5}
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-[8px] text-[14px] outline-none focus:border-gray-400 focus:bg-white transition-colors resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-5 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors">
                  + Create Cohort
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
