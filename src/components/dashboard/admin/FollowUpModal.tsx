import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAuthStore } from "@/store/useAuthStore";
import { createFollowUp } from "@/lib/services/engagement";
import { messageAdminUser } from "@/lib/services/admin";
import { errorMessage } from "@/lib/api";

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantId?: string;
  participantName: string;
  issue: string;
  lastActivity?: string;
}

export function FollowUpModal({
  isOpen,
  onClose,
  participantId,
  participantName,
  issue,
  lastActivity,
}: FollowUpModalProps) {
  const { token } = useAuth();
  const user = useAuthStore((state) => state.user);
  const currentAdminName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim() + " (Admin)"
    : "Admin";
  const [isMounted, setIsMounted] = useState(false);
  const [action, setAction] = useState("Email Check-in");
  const [owner, setOwner] = useState(currentAdminName);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setNote("");
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen || !isMounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !note.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (participantId) {
        await messageAdminUser(token, participantId, {
          body: note.trim(),
          title: action,
        });
      } else {
        await createFollowUp(token, {
          user_id: participantId,
          body: note.trim(),
          title: action,
        });
      }
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-[640px] bg-white rounded-[16px] shadow-2xl flex flex-col pointer-events-auto my-8">
        {/* Header Section */}
        <div className="p-8 pb-6">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-[19px] sm:text-[20px] font-medium text-[#111928] font-sans">
              Follow up with {participantName}
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-[14px] text-gray-500 font-sans">
            {issue}
            {lastActivity ? ` · last activity ${lastActivity}` : ""}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 pb-2 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-[13px] rounded-[8px] border border-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 text-green-700 text-[13px] rounded-[8px] border border-green-200">
                Follow-up sent successfully!
              </div>
            )}

            {/* Action Select */}
            <div>
              <label
                htmlFor="field-followup-action"
                className="block text-[13.5px] text-[#475569] mb-2 font-sans font-medium"
              >
                Action
              </label>
              <div className="relative">
                <select
                  id="field-followup-action"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-900 focus:outline-none focus:border-gray-300 transition-colors font-sans pr-10 cursor-pointer"
                >
                  <option value="Email Check-in">Email Check-in</option>
                  <option value="Direct Message">Direct Message</option>
                  <option value="Schedule Meeting">Schedule Meeting</option>
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

            {/* Owner & Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Owner Input */}
              <div>
                <label
                  htmlFor="field-followup-owner"
                  className="block text-[13.5px] text-[#475569] mb-2 font-sans font-medium"
                >
                  Owner
                </label>
                <div className="relative">
                  <select
                    id="field-followup-owner"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-900 focus:outline-none focus:border-gray-300 transition-colors font-sans pr-10 cursor-pointer"
                  >
                    <option value={currentAdminName}>{currentAdminName}</option>
                    <option value="Executive Team (Admin)">Executive Team (Admin)</option>
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

              {/* Date Input */}
              <div>
                <label
                  htmlFor="field-followup-date"
                  className="block text-[13.5px] text-[#475569] mb-2 font-sans font-medium"
                >
                  Date
                </label>
                <div className="relative">
                  <input
                    id="field-followup-date"
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
                      } catch {}
                    }}
                    className="absolute inset-y-0 right-3 flex items-center text-[#DB911E] hover:text-[#BA7815] z-20 pointer-events-auto"
                  >
                    <Calendar className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* Note Textarea */}
            <div>
              <label
                htmlFor="field-followup-note"
                className="block text-[13.5px] text-[#475569] mb-2 font-sans font-medium"
              >
                Note
              </label>
              <textarea
                id="field-followup-note"
                placeholder="Why are you following up...."
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[8px] text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors font-sans resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 pt-6 flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-[8px] text-[14px] font-medium transition-colors font-sans disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !note.trim()}
              className="px-6 py-2.5 bg-[#DB911E] text-white hover:bg-[#BA7815] rounded-[8px] text-[14px] font-medium transition-colors flex items-center gap-2 font-sans shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? "Sending..." : "Send Follow-up"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
