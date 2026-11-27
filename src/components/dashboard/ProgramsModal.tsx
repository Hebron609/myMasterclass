"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Target,
  HeartHandshake,
  Briefcase,
  Users,
  Wallet,
  Network,
  Check,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { fetchPrograms } from "@/lib/services/programs";
import { useAuthStore } from "@/store/useAuthStore";
import { availablePrograms } from "@/lib/auth";

interface Program {
  description?: string;
  id: number | string;
  name: string;
}

interface ProgramsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getProgramDetails = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("vision")) {
    return {
      icon: Target,
      description:
        "A guided mentorship journey for leadership and personal growth.",
    };
  }
  if (lowerName.includes("fellowship")) {
    return {
      icon: HeartHandshake,
      description: "Connect, learn, and grow through faith and fellowship.",
    };
  }
  if (lowerName.includes("entrepreneurship")) {
    return {
      icon: Briefcase,
      description:
        "Learn how to build, grow, and sustain a successful business.",
    };
  }
  if (lowerName.includes("leadership")) {
    return {
      icon: Users,
      description:
        "Learn to build, motivate, and manage high-performing teams.",
    };
  }
  if (lowerName.includes("financial")) {
    return {
      icon: Wallet,
      description:
        "Understand budgeting, investing, and financial decision-making.",
    };
  }
  if (lowerName.includes("circle")) {
    return {
      icon: Network,
      description:
        "Learn directly from experienced mentors through guided sessions.",
    };
  }

  // Default fallback
  return {
    icon: Briefcase,
    description: "A comprehensive program designed for your growth.",
  };
};

export function ProgramsModal({ isOpen, onClose }: ProgramsModalProps) {
  const { token } = useAuth();
  const { activeProgram, setActiveProgram } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadPrograms() {
      if (!token) {
        setPrograms([]);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchPrograms(token);
        const activeList = data.filter(
          (p) => String(p.status || "active").toLowerCase() !== "archived",
        );
        if (activeList.length > 0) {
          const mapped: Program[] = activeList.map((p) => ({
            id: p.id,
            name: p.name,
            description:
              p.description || getProgramDetails(p.name).description,
          }));
          setPrograms(mapped);

          // Pre-select current activeProgram or sync initial default
          if (activeProgram && activeProgram.id !== "all") {
            const matchById = mapped.find(
              (p) => String(p.id) === String(activeProgram.id),
            );
            const matchByName = mapped.find(
              (p) =>
                p.name.trim().toLowerCase() ===
                activeProgram.name.trim().toLowerCase(),
            );
            const matched = matchById || matchByName;
            if (matched) {
              setSelectedId(matched.id);
              if (String(activeProgram.id) === "vision-2535") {
                setActiveProgram({
                  id: String(matched.id),
                  name: matched.name,
                  description: matched.description || "",
                });
              }
            } else {
              setSelectedId(mapped[0].id);
            }
          } else {
            setSelectedId(mapped[0].id);
            if (activeProgram?.id === "all") {
              setActiveProgram({
                id: String(mapped[0].id),
                name: mapped[0].name,
                description: mapped[0].description || "",
              });
            }
          }
        } else {
          setPrograms([]);
        }
      } catch (err) {
        setError("Could not load programs. Please try again.");
        setPrograms([]);
      } finally {
        setIsLoading(false);
      }
    }
    if (isOpen || !programs.length) {
      loadPrograms();
    }
  }, [token, isOpen]);

  const handleSubmit = () => {
    if (!selectedId) return;
    setIsSubmitting(true);

    const selectedProgram = programs.find(
      (p) => String(p.id) === String(selectedId),
    );
    if (selectedProgram) {
      const details = getProgramDetails(selectedProgram.name);
      setActiveProgram({
        id: String(selectedProgram.id),
        name: selectedProgram.name,
        description: selectedProgram.description || details.description,
      });
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 200);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-[900px] bg-white rounded-t-[20px] sm:rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90dvh] sm:max-h-[88vh]">
        {error && (
          <p role="alert" className="p-4 sm:p-5 text-sm text-amber-900 bg-amber-50 shrink-0">
            {error}
          </p>
        )}
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 sm:px-8 py-4 sm:py-6 border-b border-gray-100 shrink-0">
          <div className="min-w-0">
            <h2 className="text-[18px] sm:text-[22px] font-bold text-gray-900 font-heading mb-0.5 sm:mb-1">
              Select Your Program
            </h2>
            <p className="text-[12.5px] sm:text-[14px] text-gray-500">
              Switch programs to view each program&apos;s dedicated stats, cohorts, and records.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors -mr-2 shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Programs Grid */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg
                className="animate-spin h-8 w-8 text-[#DB911E]"
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
            </div>
          ) : programs.length === 0 ? (
            <div className="py-12 text-center text-gray-500 font-rubik">
              No active programs available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
              {programs.map((program) => {
                const details = getProgramDetails(program.name);
                const Icon = details.icon;
                const isSelected = String(selectedId) === String(program.id);

                return (
                  <button
                    key={program.id}
                    type="button"
                    onClick={() => setSelectedId(program.id)}
                    className={`relative flex sm:flex-col items-start gap-3.5 sm:gap-0 text-left p-4 sm:p-6 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-[#DB911E] shadow-[0_0_0_1px_#DB911E] bg-orange-50/10"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Checkmark indicator for selected state */}
                    {isSelected && (
                      <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 h-5 w-5 bg-[#DB911E] rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      className={`h-10 w-10 sm:h-12 sm:w-12 rounded-[10px] flex items-center justify-center shrink-0 sm:mb-5 ${
                        isSelected ? "bg-orange-50" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${isSelected ? "text-[#DB911E]" : "text-gray-600"}`}
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Text Content */}
                    <div className="min-w-0 flex-1 pr-5 sm:pr-0">
                      <h3
                        className={`text-[14.5px] sm:text-[16px] font-semibold mb-1 ${isSelected ? "text-[#DB911E]" : "text-gray-900"}`}
                      >
                        {program.name}
                      </h3>
                      <p className="text-[12px] sm:text-[13px] text-gray-500 leading-relaxed">
                        {program.description || details.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-gray-100 grid grid-cols-2 sm:flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 sm:px-6 py-2.5 rounded-[8px] text-[13.5px] sm:text-[14px] font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 transition-colors text-center cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedId || isSubmitting}
            className="px-4 sm:px-6 py-2.5 rounded-[8px] text-[13.5px] sm:text-[14px] font-medium text-white bg-[#DB911E] hover:bg-[#BA7815] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-center cursor-pointer"
          >
            {isSubmitting ? (
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
                Processing...
              </>
            ) : (
              "Choose Program"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
