"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ChangeEvent } from "react";
import { Pencil, UserCircle, X } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

interface ActivityItem {
  label: string;
  value: string;
}

interface MenteeCard {
  name: string;
  year: string;
  cohort: string;
}

function DisplayField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[12px] text-[#3A4252] font-rubik mb-2 font-medium">
        {label}
      </p>
      <div className="rounded-lg border border-[#ADADAD] bg-white px-3 py-2.5 text-[14px] text-[#3A4252] font-rubik min-h-[42px] flex items-center">
        {value || <span className="text-gray-300 italic">—</span>}
      </div>
    </div>
  );
}

export default function MentorProfilePageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [savedData, setSavedData] = useState<UserProfile>({
    fullName: "Mentor Name",
    email: "user_email_address",
    phone: "user_phone_number",
    location: "user_location",
    bio: "A passionate learner committed to personal growth and leadership development. Currently focused on building communication skills and expanding professional network.",
  });

  const [formData, setFormData] = useState({ ...savedData });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const openModal = () => {
    setFormData({ ...savedData });
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    setSavedData({ ...formData });
    setIsModalOpen(false);
  };

  const activitySummary: ActivityItem[] = [
    { label: "Goals Completed", value: "12" },
    { label: "Sessions Attended", value: "24" },
    { label: "Reflections Written", value: "18" },
    { label: "Modules Completed", value: "2 / 10" },
  ];

  const mentorshipStats = [
    { label: "Assigned Mentees", value: "5" },
    { label: "Total Sessions", value: "48" },
    { label: "Mentor Since", value: "Jan 2023" },
  ];

  const expertiseAreas = [
    "Leadership",
    "Career Development",
    "Problem Solving",
    "Communication",
    "Goal Setting",
  ];

  const currentMentees: MenteeCard[] = [
    { name: "[Mentee Name 1]", year: "Year 2", cohort: "Cohort 2024A" },
    { name: "[Mentee Name 2]", year: "Year 2", cohort: "Cohort 2024A" },
    { name: "[Mentee Name 3]", year: "Year 2", cohort: "Cohort 2024A" },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#003F3A] font-dm-sans mb-1">
            My Profile
          </h1>
          <p className="text-[16px] text-[#003F3A]/80 font-rubik">
            Manage your profile and account settings
          </p>
        </div>
        <button
          onClick={openModal}
          className="rounded-lg bg-[#333333] px-6 py-2.5 text-[14px] text-white font-bold font-dm-sans hover:bg-[#222222] transition-colors shadow-sm"
        >
          + Edit Profile
        </button>
      </div>

      {/* Profile + Activity Summary */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Profile Information */}
        <div className="lg:col-span-3 bg-white rounded-[20px] border border-gray-100 p-8 shadow-sm">
          <h2 className="text-[18px] font-bold text-[#333333] font-dm-sans mb-6">
            Profile Information
          </h2>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#F2F4F8] border border-gray-100">
                <UserCircle className="h-12 w-12 text-[#4B5563]" />
                <button
                  type="button"
                  className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#333333] text-white border-2 border-white hover:bg-[#222222] transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {/* Fields */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <DisplayField label="Full Name" value={savedData.fullName} />
                <DisplayField label="Email" value={savedData.email} />
                <DisplayField label="Phone" value={savedData.phone} />
                <DisplayField label="Location" value={savedData.location} />
              </div>
              <div>
                <p className="text-[12px] text-[#3A4252] font-rubik mb-2 font-medium">Bio</p>
                <div className="rounded-lg border border-[#ADADAD] bg-white px-4 py-3 text-[14px] text-[#4B5563] font-rubik leading-relaxed min-h-[80px]">
                  {savedData.bio}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="lg:col-span-2 bg-white rounded-[20px] border border-gray-100 p-8 shadow-sm">
          <h2 className="text-[18px] font-bold text-[#333333] font-dm-sans mb-6">
            Activity Summary
          </h2>
          <div className="space-y-4">
            {activitySummary.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl bg-[#F2F5F5] px-5 py-4 text-[14px] font-rubik text-[#333333]"
              >
                <span className="font-medium">{item.label}</span>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mentorship Details */}
      <div className="bg-white rounded-[20px] border border-gray-100 p-8 shadow-sm">
        <h2 className="text-[18px] font-bold text-[#333333] font-dm-sans mb-8">
          Mentorship Details
        </h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {mentorshipStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-[#F8F7F5] px-6 py-6 text-center border border-gray-50"
            >
              <p className="text-[14px] text-[#003F3A] font-rubik mb-2 font-medium uppercase tracking-tight opacity-70">
                {stat.label}
              </p>
              <p className="text-[28px] font-bold text-[#003F3A] font-dm-sans">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Expertise Areas */}
        <div className="space-y-4">
          <h3 className="text-[16px] font-bold text-[#333333] font-dm-sans">Expertise Areas</h3>
          <div className="flex flex-wrap gap-3">
            {expertiseAreas.map((area) => (
              <span
                key={area}
                className="px-6 py-2.5 border border-[#D5DCEB] bg-white text-[#333333] text-[14px] font-bold rounded-lg font-dm-sans"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Mentees */}
        <div className="bg-white rounded-[20px] border border-gray-100 p-8 shadow-sm">
          <h2 className="text-[18px] font-bold text-[#333333] font-dm-sans mb-6">
            Current Mentees
          </h2>
          <div className="space-y-4 mb-6">
            {currentMentees.map((mentee, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-[#F2F4F8] rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-[#F2F4F8] rounded-full flex items-center justify-center flex-shrink-0">
                  <UserCircle className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-[#333333] font-dm-sans">{mentee.name}</p>
                  <p className="text-[12px] text-gray-500 font-rubik">{mentee.year} • {mentee.cohort}</p>
                </div>
              </div>
            ))}
          </div>
          <Link 
            href="/mentor/mentees"
            className="block w-full text-center py-3 border border-[#D5DCEB] rounded-xl text-[14px] font-bold text-[#333333] hover:bg-gray-50 transition-colors font-dm-sans"
          >
            View All Mentees
          </Link>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-[20px] border border-gray-100 p-8 shadow-sm">
          <h2 className="text-[18px] font-bold text-[#333333] font-dm-sans mb-6">
            Account Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 border border-[#F2F4F8] rounded-2xl bg-white">
              <div>
                <p className="text-[16px] font-bold text-[#003F3A] font-dm-sans">Change Password</p>
                <p className="text-[12px] text-gray-500 font-rubik">Update your account password</p>
              </div>
              <button className="px-5 py-2 border border-[#D5DCEB] rounded-lg text-[13px] font-bold text-[#333333] hover:bg-gray-50 transition-colors font-dm-sans">
                Change
              </button>
            </div>

            <div className="flex items-center justify-between p-5 border border-[#F2F4F8] rounded-2xl bg-white">
              <div>
                <p className="text-[16px] font-bold text-[#003F3A] font-dm-sans">Email Notifications</p>
                <p className="text-[12px] text-gray-500 font-rubik">Manage email preferences</p>
              </div>
              <div className="flex items-center gap-3">
                 <span className="text-[12px] font-bold text-[#333333] font-rubik">Enabled</span>
                 <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" defaultChecked className="peer sr-only" />
                  <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-[#1a3d3d] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 border border-[#F2F4F8] rounded-2xl bg-white">
              <div>
                <p className="text-[16px] font-bold text-[#003F3A] font-dm-sans">Privacy Settings</p>
                <p className="text-[12px] text-gray-500 font-rubik">Control who can see your profile</p>
              </div>
              <button className="px-5 py-2 border border-[#D5DCEB] rounded-lg text-[13px] font-bold text-[#333333] hover:bg-gray-50 transition-colors font-dm-sans">
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isModalOpen &&
        isMounted &&
        createPortal(
          <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl rounded-[15px] border border-gray-100 bg-white p-8 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-[16px] font-semibold text-[#1a3d3d] font-dm-sans">
                  Edit Profile
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Avatar row */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F4F8]">
                    <UserCircle className="h-6 w-6 text-[#4B5563]" />
                  </div>
                  <button className="rounded-md border border-[#D5DCEB] px-3 py-1 text-[11px] text-[#1a3d3d] font-rubik hover:bg-gray-50">
                    Change Photo
                  </button>
                </div>

                {/* Full Name */}
                <div>
                  <label
                    className="mb-2 block text-[16px] text-[#777777] font-rubik font-medium"
                  >
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-[#D5DCEB] bg-white px-3 py-2 text-[16px] text-[#3A4252] font-rubik focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Email */}
                  <div>
                    <label
                      className="mb-2 block text-[16px] text-[#777777] font-rubik font-medium"
                    >
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-[#D5DCEB] bg-white px-3 py-2 text-[16px] text-[#3A4252] font-rubik focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                  {/* Phone */}
                  <div>
                    <label
                      className="mb-2 block text-[16px] text-[#777777] font-rubik font-medium"
                    >
                      Phone
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-[#D5DCEB] bg-white px-3 py-2 text-[16px] text-[#3A4252] font-rubik focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label
                    className="mb-2 block text-[16px] text-[#777777] font-rubik font-medium"
                  >
                    Location
                  </label>
                  <input
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-[#D5DCEB] bg-white px-3 py-2 text-[16px] text-[#3A4252] font-rubik focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label
                    className="mb-2 block text-[16px] text-[#777777] font-rubik font-medium"
                  >
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    rows={5}
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Update your bio..."
                    className="w-full rounded-lg border border-[#D5DCEB] bg-white px-3 py-2 text-[16px] text-[#3A4252] font-rubik focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-[#D5DCEB] px-4 py-2 text-[12px] text-[#4B5563] font-rubik hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="rounded-lg bg-[#333333] px-4 py-2 text-[12px] text-white font-rubik hover:bg-[#222222]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
