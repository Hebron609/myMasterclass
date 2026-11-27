"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createCohort } from "@/lib/services/cohorts";

interface CreateCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void> | void;
}

export function CreateCohortModal({ isOpen, onClose, onSuccess }: CreateCohortModalProps) {
  const { token } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Authentication required.");
      return;
    }
    if (!name.trim() || !startDate) {
      setError("Please provide a cohort name and start date.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      await createCohort(token, {
        name: name.trim(),
        start_date: startDate,
        end_date: endDate || startDate,
      });

      // Clear form
      setName("");
      setStartDate("");
      setEndDate("");
      setDescription("");

      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.warn("Error creating cohort:", err);
      setError(err.message || "Failed to create cohort. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <h2 className="text-[22px] font-bold text-[#1F2937] font-dm-sans">
            Create New Cohort
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-[8px] text-sm font-rubik">
              {error}
            </div>
          )}

          {/* Cohort Name */}
          <div>
            <label htmlFor="cohort-name" className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2">
              Cohort Name <span className="text-red-500">*</span>
            </label>
            <input
              id="cohort-name"
              type="text"
              required
              placeholder="e.g., Cohort 2025A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-[15px] text-[#1F2937] font-rubik outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                id="start-date"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-[15px] text-[#1F2937] font-rubik outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2">
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-[15px] text-[#1F2937] font-rubik outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Optional description..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-[15px] text-[#1F2937] font-rubik outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all resize-none placeholder:text-gray-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5 border border-[#D1D5DB] rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-colors font-rubik disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim() || !startDate}
              className="px-6 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors font-rubik disabled:bg-gray-400 flex items-center gap-2 shadow-sm"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating...</span>
                </>
              ) : (
                "Create Cohort"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
