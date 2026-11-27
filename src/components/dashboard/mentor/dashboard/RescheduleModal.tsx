"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, Clock, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { rescheduleSession } from "@/lib/services/sessions";
import { errorMessage } from "@/lib/api";

interface RescheduleModalProps {
  isOpen: boolean;
  sessionId?: string | number | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RescheduleModal({
  isOpen,
  sessionId,
  onClose,
  onSuccess,
}: RescheduleModalProps) {
  const { token } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setDate("");
      setTime("");
      setNote("");
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleSend = async () => {
    if (!token || !sessionId) {
      setError("Please select a session to reschedule.");
      return;
    }
    if (!date) {
      setError("Please select a proposed date.");
      return;
    }
    if (!time) {
      setError("Please enter a proposed time (e.g. 14:00).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await rescheduleSession(token, sessionId, {
        proposed_date: date,
        proposed_time: time,
        note: note.trim() || undefined,
      });
      setSuccess(true);
      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="w-full max-w-[480px] bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-7">
          <div className="flex justify-between items-start mb-5">
            <div className="h-[42px] w-[42px] flex items-center justify-center rounded-[10px] border border-gray-200 shadow-sm">
              <Clock className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
            </div>
            <button
              onClick={onClose}
              disabled={busy}
              className="text-gray-400 hover:text-gray-600 transition-colors mt-1 mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-[18px] font-medium text-gray-900 font-heading mb-1.5">
            Reschedule Request
          </h2>
          <p className="text-[13px] text-gray-500 font-sans mb-6">
            Propose alternative date and time for this meeting.
          </p>

          {error && (
            <p role="alert" className="mb-4 text-sm text-red-600 font-sans">
              {error}
            </p>
          )}

          {success && (
            <div className="mb-4 p-2.5 bg-green-50 border border-green-200 text-green-700 rounded-[8px] text-[13px] flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" /> Reschedule proposal
              sent successfully!
            </div>
          )}

          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5">
                <label
                  htmlFor="field-rdmentordashboardRescheduleModaltsx-1"
                  className="text-[13px] font-medium text-gray-700 font-sans"
                >
                  Proposed Date
                </label>
                <div className="relative">
                  <input
                    id="field-rdmentordashboardRescheduleModaltsx-1"
                    type={date ? "date" : "text"}
                    placeholder="dd/mm/yy"
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = "text";
                    }}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-11 pl-3.5 pr-10 py-2 text-[13px] border border-gray-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#DB911E]/20 focus:border-[#DB911E] font-sans bg-white text-gray-900 relative z-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:m-0"
                  />
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-[#DB911E] z-20">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-1.5">
                <label
                  htmlFor="field-rdmentordashboardRescheduleModaltsx-2"
                  className="text-[13px] font-medium text-gray-700 font-sans"
                >
                  Proposed Time
                </label>
                <div className="relative">
                  <input
                    id="field-rdmentordashboardRescheduleModaltsx-2"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full h-11 px-3.5 py-2 text-[13px] border border-gray-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#DB911E]/20 focus:border-[#DB911E] bg-white font-sans text-gray-700"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="field-rdmentordashboardRescheduleModaltsx-3"
                className="text-[13px] font-medium text-gray-700 font-sans"
              >
                Note
              </label>
              <textarea
                id="field-rdmentordashboardRescheduleModaltsx-3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Let the participant know why you're rescheduling..."
                className="w-full h-28 px-3.5 py-3 text-[13px] border border-gray-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#DB911E]/20 focus:border-[#DB911E] placeholder:text-gray-400 resize-none font-sans text-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="px-7 py-5 flex justify-end gap-3 bg-white mt-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-6 py-2.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-[8px] hover:bg-gray-50 transition-colors font-sans shadow-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={busy || !date || !time}
            className="disabled:opacity-50 px-6 py-2.5 text-[13px] font-medium text-white bg-[#DB911E] hover:bg-[#BA7815] rounded-[8px] transition-colors font-sans shadow-sm cursor-pointer inline-flex items-center gap-2"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              "Send Proposal"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
