"use client";

import { Search, ChevronDown, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useState } from "react";

export interface MenteeRecord {
  id: string;
  name: string;
  title: string;
  cohort: string;
  interests: string[];
  progress: number;
  goals: {
    completed: number;
    total: number;
  };
  sessions: number;
}

const mockMentees: MenteeRecord[] = [
  {
    id: "1",
    name: "Amina Yusuf",
    title: "Year 1 Participant",
    cohort: "2024A",
    interests: ["Agriculture", "Supply Chain"],
    progress: 25,
    goals: { completed: 2, total: 5 },
    sessions: 2,
  },
  {
    id: "2",
    name: "Peter Njoroge",
    title: "Year 1 Participant",
    cohort: "2024C",
    interests: ["Agriculture", "Supply Chain"],
    progress: 25,
    goals: { completed: 2, total: 5 },
    sessions: 6,
  },
  {
    id: "3",
    name: "John Otieno",
    title: "Year 2 Participant",
    cohort: "2024B",
    interests: ["Agriculture", "Supply Chain"],
    progress: 25,
    goals: { completed: 2, total: 5 },
    sessions: 8,
  },
  {
    id: "4",
    name: "Sarah Mutua",
    title: "Year 1 Participant",
    cohort: "2024A",
    interests: ["Agriculture", "Supply Chain"],
    progress: 25,
    goals: { completed: 2, total: 5 },
    sessions: 3,
  },
  {
    id: "5",
    name: "Ann Smith",
    title: "Year 2 Participant",
    cohort: "2024B",
    interests: ["Agriculture", "Supply Chain"],
    progress: 25,
    goals: { completed: 2, total: 5 },
    sessions: 7,
  },
  {
    id: "6",
    name: "Daph Hit",
    title: "Year 2 Participant",
    cohort: "2024C",
    interests: ["Agriculture", "Supply Chain"],
    progress: 68,
    goals: { completed: 5, total: 8 },
    sessions: 10,
  },
  {
    id: "7",
    name: "Andrew Nkrumah",
    title: "Year 1 Participant",
    cohort: "2024A",
    interests: ["Agriculture", "Supply Chain"],
    progress: 82,
    goals: { completed: 7, total: 9 },
    sessions: 15,
  },
];

interface MenteeTableProps {
  onViewProfile: (mentee: MenteeRecord) => void;
}

export default function MenteeTable({ onViewProfile }: MenteeTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#333333] text-white rounded-lg text-[14px] font-rubik">
            All Mentees <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D5DCEB] text-[#4B5563] rounded-lg text-[14px] font-rubik hover:bg-gray-50">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search mentees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#D5DCEB] rounded-lg text-[14px] font-rubik focus:outline-none focus:border-gray-400 placeholder:text-gray-400 transition-all"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[14px] text-[#4A4A4A] font-dm-sans border-b border-[#F2F4F8]">
                <th className="px-6 py-4 font-bold">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900 transition-colors">
                    Name <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="px-6 py-4 font-bold whitespace-nowrap">Title</th>
                <th className="px-6 py-4 font-bold">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900 transition-colors">
                    Cohorts <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="px-6 py-4 font-bold whitespace-nowrap">Interests</th>
                <th className="px-6 py-4 font-bold whitespace-nowrap">Progress</th>
                <th className="px-6 py-4 font-bold">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900 transition-colors whitespace-nowrap">
                    Goals <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="px-6 py-4 font-bold">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900 transition-colors whitespace-nowrap">
                    Sessions <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="px-6 py-4 font-bold text-center">
                  <div className="flex items-center justify-center gap-1 cursor-pointer hover:text-gray-900 transition-colors">
                    Action <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="text-[14px] font-rubik text-[#333333]">
              {mockMentees.map((mentee) => (
                <tr key={mentee.id} className="border-b border-[#F2F4F8] hover:bg-[#F9FAF9] transition-colors">
                  <td className="px-6 py-5 font-bold">{mentee.name}</td>
                  <td className="px-6 py-5 text-[#4B5563] text-[13px] leading-tight">
                    <div className="flex flex-col">
                      <span>{mentee.title.replace(' Participant', '')}</span>
                      <span className="text-[#9CA3AF]">Participant</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[#4B5563]">{mentee.cohort}</td>
                  <td className="px-6 py-5">
                    <div className="text-[13px] text-[#4B5563]">
                      {mentee.interests.join(', ')}
                      <span className="text-[#6B7280]">, +1</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gray-800 h-full transition-all duration-300"
                          style={{ width: `${mentee.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#9CA3AF] font-bold">{mentee.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[#4B5563] text-[15px]">{mentee.goals.completed}/{mentee.goals.total}</td>
                  <td className="px-6 py-5 text-[#4B5563] text-[15px]">{mentee.sessions}</td>
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => onViewProfile(mentee)}
                      className="px-4 py-1.5 border border-[#D5DCEB] text-[#4B5563] text-[13px] font-medium rounded-lg hover:bg-white hover:border-gray-400 transition-all"
                    >
                      Profile
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
