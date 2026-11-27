"use client";
import { useEffect, useState } from "react";
import { Clock, CheckCircle2, Circle, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import {
  fetchGoals,
  fetchGoalCategories,
  createGoal,
  updateGoal,
  deleteGoal,
} from "@/lib/services/goals";
import { fetchMentees } from "@/lib/services/users";
import { errorMessage } from "@/lib/api";
import {
  ApiState,
  FormError,
  Field,
  Modal,
  inputClass,
  buttonClass,
  secondaryClass,
  cardClass,
  formatDate,
} from "@/components/shared/ApiUI";
import { StatsCardsSkeleton, GoalCardsSkeleton } from "@/components/shared/Skeletons";
import type { Goal, CreateGoalPayload } from "@/types";

const empty = {
  title: "",
  description: "",
  category: "",
  startDate: "",
  endDate: "",
  status: "not_started",
};
export default function GoalsPageContent({
  mentor = false,
}: {
  mentor?: boolean;
}) {
  const { token } = useAuth();
  const [selectedUser, setSelectedUser] = useState("");
  const mentees = useApiResource("goal-mentees", fetchMentees, mentor);
  const resource = useApiResource(
    `goals:${selectedUser}`,
    async (auth) => {
      const [goals, categories] = await Promise.all([
        fetchGoals(auth, mentor ? selectedUser : undefined),
        fetchGoalCategories(auth),
      ]);
      return { goals, categories };
    },
    !mentor || Boolean(selectedUser),
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (mentor) return;
    const add = () => {
      setEditing(null);
      setForm(empty);
      setError(null);
      setOpen(true);
    };
    window.addEventListener("open-new-goal-modal", add);
    return () => window.removeEventListener("open-new-goal-modal", add);
  }, [mentor]);
  const startEdit = (goal: Goal) => {
    setEditing(goal);
    setForm({
      title: goal.title,
      description: goal.description || "",
      category: String(goal.categoryId || ""),
      startDate: goal.startDate?.slice(0, 10) || "",
      endDate: goal.endDate?.slice(0, 10) || "",
      status: goal.status,
    });
    setError(null);
    setOpen(true);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || busy) return;
    if (form.endDate < form.startDate) {
      setError("The end date must be on or after the start date.");
      return;
    }
    setBusy(true);
    setError(null);
    const payload: CreateGoalPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      goal_category_id: Number(form.category),
      start_date: form.startDate,
      end_date: form.endDate,
      status: form.status,
    };
    try {
      if (editing) await updateGoal(token, editing.id, payload);
      else await createGoal(token, payload);
      setOpen(false);
      resource.reload();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id: number) => {
    if (!token || busy || !window.confirm("Delete this goal?")) return;
    setBusy(true);
    setError(null);
    try {
      await deleteGoal(token, id);
      resource.reload();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  const goals = resource.data?.goals || [];
  const categories = resource.data?.categories || [];
  return (
    <div className="space-y-6 pb-10">
      {mentor ? (
        <div className={cardClass}>
          <Field label="Mentee">
            <select
              className={inputClass}
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Choose an assigned mentee</option>
              {mentees.data?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </Field>
          <ApiState {...mentees} onRetry={mentees.reload} />
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            className={buttonClass}
            onClick={() => {
              setEditing(null);
              setForm(empty);
              setError(null);
              setOpen(true);
            }}
          >
            <Plus size={16} />
            New Goal
          </button>
        </div>
      )}
      <ApiState {...resource} onRetry={resource.reload} />
      {!open && <FormError message={error} />}
      {resource.loading ? (
        <div className="space-y-6">
          <StatsCardsSkeleton count={3} />
          <GoalCardsSkeleton count={3} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              ["in_progress", "In Progress"],
              ["completed", "Completed"],
              ["not_started", "Not Started"],
            ].map(([status, label]) => (
              <div key={status} className={cardClass}>
                <p className="mb-2 text-sm text-gray-500">{label}</p>
                <p className="text-3xl text-gray-900">
                  {resource.data
                    ? goals.filter((goal) => goal.status === status).length
                    : "—"}
                </p>
              </div>
            ))}
          </div>
          {resource.data && goals.length === 0 && (
            <p className="text-sm text-gray-500">No goals yet.</p>
          )}
          {goals.map((goal) => {
            const Icon =
              goal.status === "completed"
                ? CheckCircle2
                : goal.status === "in_progress"
                  ? Clock
                  : Circle;
            return (
              <div key={goal.id} className={cardClass}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <Icon className="mt-1 h-5 w-5 text-[#DB911E]" />
                    <div>
                      <h3 className="font-medium text-gray-900">{goal.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {categories.find(
                          (category) => category.id === goal.categoryId,
                        )?.description || goal.category}{" "}
                        · Due {formatDate(goal.endDate)}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#FBF7EE] px-3 py-1 text-xs text-[#9b6514]">
                    {goal.status.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm text-gray-600">
                  {goal.description}
                </p>
                {!mentor && (
                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      disabled={busy}
                      onClick={() => startEdit(goal)}
                      className={secondaryClass}
                    >
                      Edit Goal
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => void remove(goal.id)}
                      className="px-3 text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
      {open && (
        <Modal
          title={editing ? "Edit Goal" : "New Goal"}
          onClose={() => setOpen(false)}
          busy={busy}
        >
          <form onSubmit={save} className="space-y-5">
            <FormError message={error} />
            <Field label="Title">
              <input
                required
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Field>
            <Field label="Category">
              <select
                required
                className={inputClass}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select category</option>
                {categories
                  .filter(
                    (category) =>
                      category.isActive || category.id === editing?.categoryId,
                  )
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.description}
                    </option>
                  ))}
              </select>
            </Field>
            {!categories.length && (
              <p className="text-sm text-gray-500">
                Ask your administrator to create a goal category first.
              </p>
            )}
            <Field label="Description">
              <textarea
                required
                rows={3}
                className={inputClass}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start date">
                <input
                  type="date"
                  required
                  className={inputClass}
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </Field>
              <Field label="End date">
                <input
                  type="date"
                  min={form.startDate}
                  required
                  className={inputClass}
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="not_started">Not started</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </Field>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => setOpen(false)}
                className={secondaryClass}
              >
                Cancel
              </button>
              <button
                disabled={busy || !categories.length}
                className={buttonClass}
              >
                {busy ? "Saving…" : "Save Goal"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
