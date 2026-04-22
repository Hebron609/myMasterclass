import { useState } from "react";
import { DirectoryItem } from "@/components/dashboard/directories/DirectoryTable";

interface MentorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: DirectoryItem | null;
}

export function MentorProfileModal({ isOpen, onClose, mentor }: MentorProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"Overview" | "Goals" | "Achievements">("Overview");
  const [view, setView] = useState<"profile" | "booking">("profile");

  if (!isOpen || !mentor) return null;

  // Reset view when modal opens/closes
  const handleClose = () => {
    setView("profile");
    setActiveTab("Overview");
    onClose();
  };

  // Derive initials
  const initials = mentor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Fallbacks for missing mock data
  const bio = mentor.bio || "Dedicated professional committed to community transformation and growth.";
  const tags = mentor.tags || ["Leadership", "Mentorship", "Growth"];
  const milestones = mentor.milestones || [
    "Completed foundational mentorship training",
    "Successfully mentored 5 cohorts",
    "Pioneered organizational growth initiatives"
  ];
  
  const goalsData: { title: string; progress: number; status: string; statusColor: string }[] = mentor.modalGoals || [
    { title: "Support 3 mentee projects", progress: 63, status: "In Progress", statusColor: "bg-orange-400" },
    { title: "Organize impact showcase", progress: 25, status: "Getting Started", statusColor: "bg-red-500" }
  ];

  const achievementsData: { icon: string; title: string; date: string }[] = mentor.achievements || [
    { icon: "🏆", title: "Social Innovator Award", date: "Earned 2024" },
    { icon: "🏆", title: "Forbes 30 Under 30", date: "Earned 2024" },
    { icon: "🏆", title: "TEDx Speaker", date: "Earned 2024" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 transition-opacity" 
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl mx-4 sm:mx-auto pt-6 flex flex-col pointer-events-none">
        
        {/* Main White Card */}
        <div className="bg-white rounded-[24px] w-full max-h-[85vh] overflow-y-auto pointer-events-auto pb-6 relative shadow-2xl">
          
          <div className="p-8 pb-4">
            {/* Header info */}
            <h2 className="text-[28px] font-bold text-gray-900 font-heading mb-1">
              {mentor.name}
            </h2>
            <p className="text-[16px] text-gray-600 font-sans mb-6">
              {mentor.title} • {mentor.cohorts}
            </p>

            {/* Inner Identity Card */}
            {view === "profile" ? (
              <div className="bg-[#FAF9F6] border border-gray-100 rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-start">
                <div className="h-24 w-24 flex-shrink-0 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <span className="text-[28px] font-bold text-gray-800 font-heading tracking-wide">
                    {initials}
                  </span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-gray-900 font-heading mb-1">
                    {mentor.name}
                  </h3>
                  <p className="text-[14px] text-gray-500 font-sans mb-4">
                    {mentor.title} • {mentor.cohorts}
                  </p>
                  <p className="text-[15px] leading-relaxed text-gray-600 font-sans mb-4 max-w-2xl">
                    {bio}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-[12px] font-medium rounded-md font-sans"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#FAF9F6] border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                <div className="h-16 w-16 flex-shrink-0 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-50">
                  <span className="text-[20px] font-bold text-gray-800 font-heading tracking-wide">
                    {initials}
                  </span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-gray-900 font-heading mb-0.5">
                    {mentor.name}
                  </h3>
                  <p className="text-[13px] text-gray-500 font-sans">
                    {mentor.title} • {mentor.cohorts}
                  </p>
                </div>
              </div>
            )}

            {view === "profile" && (
              <>
                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-200 mt-8">
                  <button 
                    onClick={() => setActiveTab("Overview")}
                    className={`px-6 py-3 font-bold text-[16px] border-b-2 font-heading transition-colors rounded-t-lg ${
                      activeTab === "Overview" ? "bg-[#e5e7eb]/40 text-gray-900 border-transparent" : "text-gray-500 hover:text-gray-900 border-transparent"
                    }`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab("Goals")}
                    className={`px-6 py-3 font-bold text-[16px] border-b-2 font-heading transition-colors rounded-t-lg ${
                      activeTab === "Goals" ? "bg-[#e5e7eb]/40 text-gray-900 border-transparent" : "text-gray-500 hover:text-gray-900 border-transparent"
                    }`}
                  >
                    Goals
                  </button>
                  <button 
                    onClick={() => setActiveTab("Achievements")}
                    className={`px-6 py-3 font-bold text-[16px] border-b-2 font-heading transition-colors rounded-t-lg ${
                      activeTab === "Achievements" ? "bg-[#e5e7eb]/40 text-gray-900 border-transparent" : "text-gray-500 hover:text-gray-900 border-transparent"
                    }`}
                  >
                    Achievements
                  </button>
                </div>

                {/* Content Switcher */}
                {activeTab === "Overview" && (
                  <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                      <div className="bg-[#FAF9F6] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                        <span className="text-[24px] font-bold text-gray-900 font-heading mb-1">{mentor.rating}</span>
                        <span className="text-[13px] font-medium text-[#003F3A] font-sans">Rating</span>
                      </div>
                      <div className="bg-[#FAF9F6] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                        <span className="text-[24px] font-bold text-gray-900 font-heading mb-1">{mentor.sessionsCount}</span>
                        <span className="text-[13px] font-medium text-[#003F3A] font-sans">Total Sessions</span>
                      </div>
                      <div className="bg-[#FAF9F6] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                        <span className="text-[24px] font-bold text-gray-900 font-heading mb-1">{mentor.menteesCount}</span>
                        <span className="text-[13px] font-medium text-[#003F3A] font-sans">Active Mentees</span>
                      </div>
                      <div className="bg-[#FAF9F6] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                        <span className="text-[20px] font-bold text-gray-900 font-heading mb-1">{mentor.status}</span>
                        <span className="text-[13px] font-medium text-[#003F3A] font-sans">Status</span>
                      </div>
                    </div>

                    {/* Milestones Block */}
                    <div className="mt-8 border border-gray-200 rounded-xl p-6 overflow-hidden">
                      <h3 className="text-[20px] font-bold text-[#003F3A] font-heading mb-6">
                        Milestones
                      </h3>
                      
                      <div className="space-y-4">
                        {milestones.map((mstone, idx) => (
                          <div key={idx} className="flex items-center p-4 border border-gray-200 rounded-lg bg-white">
                            <div className="bg-[#333333] text-white font-bold h-7 w-7 rounded-[6px] flex items-center justify-center text-[13px] font-sans mr-4 flex-shrink-0">
                              {idx + 1}
                            </div>
                            <span className="text-[16px] font-bold text-gray-800 font-heading">
                              {mstone}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "Goals" && (
                  <div className="mt-8 border border-gray-200 rounded-xl p-6">
                    <h3 className="text-[20px] font-bold text-[#003F3A] font-heading mb-6 border-b border-gray-100 pb-4">
                      Goals
                    </h3>
                    
                    <div className="border border-gray-200 rounded-lg bg-white divide-y divide-gray-100 overflow-hidden">
                      {goalsData.map((goal, idx) => (
                        <div key={idx} className="p-6">
                          <h4 className="text-[16px] font-bold text-[#003F3A] font-heading mb-3">
                            {goal.title}
                          </h4>
                          
                          <div className="flex items-center gap-4 mb-2">
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#333333]" 
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                            <span className="text-[12px] font-bold text-gray-700 font-sans">
                              {goal.progress}%
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3 block">
                            <div className={`h-2.5 w-2.5 rounded-full ${goal.statusColor}`} />
                            <span className="text-[13px] font-medium text-[#003F3A] font-sans">
                              {goal.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "Achievements" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    {achievementsData.map((ach, idx) => (
                      <div key={idx} className="bg-[#FAF9F6] rounded-xl p-8 flex flex-col items-center justify-center text-center">
                        <span className="text-[32px] mb-3 leading-none drop-shadow-sm">{ach.icon}</span>
                        <h4 className="text-[15px] font-bold text-[#003F3A] font-heading mb-1.5 leading-snug">
                          {ach.title}
                        </h4>
                        <span className="text-[12px] font-medium text-[#003F3A]/70 font-sans">
                          {ach.date}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* BOOKING VIEW */}
            {view === "booking" && (
              <div className="mt-8">
                {/* Session Type */}
                <div className="border border-gray-200 rounded-xl p-6 mb-8">
                  <h3 className="text-[18px] font-bold text-[#003F3A] font-heading mb-4">
                    Session Type
                  </h3>
                  <div className="space-y-3">
                    {[
                      "1-on-1 Mentoring",
                      "Goal Review",
                      "Career Guidance",
                      "Skill Workshop",
                      "General Check-in"
                    ].map((type, idx) => (
                      <label key={idx} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#003F3A] focus:ring-[#003F3A]" />
                        <span className="text-[14px] text-gray-700 font-sans">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preferred Date & Time inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-600 mb-2 font-sans">
                      Preferred Date
                    </label>
                    <input 
                      type="text" 
                      placeholder="DD/MM/YYYY" 
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-gray-700 focus:outline-[#003F3A] focus:border-[#003F3A]" 
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-600 mb-2 font-sans">
                      Preferred Time
                    </label>
                    <input 
                      type="text" 
                      placeholder="HH:MM" 
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-gray-700 focus:outline-[#003F3A] focus:border-[#003F3A]" 
                    />
                  </div>
                </div>

                {/* Preferred Quick Select */}
                <div className="mb-6">
                  <label className="block text-[13px] font-bold text-gray-600 mb-2 font-sans">
                    Preferred Date
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Mon 10 AM", "Tue 2 PM", "Wed 11 AM", "Thu 3 PM", "Fri 4 PM"].map((btn, idx) => (
                      <button key={idx} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 hover:bg-gray-50 transition-colors font-sans focus:border-[#003F3A] focus:bg-[#FAF9F6]">
                        {btn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode Select */}
                <div className="mb-6">
                  <label className="block text-[13px] font-bold text-gray-600 mb-2 font-sans">
                    Mode
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["Virtual (Google Meet)", "In-Person", "Phone Call"].map((mode, idx) => (
                      <button key={idx} className="flex-1 min-w-[140px] px-4 py-3 border border-gray-200 rounded-lg text-[14px] text-gray-700 hover:bg-gray-50 transition-colors font-sans text-left focus:border-[#003F3A] focus:bg-[#FAF9F6]">
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="mb-2">
                  <label className="block text-[13px] font-bold text-gray-600 mb-2 font-sans">
                    Message (Optional)
                  </label>
                  <textarea 
                    placeholder="What would you like to discuss?" 
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-gray-700 focus:outline-[#003F3A] focus:border-[#003F3A] min-h-[120px] resize-y"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 mt-4 px-8 pb-2">
            <button 
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-[8px] text-[15px] font-medium font-sans transition-colors"
            >
              Close
            </button>
            <button 
              onClick={() => {
                if (view === "profile") {
                  setView("booking");
                } else {
                  // Final submission action
                  handleClose();
                }
              }}
              className="px-6 py-3 bg-[#333333] text-white hover:bg-[#222222] rounded-[8px] text-[15px] font-medium font-sans transition-colors"
            >
              Book 1-on-1 Session
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
