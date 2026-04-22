"use client";

import { Search, ChevronDown, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DirectoryItem {
  id: string;
  name: string;
  title: string;
  cohorts: string;
  expertise: string;
  rating: number;
  menteesCount: number;
  sessionsCount: number;
  status: "Available" | "Limited";
  bio?: string;
  tags?: string[];
  milestones?: string[];
  modalGoals?: { title: string; progress: number; status: string; statusColor: string }[];
  achievements?: { icon: string; title: string; date: string }[];
}

interface DirectoryTableProps {
  pageTitle: string;
  pageSubtitle: string;
  dropdownLabel: string;
  searchPlaceholder: string;
  items: DirectoryItem[];
  onProfileClick?: (item: DirectoryItem) => void;
}

export function DirectoryTable({
  pageTitle,
  pageSubtitle,
  dropdownLabel,
  searchPlaceholder,
  items,
  onProfileClick,
}: DirectoryTableProps) {
  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header section */}
      <div>
        <h1 className="text-[28px] font-bold text-[#003F3A] mb-1 font-heading">
          {pageTitle}
        </h1>
        <p className="text-[15px] text-[#003F3A]/80 font-sans">
          {pageSubtitle}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-transparent mt-8 mb-4 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Main Dropdown Filter */}
          <button className="flex items-center gap-2 bg-[#333333] hover:bg-[#222222] text-white px-5 py-2.5 rounded-[8px] text-[14px] font-medium transition-colors font-sans w-full sm:w-auto justify-between">
            {dropdownLabel}
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Filters Button */}
          <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-[8px] text-[14px] font-medium transition-colors font-sans w-full sm:w-auto justify-center">
            <SlidersHorizontal className="h-4 w-4 text-gray-500" />
            Filters
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-[350px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003F3A]/30 transition-all font-sans"
          />
        </div>
      </div>

      {/* Directory Table Area */}
      <div className="bg-white rounded-[16px] border border-gray-100 overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-5 px-6 font-medium text-[13px] text-[#576176] font-sans whitespace-nowrap">
                <div className="flex items-center gap-1">
                  Name <ArrowUpDown className="h-3 w-3 inline ml-1 opacity-50" />
                </div>
              </th>
              <th className="py-5 px-6 font-medium text-[13px] text-[#576176] font-sans whitespace-nowrap">
                Title
              </th>
              <th className="py-5 px-6 font-medium text-[13px] text-[#576176] font-sans whitespace-nowrap">
                <div className="flex items-center gap-1">
                  Cohorts <ArrowUpDown className="h-3 w-3 inline ml-1 opacity-50" />
                </div>
              </th>
              <th className="py-5 px-6 font-medium text-[13px] text-[#576176] font-sans whitespace-nowrap">
                Expertise
              </th>
              <th className="py-5 px-6 font-medium text-[13px] text-[#576176] font-sans whitespace-nowrap">
                Rating
              </th>
              <th className="py-5 px-6 font-medium text-[13px] text-[#576176] font-sans whitespace-nowrap">
                <div className="flex items-center gap-1">
                  Mentees <ArrowUpDown className="h-3 w-3 inline ml-1 opacity-50" />
                </div>
              </th>
              <th className="py-5 px-6 font-medium text-[13px] text-[#576176] font-sans whitespace-nowrap">
                <div className="flex items-center gap-1">
                  Sessions <ArrowUpDown className="h-3 w-3 inline ml-1 opacity-50" />
                </div>
              </th>
              <th className="py-5 px-6 font-medium text-[13px] text-[#576176] font-sans whitespace-nowrap">
                <div className="flex items-center gap-1">
                  Status <ArrowUpDown className="h-3 w-3 inline ml-1 opacity-50" />
                </div>
              </th>
              <th className="py-5 px-6 font-medium text-[13px] text-[#576176] font-sans whitespace-nowrap">
                <div className="flex items-center gap-1">
                  Action <ArrowUpDown className="h-3 w-3 inline ml-1 opacity-50" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-5 px-6 text-[14px] font-bold text-[#1f2937] font-sans">
                  {item.name}
                </td>
                <td className="py-5 px-6 text-[14px] text-[#4b5563] font-sans max-w-[150px] leading-snug">
                  {item.title}
                </td>
                <td className="py-5 px-6 text-[14px] text-[#1f2937] font-medium font-sans">
                  {item.cohorts}
                </td>
                <td className="py-5 px-6 text-[14px] text-[#4b5563] font-sans max-w-[150px] leading-snug">
                  {item.expertise}
                </td>
                <td className="py-5 px-6 text-[14px] text-[#1f2937] font-medium font-sans">
                  {item.rating}
                </td>
                <td className="py-5 px-6 text-[14px] text-[#1f2937] font-medium font-sans">
                  {item.menteesCount}
                </td>
                <td className="py-5 px-6 text-[14px] text-[#1f2937] font-medium font-sans">
                  {item.sessionsCount}
                </td>
                <td className="py-5 px-6">
                  <span
                    className={cn(
                      "px-3 py-1 text-[11px] font-medium rounded-[4px] border font-sans",
                      item.status === "Limited"
                        ? "bg-white border-gray-300 text-gray-600"
                        : "bg-[#333333] border-[#333333] text-white"
                    )}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="py-5 px-6">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onProfileClick?.(item)}
                      className="px-4 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-[4px] text-[12px] font-medium font-sans transition-colors"
                    >
                      Profile
                    </button>
                    <button className="px-4 py-1.5 bg-[#333333] text-white hover:bg-[#222222] rounded-[4px] text-[12px] font-medium font-sans transition-colors">
                      Book
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
