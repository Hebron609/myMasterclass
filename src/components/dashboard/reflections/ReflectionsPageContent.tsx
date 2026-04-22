"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ChangeEvent } from "react";
import { Search, X } from "lucide-react";

interface ReflectionItem {
  id: string;
  title: string;
  date: string;
  snippet: string;
  tags: string[];
  mentorResponded: boolean;
}

interface TimelineEntry {
  month: string;
  year: string;
  count: number;
}

const mockReflections: ReflectionItem[] = [
  {
    id: "ref-1",
    title: "Monthly Progress Reflection",
    date: "Jan 25, 2025",
    snippet:
      "This month I've made significant progress on my public speaking goal. Attended 2 workshops and...",
    tags: ["Growth", "Goals"],
    mentorResponded: true,
  },
  {
    id: "ref-2",
    title: "Monthly Progress Reflection",
    date: "Jan 25, 2025",
    snippet:
      "This month I've made significant progress on my public speaking goal. Attended 2 workshops and...",
    tags: ["Growth", "Goals"],
    mentorResponded: true,
  },
  {
    id: "ref-3",
    title: "Monthly Progress Reflection",
    date: "Jan 25, 2025",
    snippet:
      "This month I've made significant progress on my public speaking goal. Attended 2 workshops and...",
    tags: ["Growth", "Goals"],
    mentorResponded: true,
  },
  {
    id: "ref-4",
    title: "Monthly Progress Reflection",
    date: "Jan 25, 2025",
    snippet:
      "This month I've made significant progress on my public speaking goal. Attended 2 workshops and...",
    tags: ["Growth", "Goals"],
    mentorResponded: true,
  },
];

const timelineData: TimelineEntry[] = [
  { month: "Jan", year: "2026", count: 5 },
  { month: "Dec", year: "2025", count: 4 },
  { month: "Nov", year: "2025", count: 3 },
  { month: "Oct", year: "2025", count: 2 },
];

const popularTags = [
  "Growth",
  "Goals",
  "Session",
  "Leadership",
  "Career",
  "Planning",
  "Mentorship",
  "Learning",
];

interface ReflectionsPageContentProps {
  role?: "MENTEE" | "MENTOR";
}

const mentorNotes = [
  {
    id: "note-1",
    title: "Progress Notes – January",
    date: "Jan 20, 2026",
    mentee: "Mentee Name",
    snippet: "Good progress on communication skills. Suggest focusing on...",
  },
  {
    id: "note-2",
    title: "Action Items Follow-up",
    date: "Jan 10, 2026",
    mentee: "Mentee Name 2",
    snippet: "Followed up on action items from last session. Needs more support with...",
  },
];

