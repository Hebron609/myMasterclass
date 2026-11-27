"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Check,
  Target,
  Users,
  Briefcase,
  Shield,
  Wallet,
  Network,
  Loader2,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchPrograms, createProgram } from "@/lib/services/programs";
import { updateCohort } from "@/lib/services/cohorts";
import { errorMessage } from "@/lib/api";
import type { Program } from "@/types";

function getProgramIcon(title: string, index: number): React.ReactNode {
  const lower = title.toLowerCase();
  if (lower.includes("fellowship") || lower.includes("community")) {
    return <Users className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />;
  }
  if (
    lower.includes("entrepreneur") ||
    lower.includes("business") ||
    lower.includes("career")
  ) {
    return <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />;
  }
  if (
    lower.includes("team") ||
    lower.includes("leadership") ||
    lower.includes("lead")
  ) {
    return <Shield className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />;
  }
  if (
    lower.includes("financ") ||
    lower.includes("wealth") ||
    lower.includes("economy")
  ) {
    return <Wallet className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />;
  }
  if (
    lower.includes("circle") ||
    lower.includes("network") ||
    lower.includes("mentor")
  ) {
    return <Network className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />;
  }
  const fallbackIcons = [
    <Target key="target" className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />,
    <Users key="users" className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />,
    <Briefcase key="briefcase" className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />,
    <Shield key="shield" className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />,
    <Wallet key="wallet" className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />,
    <Network key="network" className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />,
  ];
  return fallbackIcons[index % fallbackIcons.length];
}

interface AssignProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohortId: string | number;
  cohortName: string;
  currentProgramId?: number | null;
  currentCategory?: string;
  onProgramAssigned?: (
    programId: number,
    programName: string,
    programDescription?: string,
  ) => void;
}

