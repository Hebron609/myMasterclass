"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ChangeEvent } from "react";
import { Calendar, Mail, Pencil, UserCircle, X } from "lucide-react";

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  currentYear: string;
  cohort: string;
  joined: string;
}

export interface MentorInfo {
  name: string;
  email: string;
  nextSession: string;
}

interface ActivitySummaryItem {
  label: string;
  value: string;
}

interface MenteeProfilePageContentProps {
  profile: UserProfile;
  activitySummary: ActivitySummaryItem[];
  mentor: MentorInfo;
}

const journeyYears = Array.from({ length: 10 }, (_, index) => `Y${index + 1}`);

/** Read-only display field used in the Profile Information card */
function DisplayField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10.65px] text-[#3A4252] font-rubik mb-2 font-medium">
        {label}
      </p>
      <div className="rounded-lg border border-[#ADADAD] bg-[#F9FAF9] px-3 py-2 text-[10.65px] text-[#3A4252] font-rubik min-h-[34px]">
        {value || <span className="text-gray-300 italic">—</span>}
      </div>
    </div>
  );
}

export default function MenteeProfilePageContent({
  profile,
  activitySummary,
  mentor,
}: MenteeProfilePageContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // What is currently displayed in the Profile Information card
  const [savedData, setSavedData] = useState({
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    bio: profile.bio,
  });

  // Draft state for the modal — seeded from savedData when the modal opens
  const [formData, setFormData] = useState({ ...savedData });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const openModal = () => {
    // Always seed the modal with the latest saved values
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
    // Commit the modal draft → update the displayed profile
    setSavedData({ ...formData });
    console.log("Profile updated:", formData);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    // Discard modal draft without affecting the display
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-[#1a3d3d] font-dm-sans mb-2">
            My Profile
          </h1>
          <p className="text-[16px] text-[#1a3d3d] font-rubik">
            Manage your profile and account settings
          </p>
        </div>
        <button
          onClick={openModal}
          className="rounded-lg bg-[#333333] px-4 py-2 text-[13px] text-white font-rubik hover:bg-[#222222]"
        >
          + Edit Profile
        </button>
      </div>

      {/* Profile + Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ── Profile Information (read-only display) ─────────────── */}
        <div className="bg-white rounded-[15px] border border-gray-100 p-8">
          <div className="mb-6 flex items-center justify-between pb-6 border-b border-[#E5E7EB]">
            <h2 className="text-[16px] font-semibold text-[#1a3d3d] font-dm-sans">
              Profile Information
            </h2>
          </div>

          <div className="flex gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#F2F4F8]">
                <UserCircle className="h-10 w-10 text-[#4B5563]" />
                <button
                  type="button"
                  aria-label="Edit profile photo"
                  className="absolute bottom-3 right-2 flex h-6 w-6 translate-x-1/3 translate-y-1/3 items-center justify-center rounded-full bg-[#1a3d3d] text-white ring-2 ring-white hover:bg-[#163333]"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Read-only fields */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DisplayField label="Full Name"  value={savedData.fullName} />
                <DisplayField label="Email"      value={savedData.email} />
                <DisplayField label="Phone"      value={savedData.phone} />
                <DisplayField label="Location"   value={savedData.location} />
              </div>

              {/* Bio */}
              <div>
                <p className="text-[10.65px] text-[#3A4252] font-rubik mb-2 font-medium">
                  Bio
                </p>
                <div className="rounded-lg border border-[#ADADAD] bg-[#F9FAF9] px-4 py-3 text-[10.65px] text-[#3A4252] font-rubik leading-relaxed">
                  {savedData.bio || <span className="text-gray-300 italic">—</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Activity Summary ─────────────────────────────────────── */}
        <div className="bg-white rounded-[15px] border border-gray-100 p-8">
          <h2 className="text-[16px] font-semibold text-[#1a3d3d] font-dm-sans mb-6 pb-6 border-b border-[#E5E7EB]">
            Activity Summary
          </h2>
          <div className="space-y-3">
            {activitySummary.map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center justify-between rounded-[6px] bg-[#F2F5F5] px-4 py-3 text-[14px] font-rubik text-[#333333] font-regular ${
                  index !== activitySummary.length - 1 ? "border-b border-white" : ""
                }`}
              >
                <span>{item.label}</span>
                <span className="font-medium text-[#333333] text-[14px]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Journey Information */}
      <div className="bg-white rounded-[15px] border border-gray-100 p-8">
        <h2 className="text-[16px] font-medium text-[#576176] font-rubik mb-6 pb-6 border-b border-[#E5E7EB]">
          Journey Information
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { label: "Current Year", value: profile.currentYear },
            { label: "Cohort",       value: profile.cohort },
            { label: "Joined",       value: profile.joined },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[12px] border border-gray-100 bg-[#F8F7F5] px-6 py-4 text-center font-regular text-[#003F3A]"
            >
              <p className="text-[12px] text-[#003F3A] font-rubik mb-1 font-regular">
                {item.label}
              </p>
              <p className="text-[20px] font-semibold text-[#003F3A] font-dm-sans">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <p className="text-[16px] text-[#576176] font-rubik mb-4 font-medium">
            Journey Progress
          </p>
          <div className="flex items-center">
            {journeyYears.map((year, index) => (
              <div key={year} className="flex flex-1 flex-col items-center">
                <span className="text-[10px] text-[#6B7280] font-rubik mb-2">
                  {year}
                </span>
                <div
                  className={`h-2 w-full ${
                    index < 2 ? "bg-[#1a3d3d]" : "bg-[#E5E7EB]"
                  } ${index === 0 ? "rounded-l-full" : ""} ${
                    index === journeyYears.length - 1 ? "rounded-r-full" : ""
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-[12px] text-[#576176] font-rubik font-medium">
            Year 2 of 10
          </p>
        </div>
      </div>

      {/* Account Settings + Mentor */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-[15px] border border-gray-100 p-8">
          <h2 className="text-[16px] font-medium text-[#576176] font-rubik mb-6 pb-6 border-b border-[#E5E7EB]">
            Account Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-[#EEF2F7] px-4 py-4">
              <div>
                <p className="text-[16px] font-semibold text-[#003F3A] font-dm-sans">Change Password</p>
                <p className="text-[12px] text-[#003F3A] font-rubik font-regular">Update your account password</p>
              </div>
              <button className="rounded-md border border-[#D5DCEB] px-3 py-1 text-[11px] text-[#1a3d3d] font-rubik hover:bg-gray-50">
                Change
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[#EEF2F7] px-4 py-4">
              <div>
                <p className="text-[16px] font-semibold text-[#003F3A] font-dm-sans">Email Notifications</p>
                <p className="text-[12px] text-[#003F3A] font-rubik font-regular">Manage email preferences</p>
              </div>
              <label
                htmlFor="email-notifications"
                className="relative inline-flex cursor-pointer items-center"
              >
                <input
                  id="email-notifications"
                  type="checkbox"
                  defaultChecked
                  className="peer sr-only"
                  aria-label="Enable email notifications"
                />
                <div className="h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-[#1a3d3d] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[#EEF2F7] px-4 py-4">
              <div>
                <p className="text-[16px] font-semibold text-[#003F3A] font-dm-sans">Privacy Settings</p>
                <p className="text-[12px] text-[#003F3A] font-rubik font-regular">Control who can see your profile</p>
              </div>
              <button className="rounded-md border border-[#D5DCEB] px-3 py-1 text-[11px] text-[#1a3d3d] font-rubik hover:bg-gray-50">
                Configure
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[15px] border border-gray-100 p-8">
          <h2 className="text-[16px] font-medium text-[#576176] font-rubik mb-6 pb-6 border-b border-[#E5E7EB]">
            My Mentor
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F4F8]">
                <UserCircle className="h-5 w-5 text-[#4B5563]" />
              </div>
              <div>
                <p className="text-[12px] font-medium text-[#3A4252] font-rubik">{mentor.name}</p>
                <p className="text-[11px] text-[#6B7280] font-rubik">Assigned Mentor</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[12px] text-[#1a3d3d] font-rubik mb-6 pb-2 border-b border-[#E5E7EB]">
              <Mail className="h-3.5 w-3.5 text-[#576176]" />
              <span>{mentor.email}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg mb-6 pb-3 border-b border-[#E5E7EB] px-4 py-3 text-[12px] text-[#1a3d3d] font-rubik">
              <div>
                <p className="text-[11px] text-[#6B7280] font-rubik mb-1">Next Session</p>
                <p className="font-semibold text-[15px] text-[#003F3A] font-dm-sans">{mentor.nextSession}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F2F4F8] text-[#1a3d3d]">
                <Calendar className="h-4 w-4" />
              </div>
            </div>

            <button className="w-full rounded-lg border border-[#a1a1a2] px-4 py-2 text-[12px] text-[#003F3A] font-rubik hover:bg-gray-50 font-regular">
              View Mentor Profile
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit Profile Modal ──────────────────────────────────────── */}
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
                  onClick={handleCancel}
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
                    htmlFor="modal-fullName"
                    className="mb-2 block text-[16px] text-[#777777] font-rubik font-medium"
                  >
                    Full Name
                  </label>
                  <input
                    id="modal-fullName"
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
                      htmlFor="modal-email"
                      className="mb-2 block text-[16px] text-[#777777] font-rubik font-medium"
                    >
                      Email
                    </label>
                    <input
                      id="modal-email"
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
                      htmlFor="modal-phone"
                      className="mb-2 block text-[16px] text-[#777777] font-rubik font-medium"
                    >
                      Phone
                    </label>
                    <input
                      id="modal-phone"
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
                    htmlFor="modal-location"
                    className="mb-2 block text-[16px] text-[#777777] font-rubik font-medium"
                  >
                    Location
                  </label>
                  <input
                    id="modal-location"
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
                    htmlFor="modal-bio"
                    className="mb-2 block text-[16px] text-[#777777] font-rubik font-medium"
                  >
                    Bio
                  </label>
                  <textarea
                    id="modal-bio"
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
                  onClick={handleCancel}
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
