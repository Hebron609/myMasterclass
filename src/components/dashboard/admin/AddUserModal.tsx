"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, EyeOff, X, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createAdminUser } from "@/lib/services/admin";
import { createFollowUp } from "@/lib/services/engagement";
import { errorMessage } from "@/lib/api";
import type { Cohort, Program, User } from "@/types";

const fieldClass =
  "w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-[10px] text-[14px] text-gray-900 outline-none focus:border-[#DB911E] transition-colors disabled:bg-gray-50 disabled:text-gray-500";
const labelClass = "block text-[13px] font-medium text-gray-700 mb-1.5";

export function AddUserModal({
  cohorts,
  programs,
  choicesLoading,
  choicesError,
  onClose,
  onCreated,
}: {
  cohorts: Cohort[];
  programs: Program[];
  choicesLoading: boolean;
  choicesError: boolean;
  onClose: () => void;
  onCreated: (user: User) => void;
}) {
  const { token } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"mentee" | "mentor">("mentee");
  const [cohortId, setCohortId] = useState("");
  const [programId, setProgramId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [note, setNote] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(false);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) closeRef.current();
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
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);

  const close = () => {
    if (!busyRef.current) onClose();
  };
  const selectedCohort = cohorts.find(
    (cohort) => String(cohort.id) === cohortId,
  );
  const selectedProgram =
    programId ||
    (selectedCohort?.programId ? String(selectedCohort.programId) : "");
  const availableCohorts = programId
    ? cohorts.filter((cohort) => String(cohort.programId) === programId)
    : cohorts;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busyRef.current) return;
    setError(null);
    if (!token) {
      setError("Please sign in again before adding a user.");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError("Enter the user's first and last name.");
      return;
    }
    if (password && password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    if (
      programId &&
      (!selectedCohort || String(selectedCohort.programId) !== programId)
    ) {
      setError("Select a cohort in this program, or choose No program.");
      return;
    }
    if (cohortId && !selectedCohort) {
      setError("Please select an available cohort.");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      const user = await createAdminUser(token, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        role,
        ...(password ? { password, password_confirmation: confirmation } : {}),
        journey_year: 1,
        ...(selectedCohort ? { cohort_id: selectedCohort.id } : {}),
      });
      if (note.trim() && user.id) {
        await createFollowUp(token, {
          user_id: String(user.id),
          title: "Onboarding Note",
          body: note.trim(),
        }).catch(() => {});
      }
      setPassword("");
      setConfirmation("");
      setNote("");
      onCreated(user);
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] min-h-screen w-screen flex items-center justify-center bg-black/40 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in"
      onClick={close}
    >
      <div
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-user-heading"
        aria-describedby="add-user-help"
        aria-busy={busy}
        className="bg-white rounded-[20px] w-full max-w-[500px] shadow-2xl border border-gray-100 p-6 sm:p-7 relative font-sans my-auto outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3
              id="add-user-heading"
              className="text-[19px] font-medium text-[#111928] tracking-tight"
            >
              Add a user
            </h3>
            <p id="add-user-help" className="text-[13px] text-[#6B7280] mt-0.5">
              Create their account with an email and password. Share the login
              details with them directly.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            aria-label="Close Add user"
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-[8px] text-[13px]"
          >
            {error}
          </p>
        )}
        <form onSubmit={submit}>
          <fieldset disabled={busy} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-user-first-name" className={labelClass}>
                  First name
                </label>
                <input
                  id="add-user-first-name"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="add-user-last-name" className={labelClass}>
                  Last name
                </label>
                <input
                  id="add-user-last-name"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  className={fieldClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="add-user-email" className={labelClass}>
                Email
              </label>
              <input
                id="add-user-email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className={fieldClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-user-role" className={labelClass}>
                  Role
                </label>
                <select
                  id="add-user-role"
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value as "mentee" | "mentor")
                  }
                  className={fieldClass}
                >
                  <option value="mentee">Mentee (Participant)</option>
                  <option value="mentor">Mentor</option>
                </select>
              </div>
              <div>
                <label htmlFor="add-user-cohort" className={labelClass}>
                  Cohort (optional)
                </label>
                <select
                  id="add-user-cohort"
                  value={cohortId}
                  disabled={choicesLoading}
                  onChange={(event) => setCohortId(event.target.value)}
                  className={fieldClass}
                >
                  <option value="">No cohort</option>
                  {availableCohorts.map((cohort) => (
                    <option key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="add-user-program" className={labelClass}>
                Program (optional)
              </label>
              <select
                id="add-user-program"
                value={selectedProgram}
                disabled={choicesLoading}
                onChange={(event) => {
                  setProgramId(event.target.value);
                  if (event.target.value !== String(selectedCohort?.programId))
                    setCohortId("");
                }}
                className={fieldClass}
              >
                <option value="">No program</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[12px] text-gray-500">
                A program is linked through the selected cohort.
              </p>
              {choicesError && (
                <p className="mt-1 text-[12px] text-amber-800">
                  Cohort or program choices could not load. You can add the user
                  without a cohort and assign one later.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="add-user-password" className={labelClass}>
                Password <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <div className="relative">
                <input
                  id="add-user-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  placeholder="Leave blank to auto-generate temporary password"
                  className={fieldClass + " pr-12"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-1 text-[12px] text-gray-500">
                If omitted, a temporary password will be auto-generated and displayed.
              </p>
            </div>
            {password ? (
              <div>
                <label htmlFor="add-user-confirm-password" className={labelClass}>
                  Confirm password
                </label>
                <input
                  id="add-user-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  minLength={8}
                  required={Boolean(password)}
                  className={fieldClass}
                />
              </div>
            ) : null}
            <div>
              <label htmlFor="add-user-note" className={labelClass}>
                Note (optional)
              </label>
              <textarea
                id="add-user-note"
                rows={2}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add an onboarding note or context for this user..."
                className={fieldClass}
              />
            </div>
            <div className="flex items-center justify-end gap-3 mt-6 pt-2">
              <button
                type="button"
                onClick={close}
                className="px-5 py-2 border border-[#E5E7EB] rounded-[8px] text-[13px] font-medium text-[#374151] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 bg-[#DB911E] hover:bg-[#BA7815] disabled:opacity-60 text-white rounded-[8px] text-[13px] font-medium transition-colors shadow-sm inline-flex items-center gap-2"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{busy ? "Adding user…" : "Add user"}</span>
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>,
    document.body,
  );
}