export function AssignProgramModal({
  isOpen,
  onClose,
  cohortId,
  cohortName,
  currentProgramId,
  currentCategory,
  onProgramAssigned,
}: AssignProgramModalProps) {
  const { token } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [livePrograms, setLivePrograms] = useState<Program[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline Create Program state (creates directly in backend via POST /v1/programs)
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProgramName, setNewProgramName] = useState("");
  const [newProgramDescription, setNewProgramDescription] = useState("");
  const [creatingBusy, setCreatingBusy] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only show live non-archived programs from GET /v1/programs
  const availablePrograms = livePrograms.filter(
    (p) => String(p.status || "active").toLowerCase() !== "archived",
  );

  // Fetch live programs from backend when modal opens
  useEffect(() => {
    if (!isOpen || !token) return;
    setError(null);
    setIsCreatingNew(false);
    setLoadingPrograms(true);
    let active = true;

    fetchPrograms(token)
      .then((programs) => {
        if (!active) return;
        setLivePrograms(programs);
        const activeList = programs.filter(
          (p) => String(p.status || "active").toLowerCase() !== "archived",
        );

        if (currentProgramId) {
          const match = activeList.find(
            (p) => Number(p.id) === Number(currentProgramId),
          );
          if (match) {
            setSelectedProgramId(Number(match.id));
            return;
          }
        }

        if (currentCategory) {
          const cleanCat = currentCategory.trim().toLowerCase();
          const matchByCat = activeList.find(
            (p) =>
              p.name.trim().toLowerCase() === cleanCat ||
              p.name.replace(/\s+program$/i, "").trim().toLowerCase() ===
                cleanCat,
          );
          if (matchByCat) {
            setSelectedProgramId(Number(matchByCat.id));
            return;
          }
        }

        if (activeList.length > 0) {
          setSelectedProgramId(Number(activeList[0].id));
        } else {
          setSelectedProgramId(null);
        }
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      })
      .finally(() => {
        if (active) setLoadingPrograms(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, currentProgramId, currentCategory, token]);

  if (!isOpen || !mounted) return null;

  const handleCreateNewProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || creatingBusy || !newProgramName.trim()) return;
    setCreatingBusy(true);
    setError(null);
    try {
      const created = await createProgram(token, {
        name: newProgramName.trim(),
        description: newProgramDescription.trim() || undefined,
        status: "Active",
      });
      setLivePrograms((prev) => [...prev, created]);
      setSelectedProgramId(Number(created.id));
      setNewProgramName("");
      setNewProgramDescription("");
      setIsCreatingNew(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setCreatingBusy(false);
    }
  };

  const handleAssignProgram = async () => {
    if (!token || busy || !selectedProgramId) return;
    const targetProgram = availablePrograms.find(
      (p) => Number(p.id) === Number(selectedProgramId),
    );
    if (!targetProgram) return;

    setBusy(true);
    setError(null);

    try {
      await updateCohort(token, Number(cohortId), {
        program_id: Number(targetProgram.id),
      });

      if (onProgramAssigned) {
        onProgramAssigned(
          Number(targetProgram.id),
          targetProgram.name,
          targetProgram.description,
        );
      }
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 font-sans animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-program-modal-title"
        className="relative w-full max-w-[940px] max-h-[90dvh] sm:max-h-[86dvh] bg-white rounded-t-[20px] sm:rounded-[20px] shadow-2xl flex flex-col pointer-events-auto border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 sm:px-7 py-4 sm:py-6 border-b border-[#F3F4F6] shrink-0">
          <div className="min-w-0">
            <h2
              id="assign-program-modal-title"
              className="text-[17px] sm:text-[20px] font-medium text-[#111928] font-sans tracking-tight"
            >
              Select Your Program to Assign
            </h2>
            <p className="text-[12.5px] sm:text-[13.5px] text-[#6B7280] font-normal font-sans mt-0.5 sm:mt-1">
              Assign a live program from your database to{" "}
              <span className="font-medium text-gray-800">{cohortName}</span>.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCreatingNew((prev) => !prev)}
              className="px-3 py-1.5 rounded-[8px] border border-gray-200 hover:bg-gray-50 text-[12.5px] font-medium text-gray-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreatingNew ? "Hide Form" : "New Program"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="px-5 sm:px-7 pt-3 sm:pt-4 shrink-0">
            <p
              role="alert"
              className="text-sm text-red-600 bg-red-50 p-3 rounded-[8px] border border-red-100 font-sans"
            >
              {error}
            </p>
          </div>
        )}

        {/* Optional Inline Create Program Form (saves to POST /v1/programs) */}
        {isCreatingNew && (
          <form
            onSubmit={handleCreateNewProgram}
            className="mx-5 sm:mx-7 mt-4 p-4 rounded-[14px] bg-[#FAFBF9] border border-gray-200 space-y-3 shrink-0"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1">
                  Program Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fellowship Program"
                  value={newProgramName}
                  onChange={(e) => setNewProgramName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[8px] text-[13.5px] text-gray-900 outline-none focus:border-[#D98020]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Short description of the program..."
                  value={newProgramDescription}
                  onChange={(e) => setNewProgramDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[8px] text-[13.5px] text-gray-900 outline-none focus:border-[#D98020]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-3.5 py-1.5 text-[12.5px] font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingBusy || !newProgramName.trim()}
                className="px-4 py-1.5 bg-[#111928] hover:bg-slate-800 text-white rounded-[8px] text-[12.5px] font-medium inline-flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
              >
                {creatingBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{creatingBusy ? "Creating..." : "Save to Programs"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Scrollable Live Program Cards Grid */}
        <div className="p-4 sm:p-7 overflow-y-auto flex-1">
          {loadingPrograms ? (
            <div className="py-12 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin text-[#D98020]" />
              <span>Loading programs from database...</span>
            </div>
          ) : availablePrograms.length === 0 ? (
            <div className="py-10 px-4 text-center border border-dashed border-gray-200 rounded-[16px]">
              <p className="text-[14.5px] font-medium text-gray-800">
                No active programs found in the database.
              </p>
              <p className="text-[13px] text-gray-500 mt-1">
                Click <strong>+ New Program</strong> above or add programs in{" "}
                <strong>Admin Settings</strong> to assign one to this cohort.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {availablePrograms.map((prog, index) => {
                const isSelected =
                  Number(selectedProgramId) === Number(prog.id);
                const descriptionText =
                  prog.description?.trim() ||
                  (prog.status
                    ? `Status: ${prog.status}${prog.applicationUrl ? ` · ${prog.applicationUrl}` : ""}`
                    : "Active mentorship program.");
                return (
                  <div
                    key={prog.id}
                    onClick={() => setSelectedProgramId(Number(prog.id))}
                    className={`relative rounded-[14px] sm:rounded-[16px] p-4 sm:p-6 text-left cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "border-2 border-[#D98020] bg-[#FFFDF9] sm:bg-white shadow-sm"
                        : "border border-[#E5E7EB] bg-white hover:border-gray-300"
                    }`}
                  >
                    {/* Selected Checkmark Badge */}
                    {isSelected && (
                      <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-5 h-5 rounded-full bg-[#D98020] text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    <div className="flex sm:block items-start gap-3.5">
                      {/* Icon Box */}
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[10px] sm:rounded-[12px] flex items-center justify-center transition-colors shrink-0 ${
                          isSelected
                            ? "bg-[#FFF6EB] text-[#D98020]"
                            : "bg-[#F3F4F6] text-[#4B5563]"
                        }`}
                      >
                        {getProgramIcon(prog.name, index)}
                      </div>

                      {/* Title & Description */}
                      <div className="min-w-0 flex-1 pr-5 sm:pr-0">
                        <h3 className="text-[14.5px] sm:text-[15.5px] font-medium text-[#111928] font-sans sm:mt-5 mb-1 sm:mb-1.5 tracking-tight">
                          {prog.name}
                        </h3>
                        <p className="text-[12px] sm:text-[12.5px] text-[#6B7280] font-normal font-sans leading-relaxed">
                          {descriptionText}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 sm:flex items-center justify-end gap-2.5 sm:gap-3 px-5 sm:px-7 py-4 sm:py-5 border-t border-[#F3F4F6] bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 sm:px-6 py-2.5 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#374151] rounded-[10px] text-[13.5px] font-medium font-sans cursor-pointer transition-colors text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssignProgram}
            disabled={busy || !selectedProgramId}
            className="px-4 sm:px-6 py-2.5 bg-[#D98020] hover:bg-[#C27218] text-white rounded-[10px] text-[13.5px] font-medium font-sans cursor-pointer transition-colors shadow-sm disabled:opacity-60 inline-flex items-center justify-center gap-2 text-center"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{busy ? "Assigning..." : "Assign Program"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
