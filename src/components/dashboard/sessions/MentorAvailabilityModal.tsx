"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import {
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  fetchAvailabilitySlots,
  type AvailabilitySlot,
} from "@/lib/services/availability";
import { errorMessage } from "@/lib/api";
import {
  ApiState,
  Field,
  FormError,
  Modal,
  buttonClass,
  formatDateTime,
  inputClass,
  secondaryClass,
} from "@/components/shared/ApiUI";

export function MentorAvailabilityModal({ onClose }: { onClose: () => void }) {
  const { token, userRole } = useAuth();
  const slots = useApiResource(
    "mentor-availability",
    fetchAvailabilitySlots,
    userRole === "MENTOR",
  );
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const duration =
    (new Date(end).getTime() - new Date(start).getTime()) / 60000;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (userRole !== "MENTOR") return null;
  const publish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || lock.current) return;
    setError(null);
    setNotice(null);
    const from = new Date(start),
      to = new Date(end);
    if (
      !start ||
      !end ||
      !Number.isFinite(duration) ||
      duration <= 0 ||
      !Number.isInteger(duration)
    ) {
      setError("Choose a start and end time. The end must be after the start.");
      return;
    }
    if (from.getTime() <= Date.now()) {
      setError("Choose a future start time.");
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      await createAvailabilitySlot(token, {
        starts_at: from.toISOString(),
        ends_at: to.toISOString(),
        duration_minutes: duration,
      });
      setStart("");
      setEnd("");
      setNotice("Availability published.");
      slots.reload();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const remove = async (slot: AvailabilitySlot) => {
    if (!token || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await deleteAvailabilitySlot(token, slot.id);
      setRemoving(null);
      setNotice("Availability removed.");
      slots.reload();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <Modal title="Manage availability" onClose={onClose} busy={busy}>
      <p className="text-sm text-gray-500 mb-5">
        Publish times your assigned mentees can book. Times are shown in{" "}
        {timezone}.
      </p>
      <FormError message={error} />
      {notice && (
        <p role="status" className="my-3 text-sm text-emerald-800">
          {notice}
        </p>
      )}
      <form onSubmit={publish} className="space-y-4">
        <fieldset disabled={busy} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Start date and time">
              <input
                type="datetime-local"
                step={60}
                required
                className={inputClass}
                value={start}
                onChange={(event) => setStart(event.target.value)}
              />
            </Field>
            <Field label="End date and time">
              <input
                type="datetime-local"
                step={60}
                required
                className={inputClass}
                value={end}
                onChange={(event) => setEnd(event.target.value)}
              />
            </Field>
          </div>
          <p className="text-xs text-gray-500">
            Duration:{" "}
            {Number.isFinite(duration) && duration > 0
              ? `${duration} minutes`
              : "choose a start and end time"}
          </p>
          <button
            type="submit"
            className={`${buttonClass} inline-flex items-center gap-2`}
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving…</span>
              </>
            ) : (
              "Publish availability"
            )}
          </button>
        </fieldset>
      </form>
      <section
        className="mt-7 pt-5 border-t border-gray-100"
        aria-label="Published slots"
      >
        <h3 className="font-medium text-gray-900 mb-3">Published slots</h3>
        <ApiState {...slots} onRetry={slots.reload} />
        {slots.data?.data.length === 0 && (
          <p className="text-sm text-gray-500">
            No published availability yet.
          </p>
        )}
        <div className="divide-y divide-gray-100">
          {slots.data?.data
            .slice()
            .sort(
              (a, b) =>
                new Date(a.starts_at).getTime() -
                new Date(b.starts_at).getTime(),
            )
            .map((slot) => (
              <div
                key={slot.id}
                className="py-4 space-y-3"
                aria-label={`Slot ${formatDateTime(slot.starts_at)}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateTime(slot.starts_at)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Until {formatDateTime(slot.ends_at)}
                      {slot.status
                        ? ` · ${slot.status.replaceAll("_", " ")}`
                        : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={secondaryClass}
                    disabled={busy || slot.status === "booked"}
                    onClick={() => {
                      setRemoving(slot.id);
                      setError(null);
                    }}
                  >
                    Remove slot
                  </button>
                </div>
                {removing === slot.id && (
                  <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                    <p className="text-sm text-gray-700">
                      Remove this slot? Booked slots cannot be removed.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        type="button"
                        className={secondaryClass}
                        disabled={busy}
                        onClick={() => setRemoving(null)}
                      >
                        Cancel removal
                      </button>
                      <button
                        type="button"
                        className={buttonClass}
                        disabled={busy}
                        onClick={() => void remove(slot)}
                      >
                        Confirm removal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </section>
    </Modal>
  );
}
