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

  useEffect(() => {
    setMounted(true);
  }, []);

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
              onClick={onClose}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden text-left hover:shadow-md hover:border-gray-300 transition-all group"
            >
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
