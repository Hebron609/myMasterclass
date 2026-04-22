"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ChangeEvent } from "react";
import { Calendar, X } from "lucide-react";

interface SessionRecord {
  id: string;
  title: string;
  date: string;
  time: string;
  mentor: string;
  type: string;
  status: "Scheduled" | "Pending" | "Completed";
  hasNotes?: boolean;
  isUpcoming?: boolean;
}

const mockSessions: SessionRecord[] = [
  {
    id: "up-1",
    title: "End of the Month",
    date: "",
    time: "3:00 PM",
    mentor: "Mentor Name",
    type: "Monthly Check-in",
    status: "Scheduled",
    isUpcoming: true,
  },
  {
    id: "up-2",
    title: "Feb 15, 2025",
    date: "Feb 15, 2025",
    time: "3:00 PM",
    mentor: "Mentor Name",
    type: "Goal Review",
    status: "Pending",
    isUpcoming: true,
  },
  {
    id: "hist-1",
    title: "Jan 15, 2025",
    date: "Jan 15, 2025",
    time: "3:00 PM",
    mentor: "Mentor Name",
    type: "Monthly Check-in",
    status: "Completed",
    hasNotes: true,
  },
  {
    id: "hist-2",
    title: "Dec 15, 2024",
    date: "Dec 15, 2024",
    time: "2:30 PM",
    mentor: "Mentor Name",
    type: "Goal Setting",
    status: "Completed",
    hasNotes: true,
  },
  {
    id: "hist-3",
    title: "Nov 20, 2024",
    date: "Nov 20, 2024",
    time: "4:00 PM",
    mentor: "Mentor Name",
    type: "Introduction",
    status: "Completed",
    hasNotes: true,
  },
];

const upcomingSessions = mockSessions.filter((session) => session.isUpcoming);
const historySessions = mockSessions.filter((session) => !session.isUpcoming);

const upcomingStatusStyles: Record<
  SessionRecord["status"],
  { bg: string; text: string; border: string }
> = {
  Scheduled: {
    bg: "bg-[#333333]",
    text: "text-white",
    border: "border-[#333333]",
  },
  Pending: {
    bg: "bg-[#F2F4F8]",
    text: "text-[#4B5563]",
    border: "border-[#E5E7EB]",
  },
  Completed: {
    bg: "bg-[#333333]",
    text: "text-white",
    border: "border-[#333333]",
  },
};

interface SessionsPageContentProps {
  role?: "MENTEE" | "MENTOR";
}

