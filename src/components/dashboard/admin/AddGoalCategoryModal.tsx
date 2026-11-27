"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createGoalCategory, updateGoalCategory } from "@/lib/services/goals";
import { errorMessage } from "@/lib/api";
import type { GoalCategory } from "@/types";
import {
  Field,
  FormError,
  Modal,
  buttonClass,
  inputClass,
  secondaryClass,
} from "@/components/shared/ApiUI";

interface AddGoalCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (categoryName: string) => void;
  category?: GoalCategory;
}

export function AddGoalCategoryModal({
  isOpen,
  onClose,
  onAdd,
  category,
}: AddGoalCategoryModalProps) {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    if (isOpen) {
      setName(category?.name || category?.description || "");
      setDescription(category?.details || "");
      setError(null);
    }
  }, [isOpen, category]);
  if (!isOpen) return null;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || lock.current) return;
    if (!name.trim()) {
      setError("Enter a category name.");
      return;
    }
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      const payload = { name: name.trim(), description: description.trim() };
      if (category) await updateGoalCategory(token, category.id, payload);
      else await createGoalCategory(token, { ...payload, is_active: true });
      onAdd(payload.name);
      onClose();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <Modal
      title={category ? "Edit Goal Category" : "Add Goal Category"}
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={submit} className="space-y-5">
        <FormError message={error} />
        <fieldset disabled={busy} className="space-y-5">
          <Field label="Category name">
            <input
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Field>
          <Field label="Description (optional)">
            <textarea
              className={inputClass}
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button type="button" className={secondaryClass} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={buttonClass}>
              {busy ? "Saving…" : category ? "Save changes" : "Add category"}
            </button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