export default function ReflectionsPageContent({
  role = "MENTEE",
}: ReflectionsPageContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    const fieldName = id.replace("reflection-", "");
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSaveReflection = () => {
    console.log("Reflection saved:", formData);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold text-[#003F3A] font-dm-sans mb-2">
              {role === "MENTOR" ? "Notes & Reflections" : "My Reflections"}
            </h1>
            <p className="text-[16px] text-[#003F3A] font-rubik">
              {role === "MENTOR"
                ? "View mentee reflections and add your notes"
                : "Document your journey, insights, and growth"}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 text-[14px] font-medium font-rubik bg-[#333333] text-white rounded-lg hover:bg-[#222222] transition-colors"
          >
            + Write New Reflection
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Reflections", value: 12 },
            { label: "This Month", value: 3 },
            { label: "With Mentor Feedback", value: 8 },
            { label: "Tags Used", value: 5 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-[#E5E7EB] rounded-xl px-6 py-6 text-center shadow-sm"
            >
              <p className="text-[24px] font-bold text-[#333333] font-dm-sans mb-1">
                {stat.value}
              </p>
              <p className="text-[13px] text-[#4B5563] font-rubik">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Filter Section */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search Input */}
            <div>
              <label className="block text-[15px] font-bold text-[#4B5563] font-sans mb-3">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reflections"
                  className="w-full px-4 py-3 text-[15px] bg-[#fdfdfd] border border-[#D5DCEB] rounded-lg text-[#4B5563] font-rubik placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
                />
              </div>
            </div>

            {/* Filter by Tags */}
            <div>
              <label
                htmlFor="filter-tags"
                className="block text-[15px] font-bold text-[#4B5563] font-sans mb-3"
              >
                Filter by Tags
              </label>
              <div className="relative">
                <select
                  id="filter-tags"
                  className="w-full appearance-none px-4 py-3 text-[15px] bg-[#fdfdfd] border border-[#D5DCEB] rounded-lg text-[#4B5563] font-rubik focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all pr-10"
                >
                  <option>All Tags</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label
                htmlFor="date-range"
                className="block text-[15px] font-bold text-[#4B5563] font-sans mb-3"
              >
                Date Range
              </label>
              <div className="relative">
                <select
                  id="date-range"
                  className="w-full appearance-none px-4 py-3 text-[15px] bg-[#fdfdfd] border border-[#D5DCEB] rounded-lg text-[#4B5563] font-rubik focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all pr-10"
                >
                  <option>All Time</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Reflections List */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
              <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 pb-6 border-b border-[#E5E7EB]">
                {role === "MENTOR" ? "Mentee’s Reflections" : "Reflections (Latest First)"}
              </h2>
              <div className="space-y-6">
                {mockReflections.map((reflection) => (
                  <div
                    key={reflection.id}
                    className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm hover:border-gray-300 transition-colors"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-[15px] font-bold text-[#003F3A] font-dm-sans">
                          {reflection.title}
                        </h3>
                        {reflection.mentorResponded && (
                          <span className="px-2.5 py-1 text-[10px] font-bold font-rubik bg-[#333333] text-white rounded-md uppercase tracking-wider">
                            Responded
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[13px] text-[#6B7280] font-rubik mb-2">
                      {reflection.date}
                    </p>
                    <p className="text-[14px] leading-relaxed text-[#4B5563] font-rubik mb-5">
                      {reflection.snippet}
                    </p>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {reflection.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1.5 text-[12px] font-medium font-rubik bg-[#F2F5F5] text-[#4B5563] rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 text-[12px] font-medium font-rubik border border-[#D5DCEB] text-[#003F3A] rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                      >
                        {role === "MENTOR" ? "View/Respond" : "View/Edit"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <button className="px-8 py-2 text-[14px] font-medium font-rubik border border-[#D5DCEB] text-[#4B5563] rounded-lg hover:bg-gray-50 transition-colors">
                  Load More
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Widgets */}
          <div className="space-y-8">
            {/* Reflection Timeline */}
            <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
              <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 pb-6 border-b border-[#E5E7EB]">
                Reflection Timeline
              </h2>
              <div className="space-y-3">
                {timelineData.map((entry) => (
                  <div
                    key={`${entry.month}-${entry.year}`}
                    className="flex items-center justify-between bg-[#F2F5F5] px-6 py-4 rounded-xl hover:bg-[#EBEEF0] transition-colors"
                  >
                    <p className="text-[14px] font-medium font-rubik text-[#333333]">
                      {entry.month} {entry.year}
                    </p>
                    <p className="text-[14px] font-medium font-rubik text-[#333333]">
                      {entry.count} entries
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Notes Widget (Mentor Only) */}
            {role === "MENTOR" && (
              <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
                <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 pb-6 border-b border-[#E5E7EB]">
                  Your Notes
                </h2>
                <div className="space-y-8">
                  {mentorNotes.map((note) => (
                    <div key={note.id}>
                      <h3 className="text-[15px] font-bold text-[#333333] font-dm-sans mb-1.5">
                        {note.title}
                      </h3>
                      <p className="text-[13px] text-[#6B7280] font-rubik mb-1">
                        {note.date}
                      </p>
                      <p className="text-[13px] font-medium text-[#4B5563] font-rubik mb-2">
                        {note.mentee}
                      </p>
                      <p className="text-[13px] leading-relaxed text-[#6B7280] font-rubik italic">
                        {note.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Tags */}
            <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
              <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 pb-6 border-b border-[#E5E7EB]">
                Popular Tags
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    className="px-4 py-2 text-[14px] font-medium font-rubik bg-[#F2F5F5] text-[#333333] rounded-lg border border-[#E5E7EB] hover:bg-[#EAECF0] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {isModalOpen &&
          isMounted &&
          createPortal(
            <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/60 p-4">
              <div className="w-full max-w-2xl rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-8 py-6 border-b border-[#E5E7EB]">
                  <h2 className="text-[20px] font-bold text-[#003F3A] font-dm-sans">
                    New Reflection
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <label
                      htmlFor="reflection-title"
                      className="block text-[15px] font-bold text-[#4B5563] font-sans mb-2"
                    >
                      Title
                    </label>
                    <input
                      id="reflection-title"
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Give your reflection a title..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors font-sans"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reflection-content"
                      className="block text-[15px] font-bold text-[#4B5563] font-sans mb-2"
                    >
                      Reflection Content
                    </label>
                    <textarea
                      id="reflection-content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Write your reflection here..."
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors resize-none font-sans"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reflection-tags"
                      className="block text-[15px] font-bold text-[#4B5563] font-sans mb-2"
                    >
                      Tags
                    </label>
                    <input
                      id="reflection-tags"
                      type="text"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Add tags (comma separated)..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors font-sans"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-[14px] font-medium font-sans transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveReflection}
                      className="px-6 py-2.5 bg-[#333333] text-white hover:bg-[#222222] rounded-lg text-[14px] font-medium font-sans transition-colors shadow-sm"
                    >
                      + Save Reflection
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
}