export default function SessionsPageContent({
  role = "MENTEE",
}: SessionsPageContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    type: "",
    notes: "",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;
    const fieldName = id.replace("session-", "");
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSaveSession = () => {
    console.log("Session saved:", formData);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold text-[#003F3A] font-dm-sans mb-2">
              Sessions
            </h1>
            <p className="text-[16px] text-[#003F3A] font-rubik">
              {role === "MENTOR"
                ? "Manage sessions with your mentees"
                : "View and manage your mentorship sessions"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {role === "MENTEE" && (
              <button className="px-5 py-2.5 text-[14px] font-rubik border border-[#D5DCEB] text-[#333333] rounded-lg hover:bg-white">
                Request Meeting
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 text-[14px] font-rubik bg-[#333333] text-white rounded-lg hover:bg-[#222222]"
            >
              + Log New Session
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Upcoming", value: 2 },
            { label: "This Year", value: 8 },
            { label: "Total Sessions", value: 15 },
            { label: "Pending Approval", value: 1 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-[#E5E7EB] rounded-xl px-6 py-5 text-center shadow-sm"
            >
              <p className="text-[22px] font-semibold text-[#333333] font-dm-sans">
                {stat.value}
              </p>
              <p className="text-[13px] text-[#4B5563] font-rubik">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Calendar and Upcoming Sessions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Card */}
          <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-[18px] font-semibold text-[#4B5563] font-dm-sans">
                Calendar
              </h2>
            </div>
            <div className="border border-[#E5E7EB] rounded-lg p-10 flex flex-col items-center justify-center text-center min-h-[240px] bg-[#F9FAF9]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#4B5563]">
                <Calendar className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[14px] text-[#6B7280] font-rubik">
                Monthly Calendar View
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button className="px-3 py-1.5 text-[12px] font-rubik border border-[#D5DCEB] text-[#9CA3AF] rounded-lg">
                Previous
              </button>
              <span className="text-[14px] text-[#6B7280] font-rubik font-medium">
                January 2026
              </span>
              <button className="px-3 py-1.5 text-[12px] font-rubik border border-[#D5DCEB] text-[#333333] rounded-lg">
                Next
              </button>
            </div>
          </div>

          {/* Upcoming Sessions Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
            <h2 className="text-[18px] font-semibold text-[#4B5563] font-dm-sans mb-4">
              Upcoming Sessions
            </h2>
            <div className="space-y-4">
              {upcomingSessions.map((session) => {
                const status = upcomingStatusStyles[session.status];
                return (
                  <div
                    key={session.id}
                    className="border border-[#E5E7EB] rounded-lg px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-[14px] font-semibold text-[#4B5563] font-dm-sans mb-1">
                          {session.title}
                        </p>
                        <p className="text-[12px] text-[#6B7280] font-rubik">
                          Time: {session.time}
                        </p>
                        <p className="text-[12px] text-[#6B7280] font-rubik">
                          {role === "MENTOR" ? "Mentee Name" : session.mentor}
                        </p>
                        <p className="text-[12px] text-[#6B7280] font-rubik">
                          {session.type}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-[11px] font-medium font-rubik border rounded-md ${status.bg} ${status.text} ${status.border}`}
                      >
                        {session.status}
                      </span>
                    </div>

                    {/* Mentor Action Buttons for Pending Sessions */}
                    {role === "MENTOR" && session.status === "Pending" && (
                      <div className="mt-3 flex gap-2">
                        <button className="flex-1 px-4 py-1.5 text-[12px] font-medium border border-[#D5DCEB] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-rubik bg-white">
                          Accept
                        </button>
                        <button className="flex-1 px-4 py-1.5 text-[12px] font-medium bg-[#333333] text-white rounded-lg hover:bg-[#222222] transition-colors font-rubik">
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Session History Table */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <div className="px-6 py-5 border-b border-[#E5E7EB]">
            <h2 className="text-[18px] font-semibold text-[#4B5563] font-dm-sans">
              Session History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[14px] text-[#4A4A4A] font-dm-sans font-bold border-b border-[#E5E7EB]">
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Time</th>
                  <th className="px-6 py-4 font-bold">
                    {role === "MENTOR" ? "Mentor" : "Mentor"}
                  </th>
                  <th className="px-6 py-4 font-bold">Type</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Notes</th>
                  <th className="px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-[#4A4A4A] font-rubik">
                {historySessions.map((session) => (
                  <tr key={session.id} className="border-b border-[#F2F4F8] last:border-0 hover:bg-[#F9FAF9]">
                    <td className="px-6 py-4 whitespace-nowrap">{session.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{session.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {role === "MENTOR" ? "Mentee Name" : session.mentor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{session.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-[11px] font-medium font-rubik border rounded-md bg-[#333333] text-white border-[#333333]">
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {session.hasNotes ? "✓ Has Notes" : "No Notes"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="px-4 py-1 text-[12px] font-medium font-rubik border border-[#D5DCEB] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-6 flex justify-center border-t border-[#E5E7EB]">
            <button className="px-6 py-2 text-[14px] font-medium font-rubik border border-[#D5DCEB] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Load more Sessions
            </button>
          </div>
        </div>

        {isModalOpen &&
          isMounted &&
          createPortal(
            <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-2xl rounded-xl border border-[#E5E7EB] bg-white shadow-lg overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-8 py-6 border-b border-[#E5E7EB]">
                  <h2 className="text-[20px] font-bold text-[#003F3A] font-dm-sans">
                    Log Session
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="session-date"
                        className="block text-[14px] font-bold text-[#4B5563] font-rubik mb-2"
                      >
                        Session Date
                      </label>
                      <input
                        id="session-date"
                        type="text"
                        value={formData.date}
                        onChange={handleInputChange}
                        placeholder="DD/MM/YYYY"
                        className="w-full rounded-lg border border-[#ADADAD] bg-white px-4 py-3 text-[15px] text-[#4B5563] font-rubik focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="session-time"
                        className="block text-[14px] font-bold text-[#4B5563] font-rubik mb-2"
                      >
                        Session Time
                      </label>
                      <input
                        id="session-time"
                        type="text"
                        value={formData.time}
                        onChange={handleInputChange}
                        placeholder="HH:MM"
                        className="w-full rounded-lg border border-[#ADADAD] bg-white px-4 py-3 text-[15px] text-[#4B5563] font-rubik focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="session-type"
                      className="block text-[14px] font-bold text-[#4B5563] font-rubik mb-2"
                    >
                      Session Type
                    </label>
                    <div className="relative">
                      <select
                        id="session-type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full appearance-none rounded-lg border border-[#ADADAD] bg-white px-4 py-3 text-[15px] text-[#4B5563] font-rubik focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
                      >
                        <option value="">Select type...</option>
                        <option value="Monthly Check-in">Monthly Check-in</option>
                        <option value="Goal Review">Goal Review</option>
                        <option value="Goal Setting">Goal Setting</option>
                        <option value="Introduction">Introduction</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="session-notes"
                      className="block text-[14px] font-bold text-[#4B5563] font-rubik mb-2"
                    >
                      Session Notes
                    </label>
                    <textarea
                      id="session-notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Add session notes..."
                      rows={5}
                      className="w-full rounded-lg border border-[#ADADAD] bg-white px-4 py-3 text-[15px] text-[#4B5563] font-rubik focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all resize-none placeholder:text-gray-400"
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2.5 text-[14px] font-medium font-rubik border border-[#D5DCEB] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveSession}
                      className="px-6 py-2.5 text-[14px] font-medium font-rubik bg-[#333333] text-white rounded-lg hover:bg-[#222222] transition-colors shadow-sm"
                    >
                      + Log Session
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

