"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import {
  deleteGoalCategory,
  fetchGoalCategories,
  updateGoalCategory,
} from "@/lib/services/goals";
import { errorMessage } from "@/lib/api";
import type { GoalCategory } from "@/types";
import { AddGoalCategoryModal } from "./AddGoalCategoryModal";
import {
  ApiState,
  FormError,
  Modal,
  buttonClass,
  secondaryClass,
} from "@/components/shared/ApiUI";

export function GoalCategoryManager() {
  const { token } = useAuth();
  const categories = useApiResource("settings-goal-categories", (auth) =>
    fetchGoalCategories(auth, true),
  );
  const [editor, setEditor] = useState<{ category?: GoalCategory } | null>(
    null,
  );
  const [deactivating, setDeactivating] = useState<GoalCategory | null>(null);
  const [deleting, setDeleting] = useState<GoalCategory | null>(null);
  const [deletedIds, setDeletedIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem("admin_deleted_goal_categories");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const changeActive = async (category: GoalCategory, active: boolean) => {
    if (!token || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (active)
        await updateGoalCategory(token, category.id, { is_active: true });
      else await deleteGoalCategory(token, category.id);
      setDeactivating(null);
      setNotice(active ? "Category reactivated." : "Category deactivated.");
      categories.reload();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  const confirmDelete = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (!token || !deleting || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      await deleteGoalCategory(token, deleting.id, true);
      const targetId = deleting.id;
      const targetName = deleting.name || deleting.description;
      const updated = [...deletedIds, targetId];
      setDeletedIds(updated);
      try {
        localStorage.setItem(
          "admin_deleted_goal_categories",
          JSON.stringify(updated),
        );
      } catch {}
      setDeleting(null);
      setNotice(`Category “${targetName}” deleted.`);
      categories.reload();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  const visibleCategories = (categories.data || []).filter(
    (category) => !deletedIds.includes(category.id),
  );
  return (
    <section
      aria-label="Goal categories"
      className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-[16px] font-medium text-[#111928]">
            Goal categories
          </h2>
          <p className="text-[12px] text-gray-500 mt-1">
            Manage the choices available when adding a goal.
          </p>
        </div>
        <button
          type="button"
          className={buttonClass}
          disabled={busy}
          onClick={() => {
            setError(null);
            setNotice(null);
            setEditor({});
          }}
        >
          Add category
        </button>
      </div>
      <ApiState {...categories} onRetry={categories.reload} />
      {!deactivating && <FormError message={error} />}
      {notice && (
        <p role="status" className="mb-3 text-sm text-emerald-800">
          {notice}
        </p>
      )}
      {visibleCategories.length === 0 && (
        <p className="py-5 text-sm text-gray-500">No goal categories yet.</p>
      )}
      <div className="divide-y divide-gray-100">
        {visibleCategories.map((category) => (
          <div
            key={category.id}
            className="flex flex-wrap items-center justify-between gap-3 py-4"
            aria-label={`Category ${category.name || category.description}`}
          >
            <div className="min-w-0">
              <p className="font-medium text-sm text-gray-900">
                {category.name || category.description}
              </p>
              {category.details && (
                <p className="text-xs text-gray-500 mt-1 break-words">
                  {category.details}
                </p>
              )}
              <span
                className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${category.isActive ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-600"}`}
              >
                {category.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={secondaryClass}
                disabled={busy}
                onClick={() => {
                  setError(null);
                  setNotice(null);
                  setEditor({ category });
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className={secondaryClass}
                disabled={busy}
                onClick={() => {
                  setError(null);
                  setNotice(null);
                  if (category.isActive) setDeactivating(category);
                  else void changeActive(category, true);
                }}
              >
                {category.isActive ? "Deactivate" : "Reactivate"}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors disabled:opacity-50 cursor-pointer"
                disabled={busy}
                onClick={() => {
                  setError(null);
                  setNotice(null);
                  setDeleting(category);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <AddGoalCategoryModal
        isOpen={Boolean(editor)}
        category={editor?.category}
        onClose={() => setEditor(null)}
        onAdd={() => {
          setNotice(editor?.category ? "Category updated." : "Category added.");
          categories.reload();
        }}
      />
      {deactivating && (
        <Modal
          title="Deactivate category"
          busy={busy}
          onClose={() => {
            setDeactivating(null);
            setError(null);
          }}
        >
          <p className="text-sm text-gray-600 mb-4">
            Deactivate “{deactivating.name || deactivating.description}”? It
            will no longer be offered for new goals. This does not remove
            existing goals.
          </p>
          <FormError message={error} />
          <div className="flex flex-wrap justify-end gap-3 mt-6">
            <button
              type="button"
              className={secondaryClass}
              disabled={busy}
              onClick={() => {
                setDeactivating(null);
                setError(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className={buttonClass}
              disabled={busy}
              onClick={() => void changeActive(deactivating, false)}
            >
              {busy ? "Deactivating…" : "Confirm deactivation"}
            </button>
          </div>
        </Modal>
      )}
      {deleting && (
        <Modal
          title="Delete Goal Category"
          busy={busy}
          onClose={() => {
            setDeleting(null);
            setError(null);
          }}
        >
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete “{deleting.name || deleting.description}”? It
            will be removed from the list and no longer offered for new goals.
          </p>
          <FormError message={error} />
          <div className="flex flex-wrap justify-end gap-3 mt-6">
            <button
              type="button"
              className={secondaryClass}
              disabled={busy}
              onClick={() => {
                setDeleting(null);
                setError(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
              disabled={busy}
              onClick={confirmDelete}
            >
              {busy ? "Deleting…" : "Delete Category"}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
