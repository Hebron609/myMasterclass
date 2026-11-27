"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Upload, CheckCircle2, Loader2, Plus } from "lucide-react";

interface AddUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "participant" | "mentor";
  onSuccess?: (count: number) => void;
}

interface SelectedItem {
  id: string;
  name: string;
  cohortOrFocus?: string;
}

export function AddUsersModal({
  isOpen,
  onClose,
  type,
  onSuccess,
}: AddUsersModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [cohortOrFocus, setCohortOrFocus] = useState("");
  const [selectedList, setSelectedList] = useState<SelectedItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize with mockup items when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setCohortOrFocus("");
      setSuccessBanner(null);
      if (type === "participant") {
        setSelectedList([
          { id: "1", name: "[New Participant 1]" },
          { id: "2", name: "[New Participant 2]" },
        ]);
      } else {
        setSelectedList([
          { id: "1", name: "[New Mentor 1]" },
          { id: "2", name: "[New Mentor 2]" },
        ]);
      }
    }
  }, [isOpen, type]);

  if (!mounted || !isOpen) return null;

  const handleAddItem = (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const newItem: SelectedItem = {
      id: Date.now().toString(),
      name: searchQuery.trim(),
      cohortOrFocus: cohortOrFocus.trim(),
    };

    setSelectedList((prev) => [...prev, newItem]);
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleRemove = (id: string) => {
    setSelectedList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate reading CSV entries
      const count = Math.floor(Math.random() * 3) + 2;
      const newItems: SelectedItem[] = [];
      for (let i = 1; i <= count; i++) {
        newItems.push({
          id: `${Date.now()}-${i}`,
          name: `[CSV Imported ${type === "participant" ? "Participant" : "Mentor"} ${i}]`,
        });
      }
      setSelectedList((prev) => [...prev, ...newItems]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (selectedList.length === 0) return;
    setIsSubmitting(true);

    try {
      // Simulate API call to register/invite users
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccessBanner(
        `Successfully added ${selectedList.length} ${type === "participant" ? "participants" : "mentors"}!`,
      );
      setTimeout(() => {
        if (onSuccess) onSuccess(selectedList.length);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-[600px] w-full shadow-2xl border border-gray-100 relative animate-in zoom-in-95 duration-200 font-rubik max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <h2 className="text-[22px] font-bold text-[#1F2937] font-dm-sans">
            {type === "participant" ? "Add Participants" : "Add Mentors"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-8">
          {successBanner && (
            <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[8px] flex items-center gap-2.5 text-[13px] font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successBanner}</span>
            </div>
          )}

          {/* Search & Add Field */}
          <div className="mb-5">
            <label
              htmlFor="field-nentsdashboardadminAddUsersModaltsx-1"
              className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2"
            >
              Search & Add
            </label>
            <div className="relative flex items-center gap-2">
              <input
                id="field-nentsdashboardadminAddUsersModaltsx-1"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by name..."
                className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-[8px] text-[14px] text-gray-800 placeholder-gray-400 outline-none focus:border-gray-500 transition-colors font-rubik"
              />
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => handleAddItem()}
                  className="absolute right-2 px-3 py-1.5 bg-[#333333] text-white rounded-[6px] text-xs font-medium hover:bg-[#1f1f1f] transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              )}
            </div>
          </div>

          {/* Cohort / Specialization Field */}
          <div className="mb-6">
            <label
              htmlFor="field-nentsdashboardadminAddUsersModaltsx-2"
              className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2"
            >
              {type === "participant" ? "Cohort" : "Specialization"}
            </label>
            <input
              id="field-nentsdashboardadminAddUsersModaltsx-2"
              type="text"
              value={cohortOrFocus}
              onChange={(e) => setCohortOrFocus(e.target.value)}
              placeholder={
                type === "participant"
                  ? "Name of their cohort"
                  : "e.g., Cloud & Tech Leadership"
              }
              className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-[8px] text-[14px] text-gray-800 placeholder-gray-400 outline-none focus:border-gray-500 transition-colors font-rubik"
            />
          </div>

          {/* Or Bulk Import Box */}
          <div className="mb-6">
            <label
              htmlFor="field-nentsdashboardadminAddUsersModaltsx-3"
              className="block text-[14px] font-bold text-[#4B5563] font-dm-sans mb-2"
            >
              Or Bulk Import
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-[#D1D5DB] rounded-[8px] py-8 px-4 flex flex-col items-center justify-center text-center bg-transparent hover:bg-gray-50/50 transition-colors cursor-pointer group"
            >
              <p className="text-[13px] font-medium text-[#4B5563] mb-3 font-rubik">
                Drop CSV file here or click to upload
              </p>
              <span className="px-4 py-1.5 border border-gray-300 rounded-[6px] text-[13px] font-medium bg-white text-gray-700 shadow-2xs group-hover:bg-gray-50 transition-colors inline-block font-rubik">
                Upload CSV
              </span>
              <input
                id="field-nentsdashboardadminAddUsersModaltsx-3"
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Selected List */}
          <div className="mb-4">
            <h3 className="text-[15px] font-bold text-[#4B5563] font-dm-sans mb-3">
              Selected ({selectedList.length})
            </h3>
            <div className="max-h-[180px] overflow-y-auto pr-1">
              {selectedList.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#F8F9FA] border border-gray-100 rounded-[8px] px-4 py-3 flex items-center justify-between text-[14px] text-[#4B5563] font-medium mb-2.5 transition-all"
                >
                  <span>{item.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="text-gray-400 hover:text-red-600 flex items-center gap-1 text-[13px] font-normal transition-colors"
                  >
                    <span className="text-base leading-none">×</span> Remove
                  </button>
                </div>
              ))}
              {selectedList.length === 0 && (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-[8px] text-gray-400 text-xs font-rubik">
                  No users selected yet. Use the search bar above or upload a
                  CSV file.
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-[8px] text-[14px] font-medium text-[#4B5563] bg-white hover:bg-gray-50 transition-colors font-rubik"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedList.length === 0 || isSubmitting}
              className="px-6 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-rubik"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Adding...</span>
                </>
              ) : (
                `Add ${selectedList.length} ${type === "participant" ? "Participants" : "Mentors"}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
