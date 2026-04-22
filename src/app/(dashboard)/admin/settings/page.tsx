"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("General");

  const goalCategories = [
    "Career",
    "Leadership",
    "Personal",
    "Education",
    "Health",
    "Financial",
  ];

  const sessionTypes = [
    "Monthly Check-in",
    "Monthly Check-in",
    "Goal Review",
    "Introduction",
    "Quarterly Review",
    "Ad-hoc",
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[24px] font-bold text-[#1F2937] font-dm-sans mb-1">
            Platform Settings
          </h1>
          <p className="text-[14px] text-[#6B7280] font-rubik">
            Configure platform settings and preferences
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
            Reset Changes
          </button>
          <button className="px-5 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-[8px] shadow-[0px_2px_8px_rgba(0,0,0,0.04)] w-fit border border-gray-100 p-1">
        {["General", "Notifications", "Security", "Integrations"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-[6px] text-[13px] font-medium transition-colors ${
              activeTab === tab
                ? "bg-[#333333] text-white"
                : "text-[#6B7280] hover:text-[#1F2937]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "General" && (
        <div className="space-y-6">
          {/* Platform Information */}
          <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-[16px] font-bold text-[#1F2937] font-dm-sans mb-6 border-b border-gray-100 pb-4">
              Platform Information
            </h2>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="platform-name"
                  className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2"
                >
                  Platform Name
                </label>
                <input
                  id="platform-name"
                  type="text"
                  defaultValue="Diba Leagleship"
                  placeholder="Enter platform name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-[8px] text-[14px] text-[#1F2937] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="admin-email"
                    className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="admin-email"
                    type="text"
                    defaultValue="user__email"
                    placeholder="Enter email address"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-[8px] text-[14px] text-[#1F2937] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label
                    htmlFor="support-email"
                    className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2"
                  >
                    Support Email
                  </label>
                  <input
                    id="support-email"
                    type="text"
                    defaultValue="support@dibaleagleship.org"
                    placeholder="Enter support email"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-[8px] text-[14px] text-[#1F2937] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="platform-bio"
                  className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2"
                >
                  Bio
                </label>
                <textarea
                  id="platform-bio"
                  defaultValue="A 10-year mentorship and development initiative for personal growth."
                  placeholder="Describe the platform mission and scope"
                  className="w-full px-4 py-3 border border-gray-300 rounded-[8px] text-[14px] text-[#4B5563] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 min-h-[100px] resize-y"
                />
              </div>
            </div>
          </div>

          {/* Journey Configuration */}
          <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-[16px] font-bold text-[#1F2937] font-dm-sans mb-6 border-b border-gray-100 pb-4">
              Journey Configuration
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="journey-length"
                    className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2"
                  >
                    Journey Length (Years)
                  </label>
                  <input
                    id="journey-length"
                    type="text"
                    defaultValue="10"
                    placeholder="Enter journey length"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-[8px] text-[14px] text-[#1F2937] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label
                    htmlFor="default-timezone"
                    className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2"
                  >
                    Default Timezone
                  </label>
                  <input
                    id="default-timezone"
                    type="text"
                    defaultValue="UTC+0 (GMT)"
                    placeholder="Enter default timezone"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-[8px] text-[14px] text-[#1F2937] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-3">
                  Goal Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {goalCategories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center gap-2 bg-[#F3F4F6] px-3 py-1.5 rounded-[6px]"
                    >
                      <span className="text-[12px] font-medium text-[#4B5563]">
                        {category}
                      </span>
                      <button
                        type="button"
                        title={`Remove ${category}`}
                        aria-label={`Remove ${category}`}
                        className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button className="flex items-center gap-1.5 border border-gray-300 bg-white px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                    <Plus size={14} />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Session Types */}
          <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-[16px] font-bold text-[#1F2937] font-dm-sans mb-6 border-b border-gray-100 pb-4">
              Session Types
            </h2>

            <div className="space-y-3 mb-4">
              {sessionTypes.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border border-gray-200 rounded-[8px] px-4 py-3 bg-white"
                >
                  <span className="text-[14px] font-medium text-[#4B5563]">
                    {session}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 border border-gray-200 rounded-[6px] text-[12px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      title={`Remove ${session}`}
                      aria-label={`Remove ${session}`}
                      className="p-1.5 border border-gray-200 rounded-[6px] text-[#6B7280] hover:bg-gray-50 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 rounded-[8px] text-[13px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
              <Plus size={16} />
              Add Session
            </button>
          </div>
        </div>
      )}

      {activeTab === "Notifications" && (
        <div className="space-y-6">
          {/* Email Notifications */}
          <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-[16px] font-bold text-[#1F2937] font-dm-sans mb-6 border-b border-gray-100 pb-4">
              Email Notifications
            </h2>
            <div className="space-y-3">
              {[
                {
                  title: "New session scheduled",
                  desc: "Notify users when a session is scheduled",
                  active: true,
                },
                {
                  title: "Session reminders",
                  desc: "Send reminder 24 hours before session",
                  active: true,
                },
                {
                  title: "Goal deadlines",
                  desc: "Notify when goal deadline is approaching",
                  active: true,
                },
                {
                  title: "New reflection response",
                  desc: "Notify when mentor responds to reflection",
                  active: true,
                },
                {
                  title: "Weekly digest",
                  desc: "Send weekly summary of activities",
                  active: true,
                },
                {
                  title: "Inactivity alerts",
                  desc: "Notify admins of inactive users",
                  active: true,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border border-gray-200 rounded-[8px] px-4 py-3 bg-white"
                >
                  <div>
                    <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans leading-tight mb-0.5">
                      {item.title}
                    </p>
                    <p className="text-[12px] text-[#6B7280] font-rubik leading-tight">
                      {item.desc}
                    </p>
                  </div>
                  <div
                    className={`w-[44px] h-[24px] rounded-full flex items-center px-1 cursor-pointer transition-colors ${item.active ? "bg-[#5B6376]" : "bg-gray-200"}`}
                  >
                    <div
                      className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transform transition-transform ${item.active ? "translate-x-[18px]" : "translate-x-0"}`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Templates */}
          <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-[16px] font-bold text-[#1F2937] font-dm-sans mb-6 border-b border-gray-100 pb-4">
              Email Templates
            </h2>
            <div className="space-y-3">
              {[
                "Welcome Email",
                "Session Reminder",
                "Password Reset",
                "Weekly Digest",
              ].map((template, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border border-gray-200 rounded-[8px] px-4 py-3 bg-white"
                >
                  <span className="text-[14px] font-medium text-[#4B5563]">
                    {template}
                  </span>
                  <button className="px-3 py-1.5 border border-gray-200 rounded-[6px] text-[12px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                    Edit Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Security" && (
        <div className="space-y-6">
          {/* Authentication Settings */}
          <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-[16px] font-bold text-[#1F2937] font-dm-sans mb-6 border-b border-gray-100 pb-4">
              Authentication Settings
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between border border-gray-200 rounded-[8px] px-4 py-3 bg-white">
                <div>
                  <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans leading-tight mb-0.5">
                    Password Requirements
                  </p>
                  <p className="text-[12px] text-[#6B7280] font-rubik leading-tight">
                    Minimum 8 characters, 1 uppercase, 1 number
                  </p>
                </div>
                <button className="px-3 py-1.5 border border-gray-200 rounded-[6px] text-[12px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                  Configure
                </button>
              </div>

              <div className="flex items-center justify-between border border-gray-200 rounded-[8px] px-4 py-3 bg-white">
                <div>
                  <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans leading-tight mb-0.5">
                    Session Timeout
                  </p>
                  <p className="text-[12px] text-[#6B7280] font-rubik leading-tight">
                    Auto logout after inactivity
                  </p>
                </div>
                <div className="bg-[#F3F4F6] px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-[#4B5563]">
                  30 minutes
                </div>
              </div>

              <div className="flex items-center justify-between border border-gray-200 rounded-[8px] px-4 py-3 bg-white">
                <div>
                  <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans leading-tight mb-0.5">
                    Two-Factor Authentication
                  </p>
                  <p className="text-[12px] text-[#6B7280] font-rubik leading-tight">
                    Require 2FA for admin accounts
                  </p>
                </div>
                <div
                  className={`w-[44px] h-[24px] rounded-full flex items-center px-1 cursor-pointer transition-colors bg-gray-200`}
                >
                  <div
                    className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transform transition-transform translate-x-0`}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Access */}
          <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-[16px] font-bold text-[#1F2937] font-dm-sans mb-6 border-b border-gray-100 pb-4">
              Admin Access
            </h2>
            <p className="text-[13px] text-[#4B5563] mb-4">
              Users with administrator access
            </p>
            <div className="space-y-3 mb-4">
              {[
                { name: "[Admin 1]", email: "admin1@vision2535.org" },
                { name: "[Admin 2]", email: "admin2@vision2535.org" },
              ].map((admin, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border border-gray-100 rounded-[8px] px-4 py-3 bg-[#FAFAFA]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-500"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#1F2937] font-dm-sans leading-tight mb-0.5">
                        {admin.name}
                      </p>
                      <p className="text-[12px] text-[#6B7280] font-rubik leading-tight">
                        {admin.email}
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 border border-gray-200 rounded-[6px] text-[12px] font-medium text-[#4B5563] bg-white hover:bg-gray-50 transition-colors">
                    Revoke
                  </button>
                </div>
              ))}
            </div>
            <button className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 rounded-[8px] text-[13px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
              <Plus size={16} />
              Add Admin
            </button>
          </div>

          {/* Data Settings (Titled Authentication Settings in design) */}
          <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-[16px] font-bold text-[#1F2937] font-dm-sans mb-6 border-b border-gray-100 pb-4">
              Data Settings
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between border border-gray-200 rounded-[8px] px-4 py-3 bg-white">
                <div>
                  <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans leading-tight mb-0.5">
                    Data Export
                  </p>
                  <p className="text-[12px] text-[#6B7280] font-rubik leading-tight">
                    Export all platform data
                  </p>
                </div>
                <button className="px-3 py-1.5 border border-gray-200 rounded-[6px] text-[12px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                  Export
                </button>
              </div>

              <div className="flex items-center justify-between border border-gray-200 rounded-[8px] px-4 py-3 bg-white">
                <div>
                  <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans leading-tight mb-0.5">
                    Data Retention
                  </p>
                  <p className="text-[12px] text-[#6B7280] font-rubik leading-tight">
                    How long to keep inactive user data
                  </p>
                </div>
                <div className="bg-[#F3F4F6] px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-[#4B5563]">
                  Forever
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Integrations" && (
        <div className="space-y-6">
          {/* Connected Services */}
          <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-[16px] font-bold text-[#1F2937] font-dm-sans mb-6 border-b border-gray-100 pb-4">
              Connected Services
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between border border-gray-200 rounded-[8px] px-4 py-3 bg-white">
                <div>
                  <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans leading-tight mb-0.5">
                    Email Service
                  </p>
                  <p className="text-[12px] text-[#6B7280] font-rubik leading-tight">
                    SMTP configuration for emails
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-[#333333] text-white text-[11px] font-medium rounded-[4px]">
                    Connected
                  </span>
                  <button className="px-3 py-1.5 border border-gray-200 rounded-[6px] text-[12px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                    Configure
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border border-gray-200 rounded-[8px] px-4 py-3 bg-white">
                <div>
                  <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans leading-tight mb-0.5">
                    Calendar Sync
                  </p>
                  <p className="text-[12px] text-[#6B7280] font-rubik leading-tight">
                    Google/Outlook calendar integration
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-[#F3F4F6] text-[#6B7280] text-[11px] font-medium rounded-[4px]">
                    Not Connected
                  </span>
                  <button className="px-3 py-1.5 border border-gray-200 rounded-[6px] text-[12px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                    Connect
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border border-gray-200 rounded-[8px] px-4 py-3 bg-white">
                <div>
                  <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans leading-tight mb-0.5">
                    File Storage
                  </p>
                  <p className="text-[12px] text-[#6B7280] font-rubik leading-tight">
                    Cloud storage for documents
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-[#333333] text-white text-[11px] font-medium rounded-[4px]">
                    Connected
                  </span>
                  <button className="px-3 py-1.5 border border-gray-200 rounded-[6px] text-[12px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* API Access */}
          <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-[16px] font-bold text-[#1F2937] font-dm-sans mb-6 border-b border-gray-100 pb-4">
              API Access
            </h2>
            <div>
              <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans mb-3">
                API Key
              </p>
              <div className="flex items-center justify-between bg-[#FAFAFA] border border-gray-100 rounded-[8px] px-4 py-3 mb-4">
                <span className="text-[20px] tracking-widest text-[#4B5563] mt-1">
                  ••••••••••••••••
                </span>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 border border-gray-200 rounded-[6px] text-[12px] font-medium text-[#4B5563] bg-white hover:bg-gray-50 transition-colors">
                    Show
                  </button>
                  <button className="text-[13px] font-medium text-[#4B5563] hover:text-[#1F2937] transition-colors ml-2">
                    Regenerate
                  </button>
                </div>
              </div>
              <p className="text-[12px] text-[#6B7280] font-rubik">
                Use this API key to integrate with external services. Keep it
                secure and never share publicly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
