"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, Check, Loader2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import { fetchCohorts } from "@/lib/services/cohorts";
import { saveProgramSession } from "@/lib/services/program-sessions";
import { ApiState } from "@/components/shared/ApiUI";
import { errorMessage } from "@/lib/api";
interface InHouseSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InHouseSessionModal({
  isOpen,
  onClose,
}: InHouseSessionModalProps) {
  const { token } = useAuth();
  const cohorts = useApiResource("in-house-cohorts", fetchCohorts, isOpen);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [kind, setKind] = useState("workshop");
  const [cohortId, setCohortId] = useState("");
  const [duration, setDuration] = useState("45m");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!token || busy) return;
    if (!title.trim() || !date) {
      setError("Enter a title and date.");
      return;
    }
    const start = new Date(
      date + "T" + selectedTime.replaceAll(" ", "") + ":00",
    );
    if (Number.isNaN(start.getTime())) {
      setError("Choose a valid date and time.");
      return;
    }
    const minutes = parseInt(duration, 10);
    setBusy(true);
    setError(null);
    try {
      await saveProgramSession(token, {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        starts_at: start.toISOString(),
        ends_at: new Date(start.getTime() + minutes * 60000).toISOString(),
        duration_minutes: minutes,
        session_type: kind,
        status: "scheduled",
        cohort_id: cohortId ? Number(cohortId) : null,
      });
      window.dispatchEvent(new Event("sessions_updated"));
      onClose();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  const [isMounted, setIsMounted] = useState(false);
  const [selectedTime, setSelectedTime] = useState("02 : 00");
  const [date, setDate] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) return null;

  const timeSlots = [
    "10 : 00",
    "12 : 30",
    "02 : 00",
    "03 : 00",
    "04 : 00",
    "05 : 00",
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="In-house Session"
        className="relative w-full max-w-[640px] bg-white rounded-[16px] shadow-2xl flex flex-col pointer-events-auto my-8"
      >
        {/* Header Section */}
        <div className="p-8 pb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="h-10 w-10 border border-gray-200 rounded-[10px] flex items-center justify-center">
              <Calendar className="h-5 w-5 text-gray-700" strokeWidth={1.5} />
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <h2 className="text-[19px] sm:text-[20px] font-medium text-[#111928] mb-1 font-sans">
            In-house Session
          </h2>
          <p className="text-[14px] text-gray-500 font-sans">
            Pick a time that leaves room for all.
          </p>
        </div>

        <div className="px-8">
          <ApiState {...cohorts} onRetry={cohorts.reload} />
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
        {/* Form Body */}
        <div className="px-8 pb-2 space-y-5">
          {/* Session Title Input */}
          <div>
            <label
              htmlFor="field-ashboardadminInHouseSessionModaltsx-1"
              className="block text-[13.5px] text-[#475569] mb-2 font-sans font-medium"
            >
              Session Title
            </label>
            <input
              id="field-ashboardadminInHouseSessionModaltsx-1"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What is the session about?..."
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors font-sans"
            />
          </div>

          {/* Description Textarea */}
          <div>
            <label
              htmlFor="field-ashboardadminInHouseSessionModaltsx-2"
              className="block text-[13.5px] text-[#475569] mb-2 font-sans font-medium"
            >
              Description
            </label>
            <textarea
              id="field-ashboardadminInHouseSessionModaltsx-2"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Write here..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors font-sans resize-none"
            />
          </div>

          {/* Session Type Select */}
          <div>
            <label
              htmlFor="field-ashboardadminInHouseSessionModaltsx-3"
              className="block text-[13.5px] text-[#475569] mb-2 font-sans font-medium"
            >
              Session Type
            </label>
            <div className="relative">
              <select
                id="field-ashboardadminInHouseSessionModaltsx-3"
                className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-900 focus:outline-none focus:border-gray-300 transition-colors font-sans pr-10 cursor-pointer"
                value={kind}
                onChange={(event) => setKind(event.target.value)}
              >
                <option value="workshop">Workshop</option>
                <option value="class">Class</option>
                <option value="cohort_gathering">Cohort gathering</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Cohort (optional) */}
          <div>
            <label
              htmlFor="field-ashboardadminInHouseSessionModaltsx-4"
              className="block text-[13.5px] text-[#475569] mb-2 font-sans font-medium"
            >
              Cohort (optional)
            </label>
            <div className="relative">
              <select
                id="field-ashboardadminInHouseSessionModaltsx-4"
                className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-900 focus:outline-none focus:border-gray-300 transition-colors font-sans pr-10 cursor-pointer"
                value={cohortId}
                onChange={(event) => setCohortId(event.target.value)}
              >
                <option value="">All</option>
                {cohorts.data?.map((cohort) => (
                  <option key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Date & Duration Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Input */}
            <div>
              <label
                htmlFor="field-ashboardadminInHouseSessionModaltsx-5"
                className="block text-[13.5px] text-[#475569] mb-2 font-sans font-medium"
              >
                Date
              </label>
              <div className="relative">
                <input
                  id="field-ashboardadminInHouseSessionModaltsx-5"
                  ref={dateInputRef}
                  type={date ? "date" : "text"}
                  placeholder="dd/mm/yy"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = "text";
                  }}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors font-sans pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:m-0 relative z-10 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    try {
                      if (dateInputRef.current) {
                        dateInputRef.current.type = "date";
                        dateInputRef.current.showPicker();
                      }
                    } catch (err) {}
                  }}
                  className="absolute inset-y-0 right-3 flex items-center text-[#DB911E] hover:text-[#BA7815] z-20 pointer-events-auto"
                >
                  <Calendar className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Duration Input */}
            <div>
              <label
                htmlFor="field-ashboardadminInHouseSessionModaltsx-6"
                className="block text-[13.5px] text-[#475569] mb-2 font-sans font-medium"
              >
                Duration
              </label>
              <div className="relative">
                <select
                  id="field-ashboardadminInHouseSessionModaltsx-6"
                  className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-900 focus:outline-none focus:border-gray-300 transition-colors font-sans pr-10 cursor-pointer"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                >
                  <option value="15m">15m</option>
                  <option value="30m">30m</option>
                  <option value="45m">45m</option>
                  <option value="60m">60m</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-[13.5px] text-[#475569] mb-2 font-sans font-medium">
              Time
            </label>
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-3">
              {timeSlots.map((t, idx) => {
                const isSelected = selectedTime === t;
                const isDisabled = t === "05 : 00";
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setSelectedTime(t)}
                    className={`relative flex flex-col items-center justify-center min-w-[76px] h-[40px] rounded-[8px] text-[13px] font-medium transition-colors border ${
                      isSelected
                        ? "bg-[#DB911E] border-[#DB911E] text-white shadow-sm"
                        : isDisabled
                          ? "bg-white border-gray-100 text-gray-200 cursor-not-allowed"
                          : "bg-white border-gray-200 text-[#475569] hover:border-gray-300"
                    }`}
                  >
                    <span className={isSelected ? "-mb-0.5" : ""}>{t}</span>
                    {isSelected && (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meeting/location details Input */}
          <div>
            <label
              htmlFor="field-ashboardadminInHouseSessionModaltsx-7"
              className="block text-[13.5px] text-[#475569] mb-2 font-sans font-medium"
            >
              Meeting/location details
            </label>
            <input
              id="field-ashboardadminInHouseSessionModaltsx-7"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Where is this meeting happening?..."
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors font-sans"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-8 flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-6 py-2.5 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 rounded-[8px] text-[14px] font-medium transition-colors font-sans"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="px-6 py-2.5 bg-[#DB911E] text-white hover:bg-[#BA7815] disabled:opacity-60 rounded-[8px] text-[14px] font-medium transition-colors flex items-center gap-2 font-sans shadow-sm"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{busy ? "Scheduling..." : "Schedule Gathering"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
