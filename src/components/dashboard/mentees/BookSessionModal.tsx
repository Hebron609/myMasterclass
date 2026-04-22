"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { MenteeRecord } from "./MenteeTable";

interface BookSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentee: MenteeRecord | null;
}

export default function BookSessionModal({
  isOpen,
  onClose,
  mentee,
}: BookSessionModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("1-on-1 Mentoring");
  const [selectedMode, setSelectedMode] = useState<string>("Virtual (Google Meet)");
  const [selectedDateShortcut, setSelectedDateShortcut] = useState<string>("Mon 10 AM");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted || !mentee) return null;

  const sessionTypes = [
    "1-on-1 Mentoring",
    "Goal Review",
    "Career Guidance",
    "Skill Workshop",
    "General Check-in",
  ];

  const timeShortcuts = [
    "Mon 10 AM",
    "Tue 2 PM",
    "Wed 11 AM",
    "Thu 3 PM",
    "Fri 10 4 PM",
  ];

  const modes = [
    "Virtual (Google Meet)",
    "In-Person",
    "Phone Call",
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-[#E5E7EB]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#E5E7EB]">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-[20px] font-bold text-[#003F3A] font-dm-sans">
                Book 1-on-1 Session
              </h2>
              <p className="text-[13px] text-[#6B7280] font-rubik mt-0.5">
                Schedule a session with {mentee.name} (Mentee)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mentee Card Snippet */}
        <div className="px-8 mt-2">
          <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-gray-100 flex gap-4 items-center">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[16px] font-bold text-[#333333] shadow-sm border border-gray-100 uppercase">
              {mentee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#333333] font-dm-sans">{mentee.name}</h3>
              <p className="text-[12px] text-gray-500 font-rubik mt-0.5">{mentee.title}</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6 overflow-y-auto flex-1 space-y-6">
          {/* Session Type */}
          <div className="p-6 border border-[#E5E7EB] rounded-2xl space-y-4">
            <h3 className="text-[16px] font-bold text-[#003F3A] font-dm-sans">Session Type</h3>
            <div className="space-y-3">
              {sessionTypes.map((type, idx) => (
                <label key={idx} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-[#003F3A] focus:ring-[#003F3A]" 
                    defaultChecked={type === "1-on-1 Mentoring"}
                  />
                  <span className="text-[14px] text-gray-700 font-sans">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date and Time Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-[#4B5563] font-rubik">Preferred Date</label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:border-gray-400 placeholder:text-gray-400 transition-all font-sans"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-[#4B5563] font-rubik">Preferred Time</label>
              <input
                type="text"
                placeholder="HH:MM"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:border-gray-400 placeholder:text-gray-400 transition-all font-sans"
              />
            </div>
          </div>

          {/* Preferred Date Shortcuts */}
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#4B5563] font-rubik">Preferred Date</label>
            <div className="flex flex-wrap gap-2">
              {timeShortcuts.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedDateShortcut(time)}
                  className={`px-4 py-2 border rounded-lg text-[13px] font-medium transition-colors font-sans ${
                    selectedDateShortcut === time
                      ? "bg-[#FAF9F6] border-[#333333] text-[#333333]"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#4B5563] font-rubik">Mode</label>
            <div className="flex gap-3">
              {modes.map(mode => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`flex-1 px-4 py-3 border rounded-xl text-[13px] font-medium transition-all font-sans ${
                    selectedMode === mode
                      ? "bg-white border-gray-400 text-[#333333]"
                      : "bg-gray-50 border-gray-200 text-gray-500"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Message Field */}
          <div className="space-y-2 pb-2">
            <label className="text-[14px] font-bold text-[#4B5563] font-rubik">Message (Optional)</label>
            <textarea
              placeholder="What would you like to discuss?"
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:border-gray-400 placeholder:text-gray-400 transition-all resize-none font-sans shadow-sm"
            />
          </div>
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
            className="px-6 py-2.5 bg-[#333333] text-white text-[14px] font-semibold rounded-lg hover:bg-[#222222] transition-all font-sans shadow-sm"
          >
            Send Booking Request
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
