"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown, CheckCircle2, Loader2 } from "lucide-react";

interface AddSessionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sessionName: string, duration: string, description?: string) => void;
}

export function AddSessionTypeModal({ isOpen, onClose, onAdd }: AddSessionTypeModalProps) {
  const [sessionName, setSessionName] = useState("");
  const [duration, setDuration] = useState("30 min");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSessionName("");
      setDuration("30 min");
      setDescription("");
      setSuccessBanner(null);
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleSubmit = async () => {
    if (!sessionName.trim()) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSuccessBanner(`Added "${sessionName.trim()}" to session types!`);
      setTimeout(() => {
        onAdd(sessionName.trim(), duration, description.trim());
        onClose();
      }, 800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-[540px] w-full shadow-2xl border border-gray-100 relative animate-in zoom-in-95 duration-200 font-rubik flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header with Divider Line per UI mockup */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <h2 className="text-[22px] font-bold text-[#1F2937] font-dm-sans">
            Add Session Type
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-5">
          {successBanner && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[8px] flex items-center gap-2.5 text-[13px] font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successBanner}</span>
            </div>
          )}

          {/* Session Name */}
          <div>
            <label
              htmlFor="session-name-input"
              className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2"
            >
              Session Name
            </label>
            <input
              id="session-name-input"
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Session type name..."
              autoFocus
              className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-[15px] text-[#1F2937] placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all font-rubik"
            />
          </div>

          {/* Default Duration */}
          <div>
            <label
              htmlFor="default-duration-select"
              className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2"
            >
              Default Duration
            </label>
            <div className="relative">
              <select
                id="default-duration-select"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-[15px] text-[#4B5563] appearance-none outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all cursor-pointer font-rubik"
              >
                <option value="15 min">15 min</option>
                <option value="30 min">30 min</option>
                <option value="45 min">45 min</option>
                <option value="60 min">60 min</option>
                <option value="90 min">90 min</option>
                <option value="120 min">120 min</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4B5563] pointer-events-none" size={18} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="session-description-input"
              className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2"
            >
              Description
            </label>
            <textarea
              id="session-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-[15px] text-[#1F2937] placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all font-rubik resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] bg-white hover:bg-gray-50 transition-colors font-rubik"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!sessionName.trim() || isSubmitting}
              className="px-6 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-rubik"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Adding...</span>
                </>
              ) : (
                "Add Session"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
