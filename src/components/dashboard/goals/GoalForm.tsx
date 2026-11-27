"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ChangeEvent } from "react";
import { X, Target, ChevronDown, Loader2 } from "lucide-react";
import { ApiState } from "@/components/shared/ApiUI";
import type { GoalCategory } from "@/types";

interface GoalFormData {
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  formData: GoalFormData;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onSave: () => void | Promise<void>;
  mode?: "create" | "edit";
  categories?: GoalCategory[];
  categoriesLoading?: boolean;
  categoryError?: string | null;
  onRetryCategories?: () => void;
  errors?: Record<string, string[]>;
}

export default function GoalForm({
  isOpen,
  onClose,
  formData,
  onChange,
  onSave,
  categories = [],
  categoriesLoading = false,
  categoryError = null,
  onRetryCategories,
  errors = {},
  mode = "create",
}: GoalFormProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dialog = useRef<HTMLDivElement>(null);
  const lock = useRef(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const close = () => {
    if (!lock.current) onClose();
  };
  const handleSaveClick = async () => {
    if (lock.current) return;
    lock.current = true;
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      lock.current = false;
      setIsSaving(false);
    }
  };
  useEffect(() => {
    if (!isOpen || !isMounted) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !lock.current) closeRef.current();
      if (event.key !== "Tab") return;
      const elements = dialog.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)",
      );
      if (!elements?.length) {
        event.preventDefault();
        return;
      }
      const first = elements[0],
        last = elements[elements.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === dialog.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === dialog.current)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [isOpen, isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) {
    return null;
  }

  const displayCategories = categories;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={close} />

      {/* Modal Content */}
      <div
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "edit" ? "Edit Goal" : "New Goal"}
        className="relative max-h-[90vh] overflow-y-auto outline-none w-full max-w-[600px] bg-white rounded-[16px] shadow-2xl flex flex-col pointer-events-auto"
      >
        {/* Header Section */}
        <div className="p-8 pb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="h-10 w-10 border border-gray-200 rounded-[10px] flex items-center justify-center">
              <Target className="h-5 w-5 text-gray-700" strokeWidth={1.5} />
            </div>
            <button
              onClick={close}
              disabled={isSaving}
              aria-label="Close goal"
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <h2 className="text-[20px] font-medium text-gray-900 mb-1">
            {mode === "edit" ? "Edit Goal" : "New Goal"}
          </h2>
          <p className="text-[14px] text-gray-500">
            {mode === "edit"
              ? "Update the details of this goal."
              : "Something you want to be quietly building toward."}
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSaveClick();
          }}
        >
          <fieldset disabled={isSaving}>
            {/* Form Body */}
            <div className="px-8 pb-2 space-y-5">
              {errors.general && (
                <div
                  role="alert"
                  className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm"
                >
                  {errors.general.join(", ")}
                </div>
              )}

              {/* Title Input */}
              <div>
                <label
                  htmlFor="goal-title"
                  className="block text-[14px] text-gray-600 mb-2"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="goal-title"
                  name="title"
                  value={formData.title}
                  onChange={onChange}
                  placeholder="e.g. Publish one essay a quarter"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.title.join(", ")}
                  </p>
                )}
              </div>

              <ApiState
                loading={categoriesLoading}
                error={categoryError}
                onRetry={onRetryCategories}
              />
              {!categoriesLoading &&
                !categoryError &&
                !displayCategories.length && (
                  <p className="text-sm text-gray-500">
                    No active categories. Ask your administrator to add a goal
                    category.
                  </p>
                )}
              {/* Category Select */}
              <div>
                <label
                  htmlFor="goal-category"
                  className="block text-[14px] text-gray-600 mb-2"
                >
                  Category
                </label>
                <div className="relative">
                  <select
                    id="goal-category"
                    name="category"
                    value={formData.category}
                    onChange={onChange}
                    className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-800 focus:outline-none focus:border-gray-300 transition-colors pr-10"
                  >
                    <option value="" disabled className="text-gray-400">
                      Select category
                    </option>
                    {displayCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name || cat.description}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.category.join(", ")}
                  </p>
                )}
              </div>

              {/* Additional Field (Description acting as the 2nd title from mockup) */}
              <div>
                <label
                  htmlFor="goal-description"
                  className="block text-[14px] text-gray-600 mb-2"
                >
                  Description<span className="text-gray-400">*</span>
                </label>
                <input
                  type="text"
                  id="goal-description"
                  name="description"
                  value={formData.description}
                  onChange={onChange}
                  placeholder="What is your description?"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 pt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={close}
                disabled={isSaving}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-[8px] text-[14px] font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || (mode === "create" && categoriesLoading)}
                className="px-6 py-2.5 bg-[#DB911E] text-white hover:bg-[#BA7815] rounded-[8px] text-[14px] font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : mode === "edit" ? (
                  "Save changes"
                ) : (
                  "Add Goal"
                )}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>,
    document.body,
  );
}
