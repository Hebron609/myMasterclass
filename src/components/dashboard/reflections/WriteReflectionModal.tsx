"use client";

import { X, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { useAuth } from "@/context/AuthContext";
import { createReflection } from "@/lib/services/reflections";
import { errorMessage } from "@/lib/api";
export interface ReflectionRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  snippet: string;
  content: string;
  tags: string[];
  mentorResponded: boolean;
}

interface WriteReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newReflection: ReflectionRecord) => void;
}

export function WriteReflectionModal({
  isOpen,
  onClose,
  onSuccess,
}: WriteReflectionModalProps) {
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [mood, setMood] = useState<string>("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setSelectedType("");
      setMood("");
      setContent("");
      setTags("");
      setSuccessBanner(null);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async () => {
    if (!token || isSubmitting || !title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const saved = await createReflection(token, {
        title: title.trim(),
        body: content.trim(),
        reflected_at: new Date().toISOString().slice(0, 10),
        ...(mood ? { mood } : {}),
        ...(selectedType ? { type: selectedType } : {}),
        ...(parsedTags.length > 0 ? { tags: parsedTags } : {}),
      });
      onSuccess?.({
        id: String(saved.id),
        title: saved.title,
        type: saved.type || selectedType || "Free-form",
        date: saved.createdAt,
        snippet: saved.content,
        content: saved.content,
        tags: saved.tags || parsedTags,
        mentorResponded: false,
      });
      window.dispatchEvent(new Event("reflection_updated"));
      onClose();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Write Reflection"
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 relative animate-in zoom-in-95 duration-200 font-rubik flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-[22px] font-medium text-[#1F2937] font-dm-sans">
              Write Reflection
            </h2>
            <p className="text-[14px] text-[#6B7280] font-rubik mt-0.5">
              Document your journey, insights, and growth.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <p role="alert" className="px-8 text-sm text-red-600">
            {error}
          </p>
        )}
        {/* Form Body */}
        <div className="p-8 space-y-5 overflow-y-auto">
          {successBanner && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[8px] flex items-center gap-2.5 text-[13px] font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successBanner}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="reflection-title-input"
              className="block text-[14px] font-medium text-[#4B5563] font-dm-sans mb-2"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="reflection-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your reflection a title..."
              autoFocus
              className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-[15px] text-[#1F2937] placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all font-rubik"
            />
          </div>

          {/* Mood */}
          <div>
            <label className="block text-[14px] font-medium text-[#4B5563] font-dm-sans mb-2">
              Current Mood
            </label>
            <div className="flex flex-wrap gap-2.5">
              {["Clear", "Steady", "Hopeful", "Tired", "Proud"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood((curr) => (curr === m ? "" : m))}
                  className={`px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer ${
                    mood === m
                      ? "border-2 border-[#111827] bg-[#111827] text-white shadow-xs"
                      : "border border-[#D1D5DB] bg-white text-[#6B7280] hover:bg-gray-50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Reflection Type */}
          <div>
            <label className="block text-[14px] font-medium text-[#4B5563] font-dm-sans mb-2">
              Reflection Type
            </label>
            <div className="flex flex-wrap gap-2.5">
              {["Monthly", "Session", "Goals", "Free-form"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setSelectedType((curr) => (curr === type ? "" : type))
                  }
                  className={`px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer ${
                    selectedType === type
                      ? "border-2 border-[#333333] bg-gray-50 text-[#1F2937] shadow-2xs"
                      : "border border-[#D1D5DB] bg-white text-[#6B7280] hover:bg-gray-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="reflection-content-input"
              className="block text-[14px] font-medium text-[#4B5563] font-dm-sans mb-2"
            >
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reflection-content-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you learn? How did you grow? What challenges did you face?"
              rows={5}
              className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-[15px] text-[#1F2937] placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all font-rubik resize-y"
            />
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="reflection-tags-input"
              className="block text-[14px] font-medium text-[#4B5563] font-dm-sans mb-2"
            >
              Tags
            </label>
            <input
              id="reflection-tags-input"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Add tags, comma separated (e.g., Leadership, Communication)"
              className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-[10px] text-[15px] text-[#1F2937] placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all font-rubik"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-[#4B5563] bg-white hover:bg-gray-50 rounded-[8px] text-[14px] font-medium font-rubik transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || isSubmitting}
            className="px-6 py-2.5 bg-[#333333] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-rubik"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Logging...</span>
              </>
            ) : (
              "Log Reflection"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
