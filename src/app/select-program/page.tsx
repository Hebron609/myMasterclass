"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { availablePrograms, getRoleDashboardRoute, Program } from "@/lib/auth";

export default function SelectProgramPage() {
  const router = useRouter();
  const { user, setActiveProgram } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If not logged in, boot to login
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!mounted || !user) return null;

  // Filter programs user is enrolled in. Fallback to all if enrolledPrograms is empty/missing for dummy test
  const userPrograms =
    user.enrolledPrograms?.length > 0
      ? availablePrograms.filter((p) => user.enrolledPrograms.includes(p.id))
      : availablePrograms;

  const handleProgramSelection = (program: Program) => {
    setActiveProgram(program);
    const dashboardRoute = getRoleDashboardRoute(user.role);
    router.push(dashboardRoute);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-[32px] md:text-[36px] font-semibold text-[#003F3A] mb-3 font-heading">
          Diba Leagleship Institute
        </h1>
        <p className="text-[16px] font-medium text-[#003F3A]/80 font-sans tracking-wide">
          Mentorship Platform
        </p>
      </div>

      {/* Main Selection Card */}
      <div className="w-full max-w-[800px] bg-white rounded-[20px] p-8 md:p-10 shadow-sm border border-gray-100">
        <h2 className="text-[20px] font-medium text-[#003F3A] mb-4 font-heading">
          Select a program below to continue
        </h2>
        
        {/* Separator Line */}
        <hr className="border-t border-gray-200 mb-8" />

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userPrograms.map((program) => (
            <button
              key={program.id}
              onClick={() => handleProgramSelection(program)}
              className="flex flex-col text-left rounded-[16px] border border-gray-100 bg-white overflow-hidden hover:shadow-md transition-shadow group focus:outline-none focus:ring-2 focus:ring-[#003F3A]/30"
            >
              {/* Image Placeholder Context (Checkerboard Pattern via CSS) */}
              <div 
                className="w-full h-[180px] bg-[#F3F4F6] relative"
                style={{
                  backgroundImage: "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
                }}
              />

              {/* Card Body */}
              <div className="p-6 pb-8">
                <h3 className="text-[17px] font-medium text-[#003F3A] mb-2 font-heading group-hover:text-black transition-colors">
                  {program.name}
                </h3>
                <p className="text-[14px] text-[#4F7370] font-sans">
                  {program.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
