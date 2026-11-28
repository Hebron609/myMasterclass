"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Mic,
  Moon,
  Users,
  ShieldCheck,
} from "lucide-react";
import { SessionGuard } from "@/components/shared/SessionGuard";
import { useAuth } from "@/context/AuthContext";
import { useAuthStore } from "@/store/useAuthStore";
import { getRoleDashboardRoute } from "@/lib/auth";
import { errorMessage } from "@/lib/api";
import { uploadAvatar, updateAccount } from "@/lib/services/account";
import { fetchCurrentUser, sessionUser } from "@/lib/services/auth";
import logoIcon from "../../../public/icons/Diba-Leagleship-Institute-Blk.svg";
import onboardingSideImage from "../../../public/images/onboarding-image.jpg";
import { updateProfile } from "@/lib/services/users";

function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  current = false,
  required = true,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  current?: boolean;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const id = current
    ? "current-password"
    : label === "Confirm Password"
      ? "confirm-password"
      : "new-password";
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[13px] font-semibold text-gray-700 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={current ? "current-password" : "new-password"}
          required={required}
          minLength={current || !required ? undefined : 8}
          className="w-full pl-4 pr-11 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent transition-all"
        />
        <button
          type="button"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#5A657D]"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export function OnboardingForm() {
  const { token, hasLoginPassword, completeOnboarding } = useAuth();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [shortBio, setShortBio] = useState("");
  const [country, setCountry] = useState("");
  const [occupation, setOccupation] = useState("");
  const [otherOccupation, setOtherOccupation] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [current, setCurrent] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [themeToast, setThemeToast] = useState(false);
  useEffect(() => {
    if (!photo) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  const choosePhoto = (file?: File) => {
    if (busy || !file) return;
    if (
      !["image/jpeg", "image/png"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Choose a JPG or PNG photo no larger than 5MB.");
      return;
    }
    setPhoto(file);
    setUploaded(false);
    setError(null);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !user || lock.current) return;
    setError(null);
    const wantsPasswordChange = Boolean(
      user.mustChangePassword || password.length > 0 || confirmation.length > 0,
    );
    if (
      wantsPasswordChange &&
      (password.length < 8 || password !== confirmation)
    ) {
      setError(
        password.length < 8
          ? "Use at least 8 characters for your new password."
          : "Your passwords do not match.",
      );
      return;
    }
    if (!shortBio.trim() || !country) {
      setError("Please enter your short bio and select your country to continue.");
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      if (photo && !uploaded) {
        await uploadAvatar(token, photo);
        setUploaded(true);
      }
      if (phone.trim()) {
        try {
          await updateAccount(token, { phone: phone.trim() });
        } catch {
          // Continue if phone format requires specific validation
        }
      }
      await updateProfile(token, user.id, { bio: shortBio.trim(), country });
      if (wantsPasswordChange) {
        await completeOnboarding(password, confirmation, current);
      } else {
        const { data } = await fetchCurrentUser(token);
        const refreshed = sessionUser(data);
        useAuthStore.getState().login(
          { ...refreshed, profileComplete: true },
          token,
        );
      }
      setPassword("");
      setConfirmation("");
      setCurrent("");
      router.replace("/select-program");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <SessionGuard>
      <main className="min-h-screen flex w-full font-sans text-gray-900 overflow-hidden bg-white">
        {/* Left Side - Form (Approx 58% width) */}
        <div className="w-full lg:w-[58%] flex flex-col items-center justify-center p-4 sm:p-6 bg-[#EBEBEB] overflow-y-auto">
          <div className="w-full max-w-[600px] bg-white rounded-[16px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] my-4">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src={logoIcon}
                alt="Diba Leagleship Institute"
                className="h-[48px] w-auto object-contain"
                priority
              />
            </div>

            {/* Headlines */}
            <div className="text-center mb-6">
              <h1 className="text-[22px] font-bold text-[#1e293b] mb-1.5 font-heading tracking-tight">
                Welcome to LEAGLESHIP
              </h1>
              <p className="text-[14px] text-gray-500">
                Let&apos;s complete your profile to personalize your mentorship
                journey.
              </p>
            </div>

            <form onSubmit={save} className="space-y-4">
              <fieldset
                disabled={busy}
                className="space-y-4 disabled:opacity-70"
              >
                <div>
                  <label
                    htmlFor="onboarding-photo"
                    className="block text-[13px] font-semibold text-gray-700 mb-2"
                  >
                    Upload Photo
                  </label>
                  <label
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      choosePhoto(event.dataTransfer.files[0]);
                    }}
                    className="relative w-full border border-dashed border-gray-300 rounded-[8px] py-4 px-4 flex flex-col gap-1 items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-[#D97706]"
                  >
                    <input
                      id="onboarding-photo"
                      type="file"
                      accept="image/jpeg,image/png"
                      className="sr-only"
                      onChange={(e) => {
                        choosePhoto(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                    {preview ? (
                      <img
                        src={preview}
                        alt="Selected profile photo"
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <ImageIcon
                        size={24}
                        strokeWidth={1.5}
                        className="text-[#484848]"
                      />
                    )}
                    <span className="text-[13px] font-semibold text-[#1e293b]">
                      {photo ? photo.name : "Drag and drop your files"}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium tracking-wide">
                      JPG, PNG • Max 5MB
                    </span>
                  </label>
                </div>
                {!hasLoginPassword &&
                  (user?.mustChangePassword || password.length > 0) && (
                    <PasswordInput
                      label="Current or temporary password"
                      placeholder="Enter the password you used to sign in..."
                      value={current}
                      onChange={setCurrent}
                      current
                      required={Boolean(
                        user?.mustChangePassword || password.length > 0,
                      )}
                    />
                  )}
                <PasswordInput
                  label={
                    user?.mustChangePassword
                      ? "Update Your Password"
                      : "Update Your Password (Optional)"
                  }
                  placeholder="Create your new password..."
                  value={password}
                  onChange={setPassword}
                  required={Boolean(user?.mustChangePassword)}
                />
                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm your new password..."
                  value={confirmation}
                  onChange={setConfirmation}
                  required={Boolean(
                    user?.mustChangePassword || password.length > 0,
                  )}
                />
                {/* Short Bio */}
                <div>
                  <label
                    htmlFor="onboarding-short-bio"
                    className="block text-[13px] font-semibold text-gray-700 mb-2"
                  >
                    Short Bio
                  </label>
                  <textarea
                    id="onboarding-short-bio"
                    value={shortBio}
                    onChange={(e) => setShortBio(e.target.value)}
                    placeholder="Tell us a little about yourself, your interests, or your aspirations."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent transition-all resize-none"
                    required
                  />
                </div>

                {/* Country */}
                <div>
                  <label
                    htmlFor="onboarding-country"
                    className="block text-[13px] font-semibold text-gray-700 mb-2"
                  >
                    Country
                  </label>
                  <div className="relative">
                    <select
                      id="onboarding-country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className={`w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] appearance-none focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent transition-all ${country ? "text-gray-900" : "text-gray-400"}`}
                      required
                    >
                      <option value="" disabled>
                        Select your country
                      </option>
                      <option value="GH">Ghana</option>
                      <option value="NG">Nigeria</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Occupation */}
                <div>
                  <label
                    htmlFor="onboarding-occupation"
                    className="block text-[13px] font-semibold text-gray-700 mb-2"
                  >
                    Occupation
                  </label>
                  <div className="relative">
                    <select
                      id="onboarding-occupation"
                      value={
                        occupation === "student" ||
                        occupation === "employed" ||
                        occupation === "unemployed" ||
                        occupation === "internship" ||
                        occupation === ""
                          ? occupation
                          : "other"
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== "other") {
                          setOccupation(val);
                          setOtherOccupation("");
                        } else {
                          setOccupation("other");
                        }
                      }}
                      className={`w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] appearance-none focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent transition-all ${occupation ? "text-gray-900" : "text-gray-400"}`}
                      required
                    >
                      <option value="" disabled>
                        Search your occupation or select
                      </option>
                      <option value="student">Student</option>
                      <option value="employed">Employed</option>
                      <option value="unemployed">Unemployed</option>
                      <option value="internship">Internship</option>
                      <option value="other">Other (Please specify)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {occupation === "other" && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={otherOccupation}
                        onChange={(e) => {
                          setOtherOccupation(e.target.value);
                        }}
                        placeholder="Specify your occupation"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="onboarding-phone"
                    className="block text-[13px] font-semibold text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <div className="w-full flex items-center px-4 bg-white border border-gray-200 rounded-[8px] focus-within:ring-2 focus-within:ring-[#D97706] focus-within:border-transparent transition-all">
                    <span className="text-[14px] text-gray-500 mr-2 whitespace-nowrap select-none">
                      +233 <span className="mx-0.5 text-gray-300">|</span>
                    </span>
                    <input
                      type="tel"
                      id="onboarding-phone"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))
                      }
                      placeholder="50 342 5679"
                      className="w-full py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>
              </fieldset>
              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#D98020] hover:bg-[#B46714] text-white font-medium py-3 rounded-[8px] text-[15px] transition-colors mt-4 flex items-center justify-center gap-2"
              >
                {busy ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  "Continue"
                )}
              </button>

              <p className="text-[11px] text-gray-400 text-center pt-2 pb-2">
                You can edit these later in profile settings
              </p>
            </form>
          </div>
        </div>

        {/* Right Side - Info & Image (Approx 42% width) */}
        <div className="hidden lg:flex w-full lg:w-[42%] bg-white relative flex-col justify-center px-6 lg:px-8 overflow-y-auto py-8">
          <button
            type="button"
            onClick={() => {
              setThemeToast(true);
              setTimeout(() => setThemeToast(false), 3000);
            }}
            aria-label="Toggle theme"
            className="absolute top-6 right-6 p-2 bg-white border border-gray-200 rounded-[8px] text-gray-500 hover:text-gray-900 transition-colors z-10 cursor-pointer"
          >
            <Moon className="h-[20px] w-[20px]" />
          </button>

          {themeToast && (
            <div
              role="status"
              className="fixed top-6 right-6 z-[999999] bg-[#111928] text-white px-5 py-3 rounded-[10px] text-[13px] font-medium shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-200"
            >
              <Moon className="w-4 h-4 text-[#C19A5B]" />
              <span>Dark theme is coming soon!</span>
            </div>
          )}

          <div className="w-full max-w-[560px] mx-auto flex flex-col">
            <div className="mb-8">
              <h2 className="text-[24px] font-bold text-[#1e293b] mb-2 font-heading text-center">
                Begin a Journey That Lasts a Lifetime
              </h2>
              <p className="text-[14px] text-gray-500 text-center">
                Join 12,000+ people already using Leagleship
              </p>
            </div>

            <div className="w-full space-y-6 mb-8 px-2">
              {/* Feature 1 */}
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-[#F3F4F6] rounded-[8px] text-gray-600 shrink-0 mt-0.5">
                  <Mic className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1e293b] mb-1">
                    Personal Growth
                  </h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed">
                    Develop the habits, mindset, and character needed to thrive.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-[#F3F4F6] rounded-[8px] text-gray-600 shrink-0 mt-0.5">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1e293b] mb-1">
                    Dedicated Mentorship
                  </h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed">
                    Learn directly from experienced mentors who walk the journey
                    with you.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-[#F3F4F6] rounded-[8px] text-gray-600 shrink-0 mt-0.5">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1e293b] mb-1">
                    Purposeful Progress
                  </h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed">
                    Automatic transcription and action item extraction
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full bg-[#F9F9F9] rounded-[24px] p-5 flex flex-col items-center">
              <Image
                src={onboardingSideImage}
                alt="Onboarding"
                className="w-full h-auto object-cover rounded-[16px] mb-4"
                priority
              />
              <p className="text-[14px] text-gray-500 text-center leading-relaxed">
                "Your future is shaped by what you choose to become today."
              </p>
            </div>
          </div>
        </div>
      </main>
    </SessionGuard>
  );
}
