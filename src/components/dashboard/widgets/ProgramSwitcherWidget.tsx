"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { availablePrograms, Program } from "@/lib/auth";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProgramSwitcherWidget() {
  const { user, activeProgram, setActiveProgram } = useAuthStore();

  // Wait for client mount
  if (!user) return null;

  const userPrograms = user.enrolledPrograms?.length
    ? availablePrograms.filter((p) => user.enrolledPrograms.includes(p.id))
    : availablePrograms; // fallback

  const handleSelect = (program: Program) => {
    setActiveProgram(program);
  };

  return (
    <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[18px] font-bold text-[#576176] font-heading">
          Select Your Program
        </h2>
        <button className="text-[14px] font-bold text-[#576176] hover:text-gray-900 transition-colors font-sans">
          View All
        </button>
      </div>

      {/* Grid of Programs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {userPrograms.map((program) => {
          const isActive = activeProgram?.id === program.id;

          return (
            <button
              key={program.id}
              onClick={() => handleSelect(program)}
              className={cn(
                "rounded-lg border text-left flex flex-col overflow-hidden transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#003F3A]/30",
                isActive
                  ? "border-[#003F3A] shadow-sm tracking-wide"
                  : "border-gray-200 hover:border-gray-300",
              )}
            >
              {/* Top Image Placeholder */}
              <div className="bg-gray-100 w-full h-32 flex flex-col items-center justify-center relative">
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-[12px] font-medium text-gray-500 font-sans">
                  Module 1
                </span>
                
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#003F3A]" />
                )}
              </div>

              {/* Bottom Label */}
              <div
                className={cn(
                  "p-4 text-center w-full bg-white",
                  isActive ? "bg-gray-50" : "",
                )}
              >
                <p
                  className={cn(
                    "text-[14px] font-bold font-heading transition-colors",
                    isActive ? "text-[#003F3A]" : "text-gray-900",
                  )}
                >
                  {program.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
