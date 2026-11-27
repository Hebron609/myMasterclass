"use client";

import { Calendar, Mail, User, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAuthStore } from "@/store/useAuthStore";
import { resolveAvatarUrl } from "@/lib/transforms";
import { useApiResource } from "@/hooks/useApiResource";
import { fetchCurrentUser } from "@/lib/services/auth";
import {
  fetchMyMentor,
  fetchMentors,
  updateProfile,
  uploadAvatar,
} from "@/lib/services/users";
import { updateAdminPreferences } from "@/lib/services/admin";
import { fetchGoals } from "@/lib/services/goals";
import { fetchSessions } from "@/lib/services/sessions";
import { fetchReflections } from "@/lib/services/reflections";
import {
  ApiState,
  formatDate,
  formatDateTime,
  safeWebUrl,
} from "@/components/shared/ApiUI";
import { record, records } from "@/components/shared/ApiDataDisplay";
import { errorMessage } from "@/lib/api";

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
  profile?: UserProfile;
  activitySummary?: ActivitySummaryItem[];
  mentor?: MentorInfo;
}

export default function MenteeProfilePageContent() {
  const { token, userRole } = useAuth();
  const router = useRouter();
  const resource = useApiResource("profile", fetchCurrentUser);
  const goals = useApiResource(
    "profile-goals",
    fetchGoals,
    userRole === "MENTEE",
  );
  const sessions = useApiResource("profile-sessions", fetchSessions);
  const reflections = useApiResource(
    "profile-reflections",
    fetchReflections,
    userRole === "MENTEE",
  );
  const assigned = useApiResource(
    "profile-mentor",
    fetchMyMentor,
    userRole === "MENTEE",
  );
  const mentorsDirectory = useApiResource(
    "profile-mentors-directory",
    fetchMentors,
    userRole === "MENTEE",
  );
  const me = resource.data?.data;
  const data = record(me?.profile);
  const text = (value: unknown) => (typeof value === "string" ? value : "");
  const [form, setForm] = useState({
    preferred_name: "",
    city: "",
    country: "",
    bio: "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [prefBusy, setPrefBusy] = useState(false);

  useEffect(() => {
    try {
      const savedAvatar = localStorage.getItem("mentee_custom_avatar");
      if (savedAvatar) setCustomAvatar(savedAvatar);
      const savedEmail = localStorage.getItem("mentee_pref_email");
      if (savedEmail !== null) setEmailNotifications(savedEmail === "true");
      const savedPrivacy = localStorage.getItem("mentee_pref_public");
      if (savedPrivacy !== null) setPublicProfile(savedPrivacy === "true");
    } catch {}
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show instant preview via ObjectURL while uploading to POST /v1/me/avatar and compressing
    const objectUrl = URL.createObjectURL(file);
    setCustomAvatar(objectUrl);
    setMessage("Uploading profile photo...");

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
            localStorage.setItem("mentee_custom_avatar", uploadedUrl);
          } catch {}
          setMessage("Profile photo updated.");
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
            localStorage.setItem("mentee_custom_avatar", compressedDataUrl);
          } catch {}
        }
        setMessage("Profile photo updated.");
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
            localStorage.setItem("mentee_custom_avatar", result);
          } catch {}
          setMessage("Profile photo updated.");
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
      localStorage.setItem("mentee_pref_email", String(next));
    } catch {}
    if (token) {
      try {
        await updateAdminPreferences(token, { email_digest: next });
      } catch {}
    }
    setMessage(
      next ? "Email notifications enabled." : "Email notifications paused.",
    );
  };

  const handleTogglePrivacy = async () => {
    if (prefBusy) return;
    setPrefBusy(true);
    const next = !publicProfile;
    setPublicProfile(next);
    try {
      localStorage.setItem("mentee_pref_public", String(next));
    } catch {}
    if (token) {
      try {
        await updateAdminPreferences(token, {
          public_participant_profiles: next,
        });
      } catch {}
    }
    setPrefBusy(false);
    setMessage(
      next
        ? "Privacy updated: visible to cohort members."
        : "Privacy updated: visible to mentors & admins only.",
    );
  };
  const reset = () => {
    setForm({
      preferred_name: text(data.preferred_name),
      city: text(data.city),
      country: text(data.country),
      bio: text(data.bio),
    });
    setMessage(null);
    setError(null);
  };
  useEffect(() => {
    if (me) {
      setForm({
        preferred_name: text(me.profile?.preferred_name),
        city: text(me.profile?.city),
        country: text(me.profile?.country),
        bio: text(me.profile?.bio),
      });
      const serverAvatar = resolveAvatarUrl(
        me.profile?.avatar_url ||
          me.user?.avatar_url ||
          (me as unknown as Record<string, unknown>).avatar_url ||
          me.profile?.avatar ||
          me.user?.avatar,
      );
      if (serverAvatar) {
        setCustomAvatar(serverAvatar);
        useAuthStore.setState((s) =>
          s.user ? { user: { ...s.user, avatarUrl: serverAvatar } } : s,
        );
        try {
          localStorage.setItem("mentee_custom_avatar", serverAvatar);
        } catch {}
      }
    }
  }, [me]);
  const year = typeof data.journey_year === "number" ? data.journey_year : null;
  const cohortNames = records(me?.cohorts)
    .map((c) => String(c.name || ""))
    .filter(Boolean)
    .join(", ");
  const profile = {
    fullName:
      me?.user.name ||
      `${me?.user.first_name || ""} ${me?.user.last_name || ""}`.trim() ||
      "—",
    email: me?.user.email || "—",
    currentYear: year ? `Year ${year}` : "—",
    cohort: cohortNames || "—",
    joined: formatDate(text(me?.user.created_at)),
  };
  const directoryMentor = (mentorsDirectory.data || []).find(
    (m) =>
      (assigned.data?.mentor?.id &&
        String(m.id) === String(assigned.data.mentor.id)) ||
      m.isAssigned,
  );
  const mentorAvatarUrl =
    resolveAvatarUrl(
      assigned.data?.mentor?.profile?.avatar_url ||
        (assigned.data?.mentor as unknown as Record<string, unknown>)
          ?.avatar_url ||
        (assigned.data?.mentor as unknown as Record<string, unknown>)?.avatar,
    ) ||
    resolveAvatarUrl(directoryMentor?.avatarUrl) ||
    "/icons/user-placeholder.svg";
  const mentor = {
    name:
      assigned.data?.mentor?.name ||
      directoryMentor?.name ||
      "Not yet assigned",
    email:
      assigned.data?.mentor?.email || directoryMentor?.email || "—",
    nextSession: assigned.data?.next_session
      ? formatDateTime(
          assigned.data.next_session.session_date ||
            assigned.data.next_session.starts_at,
        )
      : "No upcoming session",
  };
  const activitySummary = [
    {
      label: "Goals completed",
      value: goals.data
        ? String(goals.data.filter((g) => g.status === "completed").length)
        : "—",
    },
    {
      label: "Sessions attended",
      value: sessions.data
        ? String(sessions.data.filter((s) => s.status === "completed").length)
        : "—",
    },
    {
      label: "Reflections written",
      value: reflections.data ? String(reflections.data.length) : "—",
    },
    {
      label: "Modules completed",
      value:
        typeof data.modules_completed === "number"
          ? String(data.modules_completed)
          : year !== null
            ? String(Math.max(0, year - 1))
            : "—",
    },
  ];
  const save = async () => {
    if (!token || !me || busy) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await updateProfile(token, me.user.id, form);
      setMessage("Profile saved.");
      resource.reload();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="w-full pb-10">
      <ApiState {...resource} onRetry={resource.reload} />
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mb-4 text-sm text-green-700">
          {message}
        </p>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Overview (col 4) */}
        <div className="lg:col-span-4 bg-white rounded-[20px] border border-gray-100 p-4 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-5 bg-[#F8F7F5] border border-gray-100">
            {resolveAvatarUrl(
              data.avatar_url ||
                me?.user?.avatar_url ||
                (me as unknown as Record<string, unknown>)?.avatar_url,
            ) || customAvatar ? (
              <img
                src={
                  (resolveAvatarUrl(
                    data.avatar_url ||
                      me?.user?.avatar_url ||
                      (me as unknown as Record<string, unknown>)?.avatar_url,
                  ) || customAvatar)!
                }
                alt="Profile"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/icons/user-placeholder.svg";
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-full w-full p-6 text-gray-400" />
            )}
          </div>
          <h2 className="text-[18px] font-medium text-gray-900 font-sans mb-1">
            {profile.fullName}
          </h2>
          <p className="text-[13px] text-gray-500 font-sans mb-8">
            {profile.cohort} · {profile.currentYear}
          </p>
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
            className="w-full mt-auto rounded-xl border border-gray-200 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors font-sans cursor-pointer"
          >
            Change Photo
          </button>
        </div>

        {/* Editable Form (col 8) */}
        <div className="lg:col-span-8 bg-white rounded-[20px] border border-gray-100 p-4 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
            <div>
              <label
                htmlFor="field-dprofileMenteeProfilePageContenttsx-1"
                className="block text-[12.5px] font-medium text-gray-700 font-sans mb-1.5"
              >
                Full Name
              </label>
              <input
                id="field-dprofileMenteeProfilePageContenttsx-1"
                type="text"
                readOnly
                value={profile.fullName}
                className="w-full bg-[#F8F7F5] rounded-xl px-4 py-2.5 text-[13px] text-gray-900 font-sans focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
            <div>
              <label
                htmlFor="field-dprofileMenteeProfilePageContenttsx-2"
                className="block text-[12.5px] font-medium text-gray-700 font-sans mb-1.5"
              >
                Preferred Name
              </label>
              <input
                id="field-dprofileMenteeProfilePageContenttsx-2"
                type="text"
                value={form.preferred_name}
                onChange={(event) =>
                  setForm({ ...form, preferred_name: event.target.value })
                }
                className="w-full bg-[#F8F7F5] rounded-xl px-4 py-2.5 text-[13px] text-gray-900 font-sans focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
            <div>
              <label
                htmlFor="field-dprofileMenteeProfilePageContenttsx-3"
                className="block text-[12.5px] font-medium text-gray-700 font-sans mb-1.5"
              >
                Email
              </label>
              <input
                id="field-dprofileMenteeProfilePageContenttsx-3"
                type="email"
                readOnly
                value={profile.email}
                className="w-full bg-[#F8F7F5] rounded-xl px-4 py-2.5 text-[13px] text-gray-900 font-sans focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
            <div>
              <label
                htmlFor="field-dprofileMenteeProfilePageContenttsx-4"
                className="block text-[12.5px] font-medium text-gray-700 font-sans mb-1.5"
              >
                Phone Number
              </label>
              <input
                id="field-dprofileMenteeProfilePageContenttsx-4"
                type="text"
                readOnly
                value={text(me?.user.phone) || "—"}
                className="w-full bg-[#F8F7F5] rounded-xl px-4 py-2.5 text-[13px] text-gray-900 font-sans focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
            <div>
              <label
                htmlFor="field-dprofileMenteeProfilePageContenttsx-5"
                className="block text-[12.5px] font-medium text-gray-700 font-sans mb-1.5"
              >
                City
              </label>
              <input
                id="field-dprofileMenteeProfilePageContenttsx-5"
                type="text"
                value={form.city}
                onChange={(event) =>
                  setForm({ ...form, city: event.target.value })
                }
                className="w-full bg-[#F8F7F5] rounded-xl px-4 py-2.5 text-[13px] text-gray-900 font-sans focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
            <div>
              <label
                htmlFor="field-dprofileMenteeProfilePageContenttsx-6"
                className="block text-[12.5px] font-medium text-gray-700 font-sans mb-1.5"
              >
                Country
              </label>
              <input
                id="field-dprofileMenteeProfilePageContenttsx-6"
                type="text"
                value={form.country}
                onChange={(event) =>
                  setForm({ ...form, country: event.target.value })
                }
                className="w-full bg-[#F8F7F5] rounded-xl px-4 py-2.5 text-[13px] text-gray-900 font-sans focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
          </div>

          <div className="mb-8">
            <label
              htmlFor="field-dprofileMenteeProfilePageContenttsx-7"
              className="block text-[12.5px] font-medium text-gray-700 font-sans mb-1.5"
            >
              Short Bio
            </label>
            <textarea
              id="field-dprofileMenteeProfilePageContenttsx-7"
              rows={4}
              value={form.bio}
              onChange={(event) =>
                setForm({ ...form, bio: event.target.value })
              }
              className="w-full bg-[#F8F7F5] rounded-xl px-4 py-3 text-[13px] text-gray-900 font-sans focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3">
            <button
              disabled={busy}
              onClick={reset}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-[12.5px] font-medium text-gray-700 hover:bg-gray-50 transition-colors font-sans"
            >
              Discard
            </button>
            <button
              disabled={busy || !me}
              onClick={save}
              className="disabled:opacity-50 px-5 py-2.5 rounded-xl bg-[#DB911E] text-[12.5px] font-medium text-white hover:bg-[#BA7815] transition-colors font-sans inline-flex items-center gap-2"
            >
              {busy ? (
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

        {/* Journey Information (col 7) */}
        <div className="lg:col-span-7 bg-white rounded-[20px] border border-gray-100 p-4 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="text-[15px] font-medium text-gray-900 font-sans mb-6">
              Journey information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#F8F7F5] rounded-xl py-5 flex flex-col items-center justify-center text-center">
                <p className="text-[12px] text-gray-500 font-sans mb-1">
                  Current year
                </p>
                <p className="text-[16px] font-medium text-gray-900 font-sans">
                  {profile.currentYear}
                </p>
              </div>
              <div className="bg-[#F8F7F5] rounded-xl py-5 flex flex-col items-center justify-center text-center">
                <p className="text-[12px] text-gray-500 font-sans mb-1">
                  Cohort
                </p>
                <p className="text-[16px] font-medium text-gray-900 font-sans">
                  {profile.cohort}
                </p>
              </div>
              <div className="bg-[#F8F7F5] rounded-xl py-5 flex flex-col items-center justify-center text-center">
                <p className="text-[12px] text-gray-500 font-sans mb-1">
                  Joined
                </p>
                <p className="text-[16px] font-medium text-gray-900 font-sans">
                  {profile.joined}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-100 rounded-[16px] p-6 pb-4">
            <h4 className="text-[13px] font-medium text-gray-700 font-sans mb-6">
              Journey progress
            </h4>

            {/* Stepper */}
            <div className="relative flex justify-between items-center mb-6 px-2">
              {/* Background line */}
              <div className="absolute left-[5%] right-[5%] top-[14px] h-px bg-gray-200 z-0"></div>

              {/* Steps */}
              {Array.from({ length: 6 }, (_, i) => ({
                step: i + 1,
                label:
                  year && i + 1 < year
                    ? "Done"
                    : i + 1 === year
                      ? `Y${year}`
                      : "—",
                active: year !== null && i + 1 <= year,
                done: year !== null && i + 1 < year,
              })).map((item, idx) => (
                <div
                  key={idx}
                  className="relative z-10 flex flex-col items-center gap-2 bg-white px-2"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-medium font-sans ${
                      item.done
                        ? "bg-[#DB911E] text-white"
                        : item.active
                          ? "border-2 border-[#DB911E] text-[#DB911E] bg-white"
                          : "border border-gray-200 text-gray-400 bg-white"
                    }`}
                  >
                    {item.step}
                  </div>
                  <span className="text-[11.5px] text-gray-400 font-sans">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-center text-[11px] text-gray-500 font-sans">
              Year {year || "—"} of 10
            </p>
          </div>
        </div>

        {/* Activity Summary (col 5) */}
        <div className="lg:col-span-5 bg-white rounded-[20px] border border-gray-100 p-4 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-full flex flex-col">
          <h3 className="text-[15px] font-medium text-gray-900 font-sans mb-6">
            Activity summary
          </h3>
          <div className="space-y-3 flex-1 flex flex-col justify-between">
            {activitySummary.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#F8F7F5] rounded-xl px-5 py-4 flex items-center justify-between"
              >
                <span className="text-[13px] text-gray-600 font-sans">
                  {item.label}
                </span>
                <span className="text-[13px] font-medium text-gray-900 font-sans">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Account Settings (col 7) */}
        <div className="lg:col-span-7 bg-white rounded-[20px] border border-gray-100 p-4 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <h3 className="text-[15px] font-medium text-gray-900 font-sans mb-6">
            Account settings
          </h3>

          <div className="space-y-3">
            <div className="border border-gray-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <h4 className="text-[13.5px] font-medium text-gray-900 font-sans mb-0.5">
                  Email notifications
                </h4>
                <p className="text-[12px] text-gray-500 font-sans">
                  Manage email preferences
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-medium text-gray-900 font-sans">
                  {emailNotifications ? "Enabled" : "Paused"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={emailNotifications}
                  aria-label="Toggle email notifications"
                  onClick={() => void handleToggleEmailNotifications()}
                  className={`w-10 h-6 rounded-full relative shadow-inner transition-colors cursor-pointer ${
                    emailNotifications ? "bg-[#DB911E]" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${
                      emailNotifications ? "right-1" : "left-1"
                    }`}
                  ></div>
                </button>
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <h4 className="text-[13.5px] font-medium text-gray-900 font-sans mb-0.5">
                  Privacy settings
                </h4>
                <p className="text-[12px] text-gray-500 font-sans">
                  {publicProfile
                    ? "Visible to cohort members & mentors"
                    : "Visible to mentors & admins only"}
                </p>
              </div>
              <button
                type="button"
                disabled={prefBusy}
                onClick={() => void handleTogglePrivacy()}
                className="disabled:opacity-50 px-5 py-2 border border-gray-200 rounded-xl text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors font-sans w-fit inline-flex items-center gap-1.5 cursor-pointer"
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
          </div>
        </div>

        {/* My Mentor (col 5) */}
        <div className="lg:col-span-5 bg-white rounded-[20px] border border-gray-100 p-4 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="text-[15px] font-medium text-gray-900 font-sans mb-6">
              My Mentor
            </h3>

            <div className="flex items-center gap-4 mb-5">
              <img
                src={mentorAvatarUrl}
                alt={mentor.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/icons/user-placeholder.svg";
                }}
                className="w-12 h-12 rounded-full object-cover bg-gray-100 border border-gray-200 shrink-0"
              />
              <div>
                <h4 className="text-[14.5px] font-medium text-gray-900 font-sans">
                  {mentor.name}
                </h4>
                <p className="text-[12px] text-gray-500 font-sans">
                  Assigned mentor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-gray-100 pb-5 mb-5">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-[13px] text-gray-600 font-sans">
                {mentor.email}
              </span>
            </div>

            <div className="bg-[#F8F7F5] rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[12px] text-gray-500 font-sans">
                  Next Session
                </span>
              </div>
              <p className="text-[13.5px] font-medium text-gray-900 font-sans">
                {mentor.nextSession}
              </p>
            </div>
          </div>

          <button
            disabled={!assigned.data?.mentor}
            onClick={() => router.push("/mentee/mentors")}
            className="w-full mt-auto rounded-xl border border-gray-200 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors font-sans"
          >
            View Mentor Profile
          </button>
        </div>
      </div>
    </div>
  );
}
