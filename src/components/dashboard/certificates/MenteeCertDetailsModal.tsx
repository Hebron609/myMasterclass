"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import {
  fetchCertificate,
  endorseCertificate,
} from "@/lib/services/certificates";
import { errorMessage } from "@/lib/api";
import { ApiState } from "@/components/shared/ApiUI";
import { X, UserCircle, CheckSquare, Square, Loader2 } from "lucide-react";

interface MenteeCertDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentee: {
    id: string;
    name: string;
    certificate: string;
  } | null;
}

export default function MenteeCertDetailsModal({
  isOpen,
  onClose,
  mentee,
}: MenteeCertDetailsModalProps) {
  const { token } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [notes, setNotes] = useState("");
  const [endorsing, setEndorsing] = useState(false);
  const [endorsed, setEndorsed] = useState(false);
  const [endorseError, setEndorseError] = useState<string | null>(null);
  const resource = useApiResource(
    `mentor-certificate:${mentee?.id}`,
    (token) => fetchCertificate(token, mentee!.id),
    isOpen && Boolean(mentee),
  );
  const criteria = resource.data?.criteria || [];
  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    if (isOpen) {
      setNotes("");
      setEndorsing(false);
      setEndorsed(false);
      setEndorseError(null);
    }
  }, [isOpen]);

  if (!isOpen || !isMounted || !mentee) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-[24px] font-medium text-[#333333] font-dm-sans leading-tight">
              Certificate — {mentee.certificate}
            </h2>
            <p className="text-[14px] text-gray-500 font-rubik mt-1">
              Mentee certificate details and criteria progress
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mentee Identity Card */}
        <div className="px-8 mt-2 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F2F4F8] rounded-full flex items-center justify-center flex-shrink-0">
              <UserCircle className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h3 className="text-[18px] font-medium text-[#333333] font-dm-sans">
                {mentee.name}
              </h3>
              <p className="text-[14px] text-gray-500 font-rubik">
                {mentee.certificate}
              </p>
            </div>
          </div>
        </div>

        <ApiState {...resource} onRetry={resource.reload} />
        {/* Content Section */}
        <div className="px-8 py-2 overflow-y-auto flex-1">
          {/* Criteria Checklist Card */}
          <div className="border border-[#E5E7EB]/60 rounded-2xl bg-white p-8 mb-8 shadow-sm">
            <h3 className="text-[20px] font-medium text-[#003F3A] font-dm-sans mb-6">
              Criteria Checklist
            </h3>

            <div className="space-y-3">
              {!resource.loading && !resource.error && !criteria.length && (
                <p className="text-sm text-gray-500">
                  No criteria were provided.
                </p>
              )}
              {criteria.map((item, idx) => (
                <div
                  key={idx}

                  className="flex items-center gap-4 p-4 border border-[#E5E7EB]/50 rounded-xl bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {item.completed ? (
                      <div className="w-6 h-6 bg-[#333333] rounded-sm flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-[#D1D5DB] rounded-sm" />
                    )}
                  </div>
                  <span
                    className={`text-[16px] font-medium font-rubik ${!item.completed ? "font-bold text-[#333333]" : "text-[#6B7280]"}`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Area */}
          {endorseError && (
            <p role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {endorseError}
            </p>
          )}
          <div className="space-y-3 mb-6">
            <label
              htmlFor="field-rtificatesMenteeCertDetailsModaltsx-1"
              className="text-[14px] font-medium text-[#4B5563] font-rubik"
            >
              Endorse Notes (Optional)
            </label>
            <textarea
              id="field-rtificatesMenteeCertDetailsModaltsx-1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note about this mentee's performance..."
              rows={5}
              className="w-full px-4 py-4 bg-white border border-[#D5DCEB] rounded-xl text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all resize-none font-sans placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-8 py-3.5 border border-[#D5DCEB] text-[#4B5563] text-[15px] font-medium rounded-xl hover:bg-gray-50 transition-all font-sans cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            disabled={endorsing || endorsed}
            onClick={async () => {
              if (!token || endorsing || endorsed) return;
              setEndorsing(true);
              setEndorseError(null);
              try {
                await endorseCertificate(token, mentee.id, {
                  notes: notes.trim() || undefined,
                });
                setEndorsed(true);
                resource.reload();
                setTimeout(() => onClose(), 800);
              } catch (err) {
                setEndorseError(errorMessage(err));
              } finally {
                setEndorsing(false);
              }
            }}
            className="disabled:opacity-50 px-8 py-3.5 bg-[#333333] text-white text-[15px] font-medium rounded-xl hover:bg-[#222222] transition-all font-sans shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            {endorsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Endorsing...</span>
              </>
            ) : endorsed ? (
              "Endorsed"
            ) : (
              "Endorse Certificate"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
