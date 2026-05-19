"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Image } from "lucide-react";

interface Program {
  id: number;
  name: string;
  moduleLabel: string;
}

interface ProgramsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockPrograms: Program[] = [
  { id: 1, name: "Vision2325", moduleLabel: "Module 1" },
  { id: 2, name: "Program 3", moduleLabel: "Module 1" },
  { id: 3, name: "Program 4", moduleLabel: "Module 1" },
  { id: 4, name: "Program 5", moduleLabel: "Module 1" },
  { id: 5, name: "Program 6", moduleLabel: "Module 1" },
  { id: 6, name: "Program 7", moduleLabel: "Module 1" },
];

export function ProgramsModal({ isOpen, onClose }: ProgramsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = (programId: number) => {
    setSelectedId(programId);
    setTimeout(() => {
      setSelectedId(null);
      onClose();
    }, 800);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-7">
          <h2 className="text-[22px] font-bold text-gray-900 font-heading">
            Select Your Program
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Programs Grid */}
        <div className="px-8 pb-8 grid grid-cols-3 gap-5">
          {mockPrograms.map((program) => (
            <button
              key={program.id}
              onClick={() => handleSelect(program.id)}
              disabled={selectedId !== null}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden text-left hover:shadow-md hover:border-gray-300 transition-all group relative disabled:opacity-80"
            >
              {/* Loading Overlay */}
              {selectedId === program.id && (
                <div className="absolute inset-0 bg-[#003F3A]/5 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <svg className="animate-spin h-6 w-6 text-[#003F3A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}

              {/* Thumbnail */}
              <div className="bg-gray-100 flex flex-col items-center justify-center py-8 px-4 group-hover:bg-gray-200 transition-colors">
                <Image className="h-7 w-7 text-gray-400 mb-2" />
                <span className="text-[12px] text-gray-500 font-sans">
                  {program.moduleLabel}
                </span>
              </div>

              {/* Name */}
              <div className="px-4 py-3">
                <p className="text-[14px] font-bold text-gray-900 font-heading text-center">
                  {program.name}
                </p>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>,
    document.body
  );
}
