"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, MessageSquare, Check, Clock, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import { fetchMyMentor, fetchMentees } from "@/lib/services/users";
import { fetchAvailabilitySlots } from "@/lib/services/availability";
import { bookSession, bookSessionAtTime } from "@/lib/services/availability";
import { ApiState } from "@/components/shared/ApiUI";
import { errorMessage } from "@/lib/api";
interface BookSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  preselectedMentor?: string;
  preselectedMentee?: string;
  onSuccess?: () => void;
}

export function BookSessionModal({
  isOpen,
  onClose,
  title = "Book Session",
  preselectedMentor,
  preselectedMentee,
  onSuccess,
}: BookSessionModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedTime, setSelectedTime] = useState("02 : 00");
  const [date, setDate] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuthStore();
  const role = user?.role || "MENTEE";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { token } = useAuth();
  const [menteeId, setMenteeId] = useState(preselectedMentee || "");
  const requestLock = useRef(false);
  const [topic, setTopic] = useState("");
  const [sessionType, setSessionType] = useState("Mentorship");
  const [duration, setDuration] = useState("45m");
  const [description, setDescription] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const assigned = useApiResource(
    "booking-mentor",
    fetchMyMentor,
    isOpen && role === "MENTEE",
  );
  const mentorId = preselectedMentor || assigned.data?.mentor?.id;
  const mentees = useApiResource(
    "booking-mentees",
    fetchMentees,
    isOpen && role === "MENTOR" && !preselectedMentee,
  );
  const available = useApiResource(
    "booking-slots:" + mentorId,
    (auth) => fetchAvailabilitySlots(auth, String(mentorId)),
    isOpen && role === "MENTEE" && Boolean(mentorId),
  );
  const localDay = (value: string) => {
    const date = new Date(value);
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  };
  const dateSlots = (available.data?.data || []).filter(
    (slot) =>
      localDay(slot.starts_at) === date &&
      new Date(slot.starts_at).getTime() > Date.now(),
  );
  const slot = dateSlots.find((item) => item.id === selectedSlot);
  const figmaTimeSlots = [
    { label: "10 : 00", value: "10:00" },
    { label: "11 : 30", value: "11:30" },
    { label: "02 : 00", value: "14:00" },
    { label: "03 : 00", value: "15:00" },
    { label: "04 : 00", value: "16:00" },
    { label: "05 : 00", value: "17:00" },
  ];
  const resolvedMenteeTime =
    selectedTime && figmaTimeSlots.find((t) => t.label === selectedTime)
      ? figmaTimeSlots.find((t) => t.label === selectedTime)!.value
      : timeValue;
  const submit = async () => {
    if (!token || requestLock.current) return;
    if (role === "ADMIN") {
      setError("Please use a mentor account to book a mentorship session.");
      return;
    }
    if (
      role === "MENTEE" &&
      (!topic.trim() || (!slot && (!date || !resolvedMenteeTime || !mentorId)))
    ) {
      setError("Enter a topic and choose an available date and time.");
      return;
    }
    if (
      role === "MENTOR" &&
      (!topic.trim() ||
        !(preselectedMentee || menteeId) ||
        !date ||
        !timeValue ||
        new Date(`${date}T${timeValue}`).getTime() <= Date.now())
    ) {
      setError(
        "Choose a mentee, enter a topic, and select a future date and time.",
      );
      return;
    }
    requestLock.current = true;
    setBusy(true);
    setError(null);
    try {
      if (role === "MENTOR")
        await bookSessionAtTime(token, {
          topic: topic.trim(),
          description: description.trim(),
          session_type: "mentorship",
          date,
          time: timeValue,
          mentor_id: user!.id,
          mentee_id: preselectedMentee || menteeId,
        });
      else if (slot)
        await bookSession(token, {
          availability_slot_id: slot.id,
          title: topic.trim(),
          notes: description.trim(),
        });
      else
        await bookSessionAtTime(token, {
          topic: topic.trim(),
          description: description.trim(),
          session_type: "mentorship",
          date,
          time: resolvedMenteeTime,
          mentor_id: String(mentorId),
          mentee_id: user!.id,
        });
      window.dispatchEvent(new Event("sessions_updated"));
      // Best-effort session confirmation email to mentor and mentee
      try {
        const mentorEmail =
          role === "MENTOR" ? user?.email : assigned.data?.mentor?.email;
        const mentorName =
          role === "MENTOR"
            ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Mentor"
            : assigned.data?.mentor?.name || "Mentor";
        const selectedMenteeObj = mentees.data?.find(
          (m) => m.id === (preselectedMentee || menteeId),
        );
        const menteeEmail =
          role === "MENTEE" ? user?.email : selectedMenteeObj?.email;
        const menteeName =
          role === "MENTEE"
            ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Mentee"
            : selectedMenteeObj?.name || "Mentee";
        const scheduledAt = slot
          ? new Date(slot.starts_at).toLocaleString()
          : `${date} ${role === "MENTOR" ? timeValue : resolvedMenteeTime}`.trim();
        if (mentorEmail && menteeEmail) {
          void fetch("/api/sessions/notify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              mentorEmail,
              menteeEmail,
              mentorName,
              menteeName,
              sessionTitle: topic.trim(),
              scheduledAt,
            }),
          }).catch(() => {});
        }
      } catch {
        // Non-blocking email notification
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      setError(errorMessage(error));
      setSelectedSlot(null);
      if (role === "MENTEE") available.reload();
    } finally {
      requestLock.current = false;
      setBusy(false);
    }
  };
  useEffect(() => {
    if (isOpen) {
      setSelectedSlot(null);
      setDate("");
      setMenteeId(preselectedMentee || "");
      setTimeValue("");
      setTopic("");
      setDescription("");
      setError(null);
    }
  }, [isOpen, preselectedMentee]);
  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Book Session"
        className="relative w-full max-w-[640px] max-h-[90dvh] overflow-y-auto bg-white rounded-[16px] shadow-2xl flex flex-col pointer-events-auto"
      >
        {/* Header Section */}
        <div className="p-5 sm:p-8 pb-4 sm:pb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="h-10 w-10 border border-gray-200 rounded-[10px] flex items-center justify-center">
              <MessageSquare
                className="h-5 w-5 text-gray-700"
                strokeWidth={1.5}
              />
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <h2 className="text-[20px] font-medium text-gray-900 mb-1 font-heading">
            {title}
          </h2>
          <p className="text-[14px] text-gray-500 font-sans">
            Pick a time that leaves room for what comes after.
          </p>
        </div>

        <div className="px-5 sm:px-8">
          <ApiState {...assigned} onRetry={assigned.reload} />
          <ApiState {...available} onRetry={available.reload} />
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          {role === "ADMIN" && (
            <p className="text-sm text-gray-500">
              Please use a mentor account to book a mentorship session.
            </p>
          )}
        </div>
        {/* Form Body */}
        <div className="px-5 sm:px-8 pb-2 space-y-5">
          {role === "MENTOR" && !preselectedMentee && (
            <div>
              <ApiState {...mentees} onRetry={mentees.reload} />
              <label
                htmlFor="booking-mentee"
                className="block text-[13.5px] text-gray-600 mb-2"
              >
                Mentee
              </label>
              <select
                id="booking-mentee"
                value={menteeId}
                onChange={(e) => setMenteeId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-sm"
              >
                <option value="">Select a mentee</option>
                {mentees.data?.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Topic Input */}
          <div>
            <label
              htmlFor="field-ashboardsessionsBookSessionModaltsx-1"
              className="block text-[13.5px] text-gray-600 mb-2 font-sans"
            >
              Topic
            </label>
            <input
              id="field-ashboardsessionsBookSessionModaltsx-1"
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="What would you like to talk about?"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors font-sans"
            />
          </div>

          {/* Session Type Select */}
          <div>
            <label
              htmlFor="field-ashboardsessionsBookSessionModaltsx-2"
              className="block text-[13.5px] text-gray-600 mb-2 font-sans"
            >
              Session Type
            </label>
            <div className="relative">
              <select
                id="field-ashboardsessionsBookSessionModaltsx-2"
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-800 focus:outline-none focus:border-gray-300 transition-colors font-sans pr-10 cursor-pointer"
              >
                <option value="Workshop">Workshop</option>
                <option value="Class">Class</option>
                <option value="Cohort Gathering">Cohort Gathering</option>
                <option value="Training">Training</option>
                <option value="Mentorship">Mentorship</option>
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

          {/* Description Textarea */}
          <div>
            <label
              htmlFor="field-ashboardsessionsBookSessionModaltsx-3"
              className="block text-[13.5px] text-gray-600 mb-2 font-sans"
            >
              Description
            </label>
            <textarea
              id="field-ashboardsessionsBookSessionModaltsx-3"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Write here..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors font-sans resize-none"
            />
          </div>

          {role === "MENTOR" ? (
            <>
              {/* Time Input for Mentor */}
              <div>
                <label
                  htmlFor="field-ashboardsessionsBookSessionModaltsx-4"
                  className="block text-[13.5px] text-gray-600 mb-2 font-sans"
                >
                  Time
                </label>
                <div className="relative">
                  <input
                    id="field-ashboardsessionsBookSessionModaltsx-4"
                    type="time"
                    value={timeValue}
                    onChange={(e) => setTimeValue(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors font-sans pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:m-0 relative z-10 bg-transparent"
                  />
                  {!timeValue && (
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[14px] text-gray-400 font-sans z-0">
                      --:-- --
                    </div>
                  )}
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#DB911E] z-20">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Date & Duration Row for Mentor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Input */}
                <div>
                  <label
                    htmlFor="field-ashboardsessionsBookSessionModaltsx-5"
                    className="block text-[13.5px] text-gray-600 mb-2 font-sans"
                  >
                    Date
                  </label>
                  <div className="relative">
                    <input
                      id="field-ashboardsessionsBookSessionModaltsx-5"
                      type={date ? "date" : "text"}
                      placeholder="dd/mm/yy"
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = "text";
                      }}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors font-sans pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:m-0 relative z-10"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#DB911E] z-20">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Duration Input (Dropdown) */}
                <div>
                  <label
                    htmlFor="field-ashboardsessionsBookSessionModaltsx-6"
                    className="block text-[13.5px] text-gray-600 mb-2 font-sans"
                  >
                    Duration
                  </label>
                  <div className="relative">
                    <select
                      id="field-ashboardsessionsBookSessionModaltsx-6"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-800 focus:outline-none focus:border-gray-300 transition-colors font-sans pr-10 cursor-pointer"
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
            </>
          ) : (
            <>
              {/* Date & Duration Row for Mentee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Input */}
                <div>
                  <label
                    htmlFor="field-ashboardsessionsBookSessionModaltsx-7"
                    className="block text-[13.5px] text-gray-600 mb-2 font-sans"
                  >
                    Date
                  </label>
                  <div className="relative">
                    <input
                      id="field-ashboardsessionsBookSessionModaltsx-7"
                      ref={dateInputRef}
                      value={date}
                      onChange={(event) => {
                        setDate(event.target.value);
                        setSelectedSlot(null);
                      }}
                      type="date"
                      onClick={(e) => {
                        try {
                          e.currentTarget.showPicker();
                        } catch (err) {}
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors font-sans pr-10 [&::-webkit-calendar-picker-indicator]:hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          dateInputRef.current?.showPicker();
                        } catch (err) {}
                      }}
                      className="absolute inset-y-0 right-3 flex items-center text-[#DB911E] hover:text-[#BA7815]"
                    >
                      <Calendar
                        className="h-[18px] w-[18px]"
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>
                </div>

                {/* Duration Input */}
                <div>
                  <label
                    htmlFor="field-ashboardsessionsBookSessionModaltsx-8"
                    className="block text-[13.5px] text-gray-600 mb-2 font-sans"
                  >
                    Duration
                  </label>
                  <div className="relative">
                    <select
                      id="field-ashboardsessionsBookSessionModaltsx-8"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-800 focus:outline-none focus:border-gray-300 transition-colors font-sans pr-10 cursor-pointer"
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

              {/* Time Slots for Mentee */}
              <div>
                <label className="block text-[13.5px] text-gray-600 mb-2 font-sans">
                  Time
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {dateSlots.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedSlot(item.id)}
                      className={
                        "relative flex flex-col items-center justify-center min-w-[76px] h-[40px] rounded-[8px] text-[13px] font-medium transition-colors border " +
                        (selectedSlot === item.id
                          ? "bg-[#DB911E] border-[#DB911E] text-white"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")
                      }
                    >
                      <span>
                        {new Date(item.starts_at).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {selectedSlot === item.id && (
                        <Check className="h-3 w-3" strokeWidth={3} />
                      )}
                    </button>
                  ))}
                  {dateSlots.length === 0 &&
                    figmaTimeSlots.map((item) => {
                      const isSelected = selectedTime === item.label;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setSelectedSlot(null);
                            setSelectedTime(item.label);
                          }}
                          className={
                            "relative flex flex-col items-center justify-center min-w-[88px] h-[36px] rounded-[8px] text-[13px] font-medium transition-colors border " +
                            (isSelected
                              ? "bg-[#DB911E] border-[#DB911E] text-white"
                              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")
                          }
                        >
                          <span>{item.label}</span>
                          {isSelected && (
                            <Check className="h-3 w-3" strokeWidth={3} />
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-8 pt-5 sm:pt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-[8px] text-[14px] font-medium transition-colors font-sans"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy || role === "ADMIN"}
            className="disabled:opacity-50 px-6 py-2.5 bg-[#DB911E] text-white hover:bg-[#BA7815] rounded-[8px] text-[14px] font-medium transition-colors flex items-center gap-2 font-sans"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Booking...</span>
              </>
            ) : (
              "Book Session"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
