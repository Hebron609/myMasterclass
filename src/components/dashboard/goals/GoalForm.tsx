"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ChangeEvent } from "react";
import { X } from "lucide-react";

interface GoalFormData {
  title: string;
  category: string;
  targetDate: string;
  description: string;
}

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  formData: GoalFormData;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onSave: () => void;
}

export default function GoalForm({
  isOpen,
  onClose,
  formData,
  onChange,
  onSave,
}: GoalFormProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [milestones, setMilestones] = useState<string[]>(["", ""]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addMilestone = () => {
    setMilestones((prev) => [...prev, ""]);
  };

  const updateMilestone = (index: number, value: string) => {
    setMilestones((prev) => prev.map((m, i) => (i === index ? value : m)));
  };

  if (!isOpen || !isMounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-[24px] font-bold text-gray-900 font-heading mb-1.5">
              Create New Goal
            </h2>
            <p className="text-[15px] text-gray-600 font-sans">
              Set a new personal or professional development goal.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">

          {/* Goal Title */}
          <div>
            <label
              htmlFor="goal-title"
              className="block text-[15px] font-bold text-gray-600 mb-2 font-sans"
            >
              Goal Title
            </label>
            <input
              type="text"
              id="goal-title"
              name="title"
              value={formData.title}
              onChange={onChange}
              placeholder="Enter goal title..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors font-sans"
            />
          </div>

          {/* Category + Target Date */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="goal-category"
                className="block text-[15px] font-bold text-gray-600 mb-2 font-sans"
              >
                Category
              </label>
              <div className="relative">
                <select
                  id="goal-category"
                  name="category"
                  value={formData.category}
                  onChange={onChange}
                  className="w-full appearance-none px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-[15px] text-gray-500 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors font-sans pr-10"
                >
                  <option value="">Select Category</option>
                  <option value="career">Career</option>
                  <option value="personal">Personal</option>
                  <option value="education">Education</option>
                  <option value="health">Health</option>
                  <option value="finance">Finance</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="goal-targetDate"
                className="block text-[15px] font-bold text-gray-600 mb-2 font-sans"
              >
                Target Date
              </label>
              <input
                type="text"
                id="goal-targetDate"
                name="targetDate"
                value={formData.targetDate}
                onChange={onChange}
                placeholder="DD/MM/YYYY"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors font-sans"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="goal-description"
              className="block text-[15px] font-bold text-gray-600 mb-2 font-sans"
            >
              Description
            </label>
            <textarea
              id="goal-description"
              name="description"
              rows={5}
              value={formData.description}
              onChange={onChange}
              placeholder="Describe your goal in detail..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors resize-y font-sans"
            />
          </div>

          {/* Key Milestones */}
          <div>
            <label className="block text-[15px] font-bold text-gray-600 mb-3 font-sans">
              Key Milestones (Optional)
            </label>
            <div className="space-y-3">
              {milestones.map((milestone, index) => (
                <input
                  key={index}
                  type="text"
                  value={milestone}
                  onChange={(e) => updateMilestone(index, e.target.value)}
                  placeholder={`Milestone ${index + 1}...`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors font-sans"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addMilestone}
              className="mt-3 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-[14px] font-medium font-sans transition-colors"
            >
              + Add Milestone
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-[14px] font-medium font-sans transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-6 py-2.5 bg-[#333333] text-white hover:bg-[#222222] rounded-lg text-[14px] font-medium font-sans transition-colors"
          >
            Create Goal
          </button>
        </div>

      </div>
    </div>,
    document.body,
  );
}
