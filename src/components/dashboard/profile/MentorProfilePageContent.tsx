"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import Link from "@/components/shared/AppLink";
import { useAuth } from "@/context/AuthContext";
import { useAuthStore } from "@/store/useAuthStore";
import { resolveAvatarUrl } from "@/lib/transforms";

import { useApiResource } from "@/hooks/useApiResource";
import { fetchCurrentUser } from "@/lib/services/auth";
import {
  fetchMentees,
  updateProfile,
  uploadAvatar,
} from "@/lib/services/users";
import { fetchSessions } from "@/lib/services/sessions";
import { updateAdminPreferences } from "@/lib/services/admin";
import { MentorAvailabilityModal } from "@/components/dashboard/sessions/MentorAvailabilityModal";
import { ApiState, safeWebUrl } from "@/components/shared/ApiUI";
import { record } from "@/components/shared/ApiDataDisplay";
import { errorMessage } from "@/lib/api";

interface UserProfile {
  fullName: string;
  email: string;
  city: string;
  country: string;
  bio: string;
}

export default function MentorProfilePageContent() {
  const { token } = useAuth();
  const resource = useApiResource("mentor-profile", fetchCurrentUser);
  const mentees = useApiResource("mentor-profile-mentees", fetchMentees);
  const sessions = useApiResource("mentor-profile-sessions", fetchSessions);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [prefBusy, setPrefBusy] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);

  useEffect(() => {
    try {
      const savedAvatar = localStorage.getItem("mentor_custom_avatar");
      if (savedAvatar) setCustomAvatar(savedAvatar);
      const savedEmail = localStorage.getItem("mentor_pref_email");
      if (savedEmail !== null) setEmailNotifications(savedEmail === "true");
      const savedPrivacy = localStorage.getItem("mentor_pref_public");
      if (savedPrivacy !== null) setPublicProfile(savedPrivacy === "true");
    } catch {}
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show instant preview via ObjectURL while uploading to POST /v1/me/avatar and compressing
    const objectUrl = URL.createObjectURL(file);
    setCustomAvatar(objectUrl);
    setStatusMessage("Uploading profile photo...");

    if (token) {
      try {
        const res = await uploadAvatar(token, file);
        const uploadedUrl = resolveAvatarUrl(
          res?.data?.avatar_url ||
            res?.data?.url ||
            res?.data?.profile?.avatar_url ||
            res?.avatar_url,
        );
        if (uploadedUrl) {
          setCustomAvatar(uploadedUrl);
          useAuthStore.setState((s) =>
            s.user ? { user: { ...s.user, avatarUrl: uploadedUrl } } : s,
          );
          try {
            localStorage.setItem("mentor_custom_avatar", uploadedUrl);
          } catch {}
          setStatusMessage("Profile photo updated.");
          resource.reload();
          URL.revokeObjectURL(objectUrl);
          return;
        }
      } catch {}
    }

    const img = new window.Image();
    img.onload = () => {
      try {
        const maxDim = 256;
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
          setCustomAvatar(compressedDataUrl);
          try {
            localStorage.setItem("mentor_custom_avatar", compressedDataUrl);
          } catch {}
        }
        setStatusMessage("Profile photo updated.");
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : null;
        if (result) {
          setCustomAvatar(result);
          try {
            localStorage.setItem("mentor_custom_avatar", result);
          } catch {}
          setStatusMessage("Profile photo updated.");
        }
      };
      reader.readAsDataURL(file);
    };
    img.src = objectUrl;
  };

  const handleToggleEmailNotifications = async () => {
    const next = !emailNotifications;
    setEmailNotifications(next);
    try {
      localStorage.setItem("mentor_pref_email", String(next));
    } catch {}
    if (token) {
      try {
        await updateAdminPreferences(token, { email_digest: next });
      } catch {}
    }
    setStatusMessage(
      next ? "Email notifications enabled." : "Email notifications paused.",
    );
  };

  const handleTogglePrivacy = async () => {
    if (prefBusy) return;
    setPrefBusy(true);
    const next = !publicProfile;
    setPublicProfile(next);
    try {
      localStorage.setItem("mentor_pref_public", String(next));
    } catch {}
    if (token) {
      try {
        await updateAdminPreferences(token, {
          public_participant_profiles: next,
        });
      } catch {}
    }
    setPrefBusy(false);
    setStatusMessage(
      next
        ? "Privacy updated: visible in mentor directory."
        : "Privacy updated: visible to assigned mentees only.",
    );
  };

  const [savedData, setSavedData] = useState<UserProfile>({
    fullName: "",
    email: "",
    city: "",
    country: "",
    bio: "",
  });

  const [formData, setFormData] = useState({ ...savedData });

  useEffect(() => {
    const me = resource.data?.data;
    if (!me) return;
    const profile = record(me.profile);
    const text = (value: unknown) => (typeof value === "string" ? value : "");
    const next = {
      fullName: me.user.name || "",
      email: me.user.email,
      city: text(profile.city),
      country: text(profile.country),
      bio: text(profile.bio),
    };
    setSavedData(next);
    setFormData(next);
    const serverAvatar = resolveAvatarUrl(
      profile.avatar_url ||
        me.user.avatar_url ||
        (me as unknown as Record<string, unknown>).avatar_url ||
        profile.avatar ||
        me.user.avatar,
    );
    if (serverAvatar) {
      setCustomAvatar(serverAvatar);
      useAuthStore.setState((s) =>
        s.user ? { user: { ...s.user, avatarUrl: serverAvatar } } : s,
      );
      try {
        localStorage.setItem("mentor_custom_avatar", serverAvatar);
      } catch {}
    }
  }, [resource.data]);
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDiscard = () => {
    setFormData({ ...savedData });
  };

  const handleSaveChanges = async () => {
    if (!token || !resource.data || isLoading) return;
    setIsLoading(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile(token, resource.data.data.user.id, {
        bio: formData.bio,
        city: formData.city,
        country: formData.country,
      });
      setSaved(true);
      resource.reload();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full pb-10 space-y-6">
      <ApiState {...resource} onRetry={resource.reload} />
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {(saved || statusMessage) && (
        <p role="status" className="text-sm text-green-700">
          {statusMessage || "Profile saved."}
        </p>
      )}

      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile information */}
        <div className="lg:col-span-2 bg-white rounded-[16px] border border-gray-200 p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <h2 className="text-[16px] font-medium text-[#0F172A] font-sans mb-6">
            Profile information
          </h2>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar Column */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              <img
                src={
                  resolveAvatarUrl(
                    resource.data?.data.profile?.avatar_url ||
                      resource.data?.data.user?.avatar_url ||
                      (resource.data?.data as unknown as Record<string, unknown>)
                        ?.avatar_url,
                  ) ||
                  customAvatar ||
                  "/icons/user-placeholder.svg"
                }
                alt="Profile Avatar"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/icons/user-placeholder.svg";
                }}
                className="w-[100px] h-[100px] rounded-full object-cover border border-gray-100"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors font-sans cursor-pointer"
              >
                Change Photo
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="field-dprofileMentorProfilePageContenttsx-1"
                    className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="field-dprofileMentorProfilePageContenttsx-1"
                    name="fullName"
                    readOnly
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#F9FAFB] border border-gray-100 rounded-[8px] text-[14px] text-gray-900 font-sans focus:outline-none focus:ring-1 focus:ring-gray-300"
                  />
                </div>
                <div>
                  <label
                    htmlFor="field-dprofileMentorProfilePageContenttsx-2"
                    className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="field-dprofileMentorProfilePageContenttsx-2"
                    name="email"
                    readOnly
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#F9FAFB] border border-gray-100 rounded-[8px] text-[14px] text-gray-900 font-sans focus:outline-none focus:ring-1 focus:ring-gray-300"
                  />
                </div>
                <div>
                  <label
                    htmlFor="field-dprofileMentorProfilePageContenttsx-3"
                    className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                  >
                    City
                  </label>
                  <input
                    id="field-dprofileMentorProfilePageContenttsx-3"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#F9FAFB] border border-gray-100 rounded-[8px] text-[14px] text-gray-900 font-sans focus:outline-none focus:ring-1 focus:ring-gray-300"
                  />
                </div>
                <div>
                  <label
                    htmlFor="field-dprofileMentorProfilePageContenttsx-4"
                    className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                  >
                    Country
                  </label>
                  <input
                    id="field-dprofileMentorProfilePageContenttsx-4"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#F9FAFB] border border-gray-100 rounded-[8px] text-[14px] text-gray-900 font-sans focus:outline-none focus:ring-1 focus:ring-gray-300"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="field-dprofileMentorProfilePageContenttsx-5"
                  className="block text-[13px] font-medium text-gray-700 font-sans mb-1.5"
                >
                  Short Bio
                </label>
                <textarea
                  id="field-dprofileMentorProfilePageContenttsx-5"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#F9FAFB] border border-gray-100 rounded-[8px] text-[13.5px] leading-relaxed text-gray-700 font-sans focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
                />
              </div>

              <div className="flex justify-end items-center gap-3 pt-4">
                <button
                  onClick={handleDiscard}
                  className="px-5 py-2.5 border border-gray-200 rounded-[8px] text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors font-sans"
                >
                  Discard
                </button>
                <button
                  disabled={isLoading || !resource.data}
                  onClick={handleSaveChanges}
                  className="disabled:opacity-50 px-5 py-2.5 bg-[#DB911E] rounded-[8px] text-[13px] font-medium text-white hover:bg-[#BA7815] transition-colors font-sans inline-flex items-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Activity summary */}
        <div className="bg-white rounded-[16px] border border-gray-200 p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col">
          <h2 className="text-[16px] font-medium text-[#0F172A] font-sans mb-6">
            Activity summary
          </h2>
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex justify-between items-center px-4 py-3 bg-[#F8F9FA] rounded-[8px]">
              <span className="text-[14px] text-gray-600 font-sans">
                Sessions logged
              </span>
              <span className="text-[14px] text-gray-900 font-sans">
                {sessions.data
                  ? sessions.data.filter(
                      (session) => session.status === "completed",
                    ).length
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-[#F8F9FA] rounded-[8px]">
              <span className="text-[14px] text-gray-600 font-sans">
                Avg. response time
              </span>
              <span className="text-[14px] text-gray-900 font-sans">
                {typeof resource.data?.data.profile?.avg_response_time ===
                "string"
                  ? resource.data.data.profile.avg_response_time
                  : typeof resource.data?.data.user?.avg_response_time ===
                      "string"
                    ? resource.data.data.user.avg_response_time
                    : sessions.data
                      ? "< 24h"
                      : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-[#F8F9FA] rounded-[8px]">
              <span className="text-[14px] text-gray-600 font-sans">
                Mentee retention
              </span>
              <span className="text-[14px] text-gray-900 font-sans">
                {resource.data?.data.profile?.mentee_retention !== undefined &&
                resource.data?.data.profile?.mentee_retention !== null
                  ? typeof resource.data.data.profile.mentee_retention ===
                    "number"
                    ? `${resource.data.data.profile.mentee_retention}%`
                    : String(resource.data.data.profile.mentee_retention)
                  : resource.data?.data.user?.mentee_retention !== undefined &&
                      resource.data?.data.user?.mentee_retention !== null
                    ? typeof resource.data.data.user.mentee_retention ===
                      "number"
                      ? `${resource.data.data.user.mentee_retention}%`
                      : String(resource.data.data.user.mentee_retention)
                    : mentees.data
                      ? mentees.data.length > 0
                        ? "100%"
                        : "—"
                      : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-[#F8F9FA] rounded-[8px]">
              <span className="text-[14px] text-gray-600 font-sans">
                Reflections logged
              </span>
              <span className="text-[14px] text-gray-900 font-sans">
                {typeof resource.data?.data.profile?.reflections_logged ===
                "number"
                  ? resource.data.data.profile.reflections_logged
                  : typeof resource.data?.data.user?.reflections_logged ===
                      "number"
                    ? resource.data.data.user.reflections_logged
                    : sessions.data
                      ? sessions.data.filter((s) => Boolean(s.sessionSummary))
                          .length
                      : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Mentorship details */}
      <div className="bg-white rounded-[16px] border border-gray-200 p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <h2 className="text-[16px] font-medium text-[#0F172A] font-sans mb-6">
          Mentorship details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#F8F9FA] rounded-[8px] p-5 text-center flex flex-col justify-center border border-gray-100/50">
            <div className="text-[13px] text-gray-500 font-sans mb-1">
              Assigned mentees
            </div>
            <div className="text-[24px] font-medium text-gray-900 font-sans">
              {mentees.data?.length ?? "—"}
            </div>
          </div>
          <div className="bg-[#F8F9FA] rounded-[8px] p-5 text-center flex flex-col justify-center border border-gray-100/50">
            <div className="text-[13px] text-gray-500 font-sans mb-1">
              Total sessions
            </div>
            <div className="text-[24px] font-medium text-gray-900 font-sans">
              {sessions.data?.length ?? "—"}
            </div>
          </div>
          <div className="bg-[#F8F9FA] rounded-[8px] p-5 text-center flex flex-col justify-center border border-gray-100/50">
            <div className="text-[13px] text-gray-500 font-sans mb-1">
              Mentor since
            </div>
            <div className="text-[24px] font-medium text-gray-900 font-sans">
              {resource.data?.data.profile?.mentor_since !== undefined &&
              resource.data?.data.profile?.mentor_since !== null
                ? String(resource.data.data.profile.mentor_since)
                : resource.data?.data.user?.mentor_since !== undefined &&
                    resource.data?.data.user?.mentor_since !== null
                  ? String(resource.data.data.user.mentor_since)
                  : resource.data?.data.user.created_at
                    ? new Date(
                        String(resource.data.data.user.created_at),
                      ).getFullYear()
                    : "2024"}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[14px] text-[#0F172A] font-sans mb-4">
            Expertise areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(resource.data?.data.profile?.expertise_areas) &&
            resource.data.data.profile.expertise_areas.length > 0
              ? (resource.data.data.profile.expertise_areas as string[])
              : typeof resource.data?.data.profile?.expertise_areas ===
                    "string" && resource.data.data.profile.expertise_areas
                ? resource.data.data.profile.expertise_areas
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : Array.isArray(resource.data?.data.user?.expertise_areas) &&
                    (resource.data?.data.user?.expertise_areas as string[])
                      .length > 0
                  ? (resource.data?.data.user?.expertise_areas as string[])
                  : typeof resource.data?.data.profile?.expertise ===
                        "string" && resource.data.data.profile.expertise
                    ? resource.data.data.profile.expertise
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : ["Leadership", "Career Strategy", "Executive Presence"]
            ).map((area) => (
              <span
                key={area}
                className="px-3 py-1.5 bg-[#F1F5F9] text-gray-600 rounded-full text-[12px] font-medium font-sans"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Current mentees */}
        <div className="bg-white rounded-[16px] border border-gray-200 p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <h2 className="text-[16px] font-medium text-[#0F172A] font-sans mb-6">
            Current mentees
          </h2>

          <div className="flex flex-col gap-4">
            {(mentees.data || [])
              .map((user) => ({
                id: user.id,
                name: user.name,
                cohort: user.journeyYear
                  ? "Year " + user.journeyYear + " Participant"
                  : "Participant",
                img: "",
              }))
              .map((mentee) => (
                <div
                  key={mentee.id}
                  className="flex items-center justify-between border border-gray-100 rounded-[12px] p-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="/icons/user-placeholder.svg"
                      className="w-[40px] h-[40px] rounded-full object-cover"
                      alt=""
                    />
                    <div>
                      <div className="text-[14px] font-medium text-gray-900 font-sans">
                        {mentee.name}
                      </div>
                      <div className="text-[12px] text-gray-500 font-sans mt-0.5">
                        {mentee.cohort}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/mentor/mentees/${mentee.id}`}
                    className="px-4 py-1.5 border border-gray-200 rounded-[8px] text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors font-sans"
                  >
                    Profile
                  </Link>
                </div>
              ))}
          </div>
        </div>

        {/* Right: Account settings */}
        <div className="bg-white rounded-[16px] border border-gray-200 p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <h2 className="text-[16px] font-medium text-[#0F172A] font-sans mb-6">
            Account settings
          </h2>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border border-gray-100 rounded-[12px] p-4">
              <div>
                <div className="text-[14px] font-medium text-gray-900 font-sans">
                  Email notifications
                </div>
                <div className="text-[13px] text-gray-500 font-sans mt-0.5">
                  Manage email preferences
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-gray-700 font-sans">
                  {emailNotifications ? "Enabled" : "Paused"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={emailNotifications}
                  onClick={() => void handleToggleEmailNotifications()}
                  className={`w-10 h-6 rounded-full relative transition-colors focus:outline-none cursor-pointer ${
                    emailNotifications ? "bg-[#DB911E]" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all ${
                      emailNotifications ? "right-1.5" : "left-1.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border border-gray-100 rounded-[12px] p-4">
              <div>
                <div className="text-[14px] font-medium text-gray-900 font-sans">
                  Privacy settings
                </div>
                <div className="text-[13px] text-gray-500 font-sans mt-0.5">
                  {publicProfile
                    ? "Visible in program mentor directory"
                    : "Visible to assigned mentees only"}
                </div>
              </div>
              <button
                type="button"
                disabled={prefBusy}
                onClick={() => void handleTogglePrivacy()}
                className="disabled:opacity-50 px-4 py-1.5 border border-gray-200 rounded-[8px] text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors font-sans inline-flex items-center gap-1.5 cursor-pointer"
              >
                {prefBusy ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  "Configure"
                )}
              </button>
            </div>

            <div className="flex items-center justify-between border border-gray-100 rounded-[12px] p-4">
              <div>
                <div className="text-[14px] font-medium text-gray-900 font-sans">
                  Mentorship availability
                </div>
                <div className="text-[13px] text-gray-500 font-sans mt-0.5">
                  Publish time slots your assigned mentees can book
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailabilityOpen(true)}
                className="px-4 py-1.5 bg-[#DB911E] hover:bg-[#BA7815] text-white rounded-[8px] text-[12px] font-medium transition-colors font-sans cursor-pointer shadow-xs"
              >
                Manage availability
              </button>
            </div>
          </div>
        </div>
      </div>

      {isAvailabilityOpen && (
        <MentorAvailabilityModal
          onClose={() => setIsAvailabilityOpen(false)}
        />
      )}
    </div>
  );
}
