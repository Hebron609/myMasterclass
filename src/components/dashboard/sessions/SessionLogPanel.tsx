"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { logSession } from "@/lib/services/sessions";
import { errorMessage } from "@/lib/api";
import type { Session } from "@/types";
import {
  Field,
  FormError,
  buttonClass,
  inputClass,
} from "@/components/shared/ApiUI";

export function SessionLogPanel({
  session,
  onSaved,
  onBusyChange,
}: {
  session: Session;
  onSaved: (session: Session) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const { token, userRole } = useAuth();
  const [summary, setSummary] = useState(session.sessionSummary || "");
  const [actions, setActions] = useState(session.actionPoints || "");
  const [followUp, setFollowUp] = useState(session.followUpNotes || "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    setSummary(session.sessionSummary || "");
    setActions(session.actionPoints || "");
    setFollowUp(session.followUpNotes || "");
  }, [
    session.id,
    session.sessionSummary,
    session.actionPoints,
    session.followUpNotes,
  ]);
  if (userRole !== "MENTOR")
    return session.sessionSummary ||
      session.actionPoints ||
      session.followUpNotes ? (
      <section className="mb-5 space-y-3">
        <h3 className="font-medium text-gray-900">Session notes</h3>
        {[
          ["Discussion summary", session.sessionSummary],
          ["Action points", session.actionPoints],
          ["Follow-up notes", session.followUpNotes],
        ]
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <h4 className="text-xs font-medium text-gray-600">{label}</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {value}
              </p>
            </div>
          ))}
      </section>
    ) : null;
  if (session.status === "cancelled")
    return (
      <p className="mb-5 text-sm text-gray-500">
        This session was cancelled. Completion notes cannot be saved here.
      </p>
    );
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || lock.current) return;
    lock.current = true;
    setBusy(true);
    onBusyChange(true);
    setError(null);
    try {
      const updated = await logSession(token, session.id, {
        discussion_summary: summary.trim(),
        action_points: actions.trim(),
        follow_up_notes: followUp.trim(),
        status: "completed",
      });
      onSaved(updated);
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
      onBusyChange(false);
    }
  };
  return (
    <section className="mb-5 pt-5 border-t border-gray-100">
      <h3 className="font-medium text-gray-900 mb-2">Session notes</h3>
      <p className="text-xs text-gray-500 mb-4">
        {session.status === "completed"
          ? "Update the saved notes for this completed session."
          : "Saving these notes also marks this session completed."}
      </p>
      <form onSubmit={save} className="space-y-4">
        <FormError message={error} />
        <fieldset disabled={busy} className="space-y-4">
          <Field label="Discussion summary">
            <textarea
              className={inputClass}
              rows={3}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </Field>
          <Field label="Action points">
            <textarea
              className={inputClass}
              rows={2}
              value={actions}
              onChange={(event) => setActions(event.target.value)}
            />
          </Field>
          <Field label="Follow-up notes">
            <textarea
              className={inputClass}
              rows={2}
              value={followUp}
              onChange={(event) => setFollowUp(event.target.value)}
            />
          </Field>
          <button
            type="submit"
            className={`${buttonClass} inline-flex items-center gap-2`}
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving…</span>
              </>
            ) : session.status === "completed" ? (
              "Save notes"
            ) : (
              "Save notes & mark completed"
            )}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
