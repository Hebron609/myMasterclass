"use client";

import { useState, useEffect } from "react";
import { Lock, MessageSquare, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

import { useAuth } from "@/context/AuthContext";
import { useApiResource } from "@/hooks/useApiResource";
import { fetchMentees } from "@/lib/services/users";
import {
  fetchReflections,
  createReflection,
  submitReflectionFeedback,
} from "@/lib/services/reflections";
import { ApiState, formatDate } from "@/components/shared/ApiUI";
import { ReflectionsSkeleton, QuietParticipantsSkeleton } from "@/components/shared/Skeletons";
import { errorMessage } from "@/lib/api";
export default function ReflectionsPageContent() {
  const { token } = useAuth();
  const [selectedUser, setSelectedUser] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMood, setActiveMood] = useState("");
  const [activeType, setActiveType] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const { user } = useAuthStore();
  const role = user?.role || "MENTEE";
  const mentees = useApiResource(
    "reflection-mentees",
    fetchMentees,
    role === "MENTOR",
  );
  const resource = useApiResource(
    "reflection-thread:" + selectedUser,
    (auth) =>
      fetchReflections(auth, role === "MENTOR" ? selectedUser : undefined),
    role !== "MENTOR" || Boolean(selectedUser),
  );
  const selected = mentees.data?.find((user) => user.id === selectedUser);
  useEffect(() => {
    if (role === "MENTOR" && !selectedUser && mentees.data?.length) {
      setSelectedUser(mentees.data[0].id);
    }
  }, [role, selectedUser, mentees.data]);
  useEffect(() => {
    const reload = () => resource.reload();
    window.addEventListener("reflection_updated", reload);
    return () => window.removeEventListener("reflection_updated", reload);
  }, [resource.reload]);
  const [replyingToId, setReplyingToId] = useState<string | number | null>(
    null,
  );
  const [feedbackInput, setFeedbackInput] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [mentorNote, setMentorNote] = useState("");
  const [mentorNoteBusy, setMentorNoteBusy] = useState(false);

  const handleSendMentorReflection = async () => {
    if (!token || !mentorNote.trim() || mentorNoteBusy) return;
    setMentorNoteBusy(true);
    setError(null);
    try {
      const targetReflection =
        resource.data?.find((item) => !item.mentorFeedbackText) ||
        resource.data?.[0];
      if (targetReflection) {
        await submitReflectionFeedback(
          token,
          targetReflection.id,
          mentorNote.trim(),
        );
      } else {
        await createReflection(token, {
          title: mentorNote.trim().split("\n")[0].slice(0, 100),
          body: mentorNote.trim(),
          reflected_at: new Date().toISOString().slice(0, 10),
        });
      }
      setMentorNote("");
      setFeedbackSuccess(
        `Reflection note sent to ${selected?.name || "mentee"}.`,
      );
      resource.reload();
      setTimeout(() => setFeedbackSuccess(null), 3000);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setMentorNoteBusy(false);
    }
  };

  const handleSendFeedback = async (id: string | number) => {
    if (!token || !feedbackInput.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await submitReflectionFeedback(token, id, feedbackInput.trim());
      setFeedbackInput("");
      setReplyingToId(null);
      setFeedbackSuccess("Feedback submitted successfully.");
      resource.reload();
      setTimeout(() => setFeedbackSuccess(null), 3000);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    if (!token || busy || !body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const parsedTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await createReflection(token, {
        title: body.trim().split("\n")[0].slice(0, 100),
        body: body.trim(),
        reflected_at: new Date().toISOString().slice(0, 10),
        ...(activeMood ? { mood: activeMood } : {}),
        ...(activeType ? { type: activeType } : {}),
        ...(parsedTags.length > 0 ? { tags: parsedTags } : {}),
      });
      setBody("");
      setActiveMood("");
      setActiveType("");
      setTagsInput("");
      resource.reload();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  const thread = (
    <>
      <ApiState {...resource} onRetry={resource.reload} />
      {feedbackSuccess && (
        <p
          role="status"
          className="p-3 bg-green-50 border border-green-200 text-green-750 text-sm rounded-xl mb-4"
        >
          {feedbackSuccess}
        </p>
      )}
      {resource.loading ? (
        <ReflectionsSkeleton count={3} />
      ) : (
        <>
          {resource.data?.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-[16px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-wrap items-center gap-2 text-[13.5px] font-sans">
                  <span className="font-medium text-gray-900">
                    {role === "MENTOR"
                      ? selected?.name
                      : [user?.firstName, user?.lastName].filter(Boolean).join(" ")}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-500">
                    {formatDate(item.createdAt)}
                  </span>
                  {item.mood && (
                    <span className="ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FEF9E1] text-[#9b6514] border border-[#F3E7BE]">
                      Mood: {item.mood}
                    </span>
                  )}
                  {item.type && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F1F5F9] text-[#475569]">
                      {item.type}
                    </span>
                  )}
                </div>
                <span className="px-3 py-1 bg-[#EEF1F9] text-[#334155] rounded-full text-[11px] font-medium font-sans">
                  From Mentee
                </span>
              </div>
              <p className="text-[14.5px] text-gray-800 font-sans leading-relaxed mb-4 whitespace-pre-wrap">
                {item.content}
              </p>
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={`${tag}-${idx}`}
                      className="px-2.5 py-0.5 bg-[#F8F9FA] border border-gray-100 rounded-full text-[11px] text-gray-500 font-medium font-sans"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {item.mentorFeedbackText && (
                <div className="bg-[#F8F7F5] rounded-[12px] p-5">
                  <div className="flex items-center gap-2 mb-3 text-[#DB911E]">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-[13px] font-medium font-sans">
                      Mentor’s Response
                    </span>
                  </div>
                  <p className="text-[14px] text-gray-800 font-sans leading-relaxed">
                    {item.mentorFeedbackText}
                  </p>
                </div>
              )}
              {role === "MENTOR" && !item.mentorFeedbackText && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {replyingToId === item.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        placeholder="Write mentor feedback and insights for this reflection..."
                        className="w-full h-24 p-3 bg-[#F9FAFB] border border-gray-200 rounded-[10px] text-[13.5px] font-sans focus:outline-none focus:border-[#DB911E]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToId(null);
                            setFeedbackInput("");
                          }}
                          className="px-4 py-1.5 border border-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={busy || !feedbackInput.trim()}
                          onClick={() => handleSendFeedback(item.id)}
                          className="px-4 py-1.5 bg-[#DB911E] text-white text-xs font-medium rounded-lg hover:bg-[#BA7815] disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          {busy ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            "Send Feedback"
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingToId(item.id);
                        setFeedbackInput("");
                      }}
                      className="text-[13px] font-medium text-[#DB911E] hover:text-[#BA7815] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Leave mentor feedback</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {resource.data?.length === 0 && (
            <p className="py-6 text-sm text-gray-500">No reflections yet.</p>
          )}
        </>
      )}
    </>
  );

  if (role === "MENTOR") {
    return (
      <div className="w-full pb-10 flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sidebar for Mentees */}
        <div className="w-full md:w-[280px] bg-white border border-gray-200 rounded-[16px] overflow-hidden shrink-0 shadow-[0_2px_12px_rgba(0,0,0,0.02)] sticky top-6">
          <div className="p-4 px-5 border-b border-gray-100">
            <h3 className="text-[13.5px] font-medium text-gray-500 font-sans">
              Mentees
            </h3>
          </div>
          <div className="flex flex-col p-2.5 gap-1">
            <ApiState {...mentees} onRetry={mentees.reload} />
            {mentees.loading ? (
              <QuietParticipantsSkeleton count={3} />
            ) : (
              mentees.data?.map((mentee) => (
                <button
                  key={mentee.id}
                  onClick={() => setSelectedUser(mentee.id)}
                  className={
                    "flex items-center justify-between w-full px-4 py-3 rounded-[12px] text-left transition-colors " +
                    (selectedUser === mentee.id
                      ? "bg-[#0F172A] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50")
                  }
                >
                  <span className="text-[14px] font-medium font-sans">
                    {mentee.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Main Content */}
        <div className="flex-1 w-full space-y-6">
          {/* Send Reflection box */}
          <div className="bg-white border border-gray-200 rounded-[16px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[13.5px] font-medium text-[#34A853] font-sans">
                Send a reflection to {selected?.name || "a mentee"}
              </h2>
            </div>
            <textarea
              value={mentorNote}
              onChange={(e) => setMentorNote(e.target.value)}
              placeholder="Something you've been sitting with..."
              className="w-full h-[120px] p-4 bg-[#F9FAFB] border border-gray-200 rounded-[12px] text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white transition-colors font-sans resize-none mb-4"
            />
            <div className="flex justify-end">
              <button
                type="button"
                disabled={mentorNoteBusy || !mentorNote.trim() || !selectedUser}
                onClick={() => void handleSendMentorReflection()}
                className="disabled:opacity-50 px-5 py-2.5 bg-[#DB911E] text-white rounded-[8px] text-[13px] font-medium font-sans hover:bg-[#BA7815] transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {mentorNoteBusy ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                    Send Reflection
                  </>
                )}
              </button>
            </div>
          </div>

          {selectedUser ? (
            thread
          ) : (
            <p className="text-sm text-gray-500">
              Choose a mentee to read their reflections.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-10 space-y-6">
      {/* Send Reflection Card */}
      <div className="bg-white border border-gray-200 rounded-[16px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <h2 className="text-[14px] font-medium text-gray-700 mb-4 font-sans">
          Send Reflection
        </h2>

        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What is settling in this week?..."
          className="w-full h-[140px] p-4 bg-[#F9FAFB] border border-gray-200 rounded-[12px] text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white transition-colors font-sans resize-none mb-4"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-gray-700 font-sans">
              Mood:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {["Clear", "Steady", "Hopeful", "Tired", "Proud"].map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() =>
                    setActiveMood((curr) => (curr === mood ? "" : mood))
                  }
                  className={`px-3.5 py-1.5 text-[12px] font-medium font-sans rounded-full border transition-all cursor-pointer ${
                    activeMood === mood
                      ? "bg-[#111827] text-white border-[#111827] shadow-xs"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={busy || !body.trim()}
            onClick={send}
            className="disabled:opacity-50 px-5 py-2 bg-[#DB911E] text-white rounded-[8px] text-[13px] font-medium font-sans hover:bg-[#BA7815] transition-colors flex items-center gap-2"
          >
            {busy ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
                Send Reflection
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {thread}
    </div>
  );
}
