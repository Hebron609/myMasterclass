"use client";

import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { usePageLoading } from "@/context/PageLoadingContext";
import { useAuth } from "@/context/AuthContext";
import { fetchMentorships, createMentorship } from "@/lib/services/mentorships";
import type { Mentorship } from "@/types";
import {
  fetchAdminUsers,
  assignMentor,
  reassignMentor,
} from "@/lib/services/admin";

interface ParticipantItem {
  id: string;
  name: string;
  email: string;
  cohort: string;
  focus: string;
}

interface MentorItem {
  id: string;
  name: string;
  title: string;
  expertise: string;
  capacity: string;
}

const SAMPLE_PARTICIPANTS: ParticipantItem[] = [];

const SAMPLE_MENTORS: MentorItem[] = [];

export function MentorAssignmentTool() {
  const { token } = useAuth();

  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [mentors, setMentors] = useState<MentorItem[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);

  usePageLoading(isLoadingUsers);
  const [selectedParticipantId, setSelectedParticipantId] =
    useState<string>("");
  const [selectedMentorId, setSelectedMentorId] = useState<string>("");

  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedParticipant = participants.find(
    (p) => p.id === selectedParticipantId,
  );
  const selectedMentor = mentors.find((m) => m.id === selectedMentorId);

  const loadMentorships = async () => {
    if (!token) return;
    try {
      await fetchMentorships(token);
    } catch (err) {
      console.warn("Failed to load mentorships:", err);
    }
  };

  const loadUsers = async () => {
    if (!token) return;
    setIsLoadingUsers(true);
    setErrorMessage(null);
    try {
      const users = await fetchAdminUsers(token);
      setParticipants(
        users
          .filter((user) => user.role === "mentee")
          .map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            cohort: "—",
            focus: "—",
          })),
      );
      setMentors(
        users
          .filter((user) => user.role === "mentor")
          .map((user) => ({
            id: user.id,
            name: user.name,
            title: "Mentor",
            expertise: user.expertise || "—",
            capacity: "—",
          })),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load accounts.",
      );
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadMentorships();
    loadUsers();
  }, [token]);

  const handleConfirmAssignment = async () => {
    if (!token || !selectedParticipant || !selectedMentor || isAssigning)
      return;
    setIsAssigning(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const users = await fetchAdminUsers(token, { role: "mentee" });
      const relationships = await fetchMentorships(token);
      const active = relationships.find(
        (relationship) =>
          relationship.isActive &&
          relationship.menteeId === selectedParticipant.id,
      );
      const mentee = {
        ...users.find((user) => user.id === selectedParticipant.id),
        mentorId: active?.mentorId,
      };
      if (mentee?.mentorId === selectedMentor.id) {
        setErrorMessage("This mentor is already assigned.");
        return;
      }
      await (mentee?.mentorId ? reassignMentor : assignMentor)(token, {
        mentee_id: selectedParticipant.id,
        mentor_id: selectedMentor.id,
      });
      setSuccessMessage("Mentor assignment saved.");
      await loadUsers();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not save the assignment.",
      );
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="bg-[#FCEFC680] border border-[#F0E6D2] rounded-[16px] p-8 shadow-sm">
      <h2 className="text-[18px] font-bold text-[#4B5563] font-dm-sans mb-6 border-b border-[#F0E6D2] pb-4">
        Mentor Assignment
      </h2>

      {/* Alert Messages */}
      {successMessage && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[8px] flex items-center justify-between text-[13px] font-rubik animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-emerald-700 hover:underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-[8px] flex items-center justify-between text-[13px] font-rubik animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-red-700 hover:underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-8">
        <div className="w-full max-w-[480px] bg-[#FCF9F0] border border-[#E5D8BC] rounded-[12px] p-5 shadow-sm">
          <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans mb-3">
            Select Participant
          </p>

          <select
            value={selectedParticipantId}
            onChange={(e) => setSelectedParticipantId(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] text-[#4B5563] mb-4 cursor-pointer outline-none focus:border-gray-400 font-rubik"
          >
            <option value="">Choose participant...</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.cohort})
              </option>
            ))}
          </select>

          {selectedParticipant ? (
            <div className="h-[80px] bg-white border border-[#D1C5AA] rounded-[8px] px-3.5 py-2.5 flex flex-col justify-center text-left animate-in fade-in duration-200 shadow-sm">
              <p className="text-[13px] font-bold text-[#1F2937] truncate">
                {selectedParticipant.name}
              </p>
              <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                {selectedParticipant.focus}
              </p>
              <span className="inline-block mt-1 text-[10px] font-medium bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded w-max">
                {selectedParticipant.cohort}
              </span>
            </div>
          ) : (
            <div className="h-[80px] border border-dashed border-[#D1C5AA] rounded-[8px] flex items-center justify-center text-[13px] text-[#8C836F]">
              No participant selected
            </div>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div className="w-12 h-10 bg-[#333333] rounded-[8px] flex items-center justify-center text-white mb-2 shadow-sm">
            <ArrowRight size={20} />
          </div>
          <span className="text-[13px] font-medium text-[#4B5563]">
            Assign To
          </span>
        </div>

        <div className="w-full max-w-[480px] bg-[#FCF9F0] border border-[#E5D8BC] rounded-[12px] p-5 shadow-sm">
          <p className="text-[14px] font-bold text-[#4B5563] font-dm-sans mb-3">
            Select Mentor
          </p>

          <select
            value={selectedMentorId}
            onChange={(e) => setSelectedMentorId(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] text-[#4B5563] mb-4 cursor-pointer outline-none focus:border-gray-400 font-rubik"
          >
            <option value="">Choose mentor...</option>
            {mentors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.expertise})
              </option>
            ))}
          </select>

          {selectedMentor ? (
            <div className="h-[80px] bg-white border border-[#D1C5AA] rounded-[8px] px-3.5 py-2.5 flex flex-col justify-center text-left animate-in fade-in duration-200 shadow-sm">
              <p className="text-[13px] font-bold text-[#1F2937] truncate">
                {selectedMentor.name}
              </p>
              <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                {selectedMentor.title}
              </p>
              <span className="inline-block mt-1 text-[10px] font-medium bg-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded w-max">
                {selectedMentor.capacity}
              </span>
            </div>
          ) : (
            <div className="h-[80px] border border-dashed border-[#D1C5AA] rounded-[8px] flex items-center justify-center text-[13px] text-[#8C836F]">
              No mentor selected
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          disabled={!selectedParticipant || !selectedMentor || isAssigning}
          onClick={handleConfirmAssignment}
          className="bg-[#333333] text-white px-6 py-2.5 rounded-[8px] text-[14px] font-medium hover:bg-[#1f1f1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
        >
          {isAssigning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Assigning...</span>
            </>
          ) : (
            "Confirm Assignment"
          )}
        </button>
      </div>
    </div>
  );
}
