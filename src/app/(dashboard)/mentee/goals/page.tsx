"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronDown,
  Search,
  Bell,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";
import GoalForm from "@/components/dashboard/goals/GoalForm";
import { useAuth } from "@/context/AuthContext";
import {
  fetchGoals,
  fetchGoalCategories,
  createGoal,
  updateGoal,
  deleteGoal,
} from "@/lib/services/goals";
import { useApiResource } from "@/hooks/useApiResource";
import {
  FormError,
  Modal,
  buttonClass,
  secondaryClass,
} from "@/components/shared/ApiUI";
import { errorMessage } from "@/lib/api";
import type { Goal } from "@/types";

export default function MenteeGoalsPage() {
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const resource = useApiResource("mentee-goals", fetchGoals);
  const categoryResource = useApiResource(
    "mentee-goal-categories",
    fetchGoalCategories,
  );
  const goals = resource.data || [];
  const isLoading = resource.loading;
  const error = resource.error;
  const [editing, setEditing] = useState<Goal | null>(null);
  const [removing, setRemoving] = useState<Goal | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const emptyForm = {
    title: "",
    category: "",
    startDate: "",
    endDate: "",
    description: "",
  };
  const [formData, setFormData] = useState(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const categories = (categoryResource.data || []).filter(
    (category) => category.isActive || category.id === editing?.categoryId,
  );
  if (
    editing?.categoryId !== undefined &&
    !categories.some((category) => category.id === editing.categoryId)
  )
    categories.push({
      id: editing.categoryId,
      name: editing.category,
      description: editing.category,
      isActive: false,
    });
  const openNew = useCallback(() => {
    if (lock.current) return;
    setEditing(null);
    setSaveError(null);
    setNotice(null);
    setFormData({
      title: "",
      category: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    setIsModalOpen(true);
    categoryResource.reload();
  }, [categoryResource.reload]);
  useEffect(() => {
    window.addEventListener("open-new-goal-modal", openNew);
    return () => window.removeEventListener("open-new-goal-modal", openNew);
  }, [openNew]);
  const openEdit = (goal: Goal) => {
    setEditing(goal);
    setSaveError(null);
    setNotice(null);
    setFormData({
      title: goal.title,
      description: goal.description || "",
      category: goal.categoryId !== undefined ? String(goal.categoryId) : "",
      startDate: goal.startDate || "",
      endDate: goal.endDate || "",
    });
    setIsModalOpen(true);
    categoryResource.reload();
  };
  const save = async () => {
    if (!token || lock.current) return;
    setSaveError(null);
    if (!formData.title.trim() || !formData.category) {
      setSaveError("Enter a title and choose a category.");
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      const fields = {
        title: formData.title.trim(),
        description: formData.description.trim(),
      };
      if (editing)
        await updateGoal(token, editing.id, {
          ...fields,
          ...(String(editing.categoryId) !== formData.category
            ? { goal_category_id: Number(formData.category) }
            : {}),
        });
      else
        await createGoal(token, {
          ...fields,
          goal_category_id: Number(formData.category),
          status: "not_started",
        });
      setIsModalOpen(false);
      setFormData(emptyForm);
      setNotice(editing ? "Goal updated." : "Goal added.");
      setEditing(null);
      resource.reload();
    } catch (failure) {
      setSaveError(errorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const changeStatus = async (goal: Goal, status: string) => {
    if (!token || lock.current || status === goal.status) return;
    lock.current = true;
    setBusy(true);
    setActionError(null);
    setNotice(null);
    try {
      await updateGoal(token, goal.id, { status });
      setNotice("Goal status updated.");
      resource.reload();
    } catch (failure) {
      setActionError(errorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!token || !removing || lock.current) return;
    lock.current = true;
    setBusy(true);
    setActionError(null);
    setNotice(null);
    try {
      await deleteGoal(token, removing.id);
      setRemoving(null);
      setNotice("Goal removed.");
      resource.reload();
    } catch (failure) {
      setActionError(errorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Completed":
        return {
          icon: CheckCircle2,
          iconColor: "text-[#47B378]",
          pillBg: "bg-[#47B378]/10",
          pillText: "text-[#47B378]",
        };
      case "Not Started":
        return {
          icon: Circle,
          iconColor: "text-[#8E8E8E]",
          pillBg: "bg-[#F8F7F5]",
          pillText: "text-[#8E8E8E]",
        };
      case "In Progress":
      default:
        return {
          icon: Clock,
          iconColor: "text-[#DB911E]",
          pillBg: "bg-[#DB911E]/10",
          pillText: "text-[#D2850D]",
        };
    }
  };

  return (
    <div className="w-full pb-10">
      {!removing && <FormError message={actionError} />}
      {notice && (
        <p role="status" className="mb-4 text-sm text-emerald-800">
          {notice}
        </p>
      )}
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-sm">
          <p className="text-[13px] text-gray-500 font-medium mb-1">
            In Progress
          </p>
          <p className="text-[28px] font-medium text-gray-900">
            {isLoading || error
              ? "—"
              : goals.filter((goal) => goal.status === "in_progress").length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-sm">
          <p className="text-[13px] text-gray-500 font-medium mb-1">
            Completed
          </p>
          <p className="text-[28px] font-medium text-gray-900">
            {isLoading || error
              ? "—"
              : goals.filter((goal) => goal.status === "completed").length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-sm">
          <p className="text-[13px] text-gray-500 font-medium mb-1">
            Not Started
          </p>
          <p className="text-[28px] font-medium text-gray-900">
            {isLoading || error
              ? "—"
              : goals.filter((goal) => goal.status === "not_started").length}
          </p>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {isLoading && <p className="text-sm text-gray-500">Loading goals...</p>}
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {!isLoading && !error && goals.length === 0 && (
          <p className="text-sm text-gray-500">No goals have been added yet.</p>
        )}
        {goals.map((goal) => {
          const status = goal.status.toLowerCase();
          const displayStatus =
            status === "completed"
              ? "Completed"
              : status === "in_progress"
                ? "In Progress"
                : "Not Started";
          const styles = getStatusStyles(displayStatus);
          const Icon = styles.icon;

          return (
            <div
              key={goal.id}
              role="article"
              aria-label={goal.title}
              className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#F8F7F5] flex items-center justify-center shrink-0">
                    <Icon className={`h-5 w-5 ${styles.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-medium text-gray-900 mb-1">
                      {goal.title}
                    </h3>
                    <p className="text-[13px] text-gray-500">
                      {goal.category} • Due {goal.endDate || "Ongoing"}
                    </p>
                  </div>
                </div>
                <select
                  aria-label={`Status for ${goal.title}`}
                  value={status}
                  disabled={busy}
                  onChange={(event) =>
                    void changeStatus(goal, event.target.value)
                  }
                  className={`max-w-[150px] px-2 py-1 text-[12px] font-medium rounded-full ${styles.pillBg} ${styles.pillText} disabled:opacity-50`}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-[13px] mb-2">
                  <span className="text-gray-500">Progress</span>
                  <span className="text-gray-500">
                    {status === "completed"
                      ? "100%"
                      : status === "not_started"
                        ? "0%"
                        : "50%"}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${status === "completed" ? "bg-[#8DB58D]" : status === "in_progress" ? "bg-[#DB911E]" : "bg-gray-200"}`}
                    style={{
                      width:
                        status === "completed"
                          ? "100%"
                          : status === "in_progress"
                            ? "50%"
                            : "0%",
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => openEdit(goal)}
                  aria-label={`Edit goal ${goal.title}`}
                  className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setRemoving(goal);
                    setActionError(null);
                  }}
                  aria-label={`Remove goal ${goal.title}`}
                  className="text-sm text-red-700 hover:text-red-900 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <GoalForm
        mode={editing ? "edit" : "create"}
        isOpen={isModalOpen}
        onClose={() => {
          if (!lock.current) setIsModalOpen(false);
        }}
        formData={formData}
        categories={categories}
        categoriesLoading={categoryResource.loading}
        categoryError={categoryResource.error}
        onRetryCategories={categoryResource.reload}
        errors={saveError ? { general: [saveError] } : {}}
        onChange={(event) => {
          setSaveError(null);
          setFormData({ ...formData, [event.target.name]: event.target.value });
        }}
        onSave={save}
      />
      {removing && (
        <Modal
          title="Remove goal"
          busy={busy}
          onClose={() => {
            setRemoving(null);
            setActionError(null);
          }}
        >
          <p className="mb-4 text-sm text-gray-600">
            Remove “{removing.title}”? This removes this goal from your list.
          </p>
          <FormError message={actionError} />
          <div className="flex justify-end gap-3 mt-5">
            <button
              type="button"
              className={secondaryClass}
              disabled={busy}
              onClick={() => {
                setRemoving(null);
                setActionError(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`${buttonClass} inline-flex items-center gap-2`}
              disabled={busy}
              onClick={() => void remove()}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Removing…</span>
                </>
              ) : (
                "Confirm removal"
              )}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
