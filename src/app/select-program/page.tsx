"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  TrendingUp,
  Users,
  ShieldCheck,
  Sparkles,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { availablePrograms, getRoleDashboardRoute, Program } from "@/lib/auth";
import { useApiResource } from "@/hooks/useApiResource";
import { fetchPrograms } from "@/lib/services/programs";
import { SessionGuard } from "@/components/shared/SessionGuard";
import logoIcon from "../../../public/icons/Diba-Leagleship-Institute-Blk.svg";
import onboardingSideImage from "../../../public/images/onboarding-image.jpg";

const getProgramCardDetails = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("vision")) {
    return {
      icon: Sparkles,
      iconBgSelected: "bg-[#FFF6EA]",
      iconColorSelected: "text-[#D98020]",
      iconBg: "bg-[#FFF6EA]",
      iconColor: "text-[#D98020]",
      defaultDesc: "A guided mentorship journey for leadership and personal growth.",
    };
  }
  return {
    icon: Users,
    iconBgSelected: "bg-[#FFF6EA]",
    iconColorSelected: "text-[#D98020]",
    iconBg: "bg-[#F3F4F6]",
    iconColor: "text-gray-600",
    defaultDesc: "Get advanced training and mentorship from senior leaders.",
  };
};

export default function SelectProgramPage() {
  return (
    <SessionGuard>
      <SelectProgramContent />
    </SessionGuard>
  );
}

function SelectProgramContent() {
  const router = useRouter();
  const { user, setActiveProgram } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const resource = useApiResource("program-selection", fetchPrograms);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  // Combine API programs with available fallback programs
  const apiPrograms: Program[] = (resource.data || []).map((p) => {
    const details = getProgramCardDetails(p.name);
    return {
      id: String(p.id),
      name: p.name,
      description: p.description || details.defaultDesc,
    };
  });

  const programs: Program[] =
    apiPrograms.length > 0 ? apiPrograms : availablePrograms;

  // Default selection to first program if not selected yet
  const activeSelectedId = selectedId || (programs.length > 0 ? programs[0].id : null);

  const handleProgramSelection = (program: Program) => {
    setSelectedId(program.id);
    setBusy(true);
    setActiveProgram(program);
    const dashboardRoute = getRoleDashboardRoute(user.role);
    router.push(dashboardRoute);
  };

  const handleComplete = () => {
    const chosen = programs.find((p) => p.id === activeSelectedId) || programs[0];
    if (chosen) {
      handleProgramSelection(chosen);
    }
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-[#ECEEF2] font-sans">
      {/* Left Side: Select Program Card (Approx 58% width) */}
      <div className="w-full lg:w-[58%] min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-[520px] bg-white rounded-[24px] p-6 sm:p-8 md:p-9 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col">
          {/* Top Logo */}
          <div className="flex justify-center mb-5">
            <Image
              src={logoIcon}
              alt="Diba Leagleship Institute"
              className="h-[46px] w-auto object-contain"
              priority
            />
          </div>

          {/* Heading */}
          <h1 className="text-[22px] sm:text-[24px] font-bold text-[#111827] text-center mb-1.5 font-heading tracking-tight">
            Welcome to LEAGLESHIP
          </h1>
          <p className="text-[13.5px] sm:text-[14px] text-gray-500 text-center mb-6 leading-relaxed max-w-[420px] mx-auto">
            Your journey begins with selecting the program you&apos;ve been invited to join.
          </p>

          {/* Section Label */}
          <label className="block text-[13px] font-semibold text-gray-700 mb-3">
            Choose Program
          </label>

          {/* Program Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-6">
            {programs.map((program) => {
              const details = getProgramCardDetails(program.name);
              const Icon = details.icon;
              const isSelected = activeSelectedId === program.id;

              return (
                <button
                  key={program.id}
                  type="button"
                  onClick={() => setSelectedId(program.id)}
                  className={`relative flex flex-col text-left p-5 rounded-[16px] border transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#D98020]/40 ${
                    isSelected
                      ? "border-[#D98020] shadow-[0_4px_16px_rgba(217,128,32,0.16)] bg-white ring-1 ring-[#D98020]"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  {/* Selected Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-3.5 right-3.5 h-5 w-5 bg-[#D98020] rounded-full flex items-center justify-center animate-in fade-in zoom-in-75 duration-150">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                  )}

                  {/* Icon Squircle */}
                  <div
                    className={`h-10 w-10 rounded-[10px] flex items-center justify-center mb-4 transition-colors ${
                      isSelected
                        ? `${details.iconBgSelected} ${details.iconColorSelected}`
                        : `${details.iconBg} ${details.iconColor}`
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>

                  {/* Program Content */}
                  <div className="flex-1 flex flex-col">
                    <h2 className="text-[14.5px] font-bold text-[#1E293B] mb-1 font-heading">
                      {program.name}
                    </h2>
                    <p className="text-[12px] text-gray-500 leading-relaxed font-sans line-clamp-3">
                      {program.description || details.defaultDesc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Button: Complete */}
          <button
            type="button"
            onClick={handleComplete}
            disabled={busy || !activeSelectedId}
            className="w-full bg-[#D98020] hover:bg-[#B46714] text-white font-medium py-3 rounded-[10px] text-[15px] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                <span>Processing...</span>
              </>
            ) : (
              "Complete"
            )}
          </button>
        </div>
      </div>

      {/* Right Side - Info & Image (Approx 42% width) */}
      <div className="hidden lg:flex w-full lg:w-[42%] bg-white relative flex-col justify-center px-6 lg:px-8 overflow-y-auto py-8">
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
                <TrendingUp className="h-4 w-4" />
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
                  Learn directly from experienced mentors who walk the journey with you.
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
              alt="Mentorship Group Session"
              className="w-full h-auto object-cover rounded-[16px] mb-4"
              priority
            />
            <p className="text-[14px] text-gray-500 text-center leading-relaxed italic">
              &ldquo;Your future is shaped by what you choose to become today.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
